import { decodeCbor } from '@/cbor/codec';
import {
  createSignatureCurveRngDisallowed,
  JwkPublicKey,
} from 'noble-curves-extended';
import { Headers } from '@/cose/types';
import { derBytesToX509 } from '@/x509/derBytesToX509';
import { verifyX509s } from '@/x509/verifyX509s';
import { KEYUTIL } from 'jsrsasign';

/**
 * Options for verifying COSE signatures.
 *
 * @description
 * Configuration options that can be provided when verifying COSE signatures.
 * These options allow for customization of the verification process including
 * external additional authenticated data, detached payloads, and algorithm restrictions.
 */
export type VerifyOptions = {
  /** External Additional Authenticated Data to include in verification */
  externalAad?: Uint8Array;
  /** Detached payload data when the payload is not embedded in the COSE structure */
  detachedPayload?: Uint8Array;
};

/**
 * Parameters for internal signature verification.
 *
 * @description
 * Configuration object containing the public key and data required
 * for verifying a COSE signature internally.
 */
type InternalVerifyParams = {
  /** The JWK public key to use for signature verification */
  jwkPublicKey: JwkPublicKey;
  /** The data that was signed, ready for verification */
  toBeSigned: Uint8Array;
};

/**
 * Provides shared functionality for COSE signature structures.
 *
 * @description
 * This class manages protected and unprotected headers along with the
 * signature bytes. It also offers utilities to extract the X.509
 * certificate chain from headers, verify the chain, and derive the
 * corresponding public key in JWK format.
 *
 * @example
 * ```typescript
 * // Create a SignBase instance
 * const signBase = new SignBase(
 *   protectedHeadersBytes,
 *   unprotectedHeadersMap,
 *   signatureBytes
 * );
 *
 * // Get X.509 certificate chain
 * const certChain = signBase.x5c;
 *
 * // Verify certificate chain and get public key
 * const publicKey = signBase.verifyX509Chain();
 *
 * // Verify signature internally
 * const isValid = signBase.internalVerify({
 *   jwkPublicKey: publicKey,
 *   toBeSigned: dataToVerify
 * });
 * ```
 */
export class SignBase {
  /** CBOR-encoded protected headers (bstr). */
  readonly protectedHeaders: Uint8Array;
  /** Unprotected headers. */
  readonly unprotectedHeaders: Map<number, unknown>;
  /** Decoded protected headers as a Map. */
  readonly decodedProtectedHeaders: Map<number, unknown>;
  /** COSE signature bytes. */
  readonly signature: Uint8Array;

  /**
   * Creates a new instance of SignBase.
   *
   * @param protectedHeaders - CBOR-encoded protected headers bytes (bstr)
   * @param unprotectedHeaders - Unprotected headers map
   * @param signature - Signature bytes
   *
   * @example
   * ```typescript
   * const signBase = new SignBase(
   *   new Uint8Array([0xa1, 0x01, 0x26]), // Protected headers
   *   new Map([[1, -7]]), // Unprotected headers
   *   new Uint8Array([0x30, 0x45, ...]) // Signature
   * );
   * ```
   */
  constructor(
    protectedHeaders: Uint8Array,
    unprotectedHeaders: Map<number, unknown>,
    signature: Uint8Array
  ) {
    this.protectedHeaders = protectedHeaders;
    this.decodedProtectedHeaders = decodeCbor(protectedHeaders) as Map<
      number,
      unknown
    >;
    this.unprotectedHeaders = unprotectedHeaders;
    this.signature = signature;
  }

  /**
   * Returns the X.509 certificate chain (x5c) from headers.
   *
   * @description
   * The order is expected to be: leaf first, followed by intermediates, then root.
   * Searches first in protected headers, then in unprotected headers.
   *
   * @returns Array of DER-encoded certificate bytes
   * @throws {Error} If no X.509 certificate chain is present in headers
   *
   * @example
   * ```typescript
   * const certChain = signBase.x5c;
   * console.log(`Found ${certChain.length} certificates in chain`);
   * ```
   */
  get x5c(): Uint8Array[] {
    const x5c = (this.decodedProtectedHeaders.get(Headers.X5Chain) ??
      this.unprotectedHeaders.get(Headers.X5Chain)) as Uint8Array[];

    if (!x5c || x5c.length === 0) {
      throw new Error('X509 certificate not found');
    }

    return x5c;
  }

  /**
   * Verifies the X.509 certificate chain and returns the leaf public key as a JWK.
   *
   * @description
   * Parses each certificate in the chain, verifies the chain integrity using
   * {@link verifyX509s}, and extracts the public key from the leaf certificate.
   *
   * @returns Leaf certificate public key in JWK format
   * @throws {Error} If the certificate chain is invalid or verification fails
   * @throws {Error} If any certificate in the chain cannot be parsed
   *
   * @example
   * ```typescript
   * try {
   *   const publicKey = signBase.verifyX509Chain();
   *   console.log('Chain verified, public key:', publicKey);
   * } catch (error) {
   *   console.error('Chain verification failed:', error.message);
   * }
   * ```
   */
  verifyX509Chain(): JwkPublicKey {
    const { x5c } = this;
    const x509s = x5c.map((c) => {
      try {
        return derBytesToX509(c);
      } catch (error) {
        console.error(error);
        throw new Error('Failed to parse X.509 certificate');
      }
    });
    const verified = verifyX509s(x509s);

    if (!verified.every((v) => v)) {
      throw new Error('Invalid X.509 certificate chain');
    }

    const publicKey = x509s[0].getPublicKey();

    return KEYUTIL.getJWK(publicKey) as JwkPublicKey;
  }

  /**
   * Internal method to verify a signature using a JWK public key.
   *
   * @description
   * Creates a signature curve instance based on the public key's curve type,
   * converts the JWK to raw format, and verifies the signature against the
   * provided message data.
   *
   * @param params - Verification parameters
   * @param params.jwkPublicKey - The JWK public key to verify with
   * @param params.toBeSigned - The CBOR-encoded Sig_structure bytes that were signed
   * @returns True if the signature is valid, false otherwise
   *
   * @example
   * ```typescript
   * const isValid = signBase.internalVerify({
   *   jwkPublicKey: publicKey,
   *   toBeSigned: sigStructureBytes
   * });
   *
   * if (isValid) {
   *   console.log('Signature verification successful');
   * } else {
   *   console.log('Signature verification failed');
   * }
   * ```
   */
  internalVerify = ({
    jwkPublicKey,
    toBeSigned,
  }: InternalVerifyParams): boolean => {
    const curve = createSignatureCurveRngDisallowed(jwkPublicKey.crv);
    const publicKey = curve.toRawPublicKey(jwkPublicKey);

    return curve.verify({
      publicKey,
      message: toBeSigned,
      signature: this.signature,
    });
  };
}
