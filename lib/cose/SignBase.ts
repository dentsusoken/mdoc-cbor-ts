import {
  createSignatureCurveRngDisallowed,
  JwkPublicKey,
} from 'noble-curves-extended';
import { Header } from '@/cose/types';
import { derBytesToX509 } from '@/x509/derBytesToX509';
import { verifyX5Chain, VerifyX5ChainOptions } from '@/x509/verifyX5Chain';
import { KEYUTIL } from 'jsrsasign';
import { CoseBase } from './CoseBase';

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
 * Extends {@link CoseBase} to provide signature-specific functionality.
 * Inherits protected/unprotected header management and adds signature
 * verification capabilities. This class offers utilities to extract the
 * X.509 certificate chain from headers, verify the chain, and verify
 * signatures using the corresponding public key in JWK format.
 *
 * **Inherited Properties:**
 * - `protectedHeaders` - CBOR-encoded protected headers (bstr)
 * - `decodedProtectedHeaders` - Decoded protected headers as a Map
 * - `unprotectedHeaders` - Unprotected headers as a Map
 *
 * **Inherited Methods:**
 * - `getHeader(label)` - Retrieves a header value by label
 *
 * @see {@link CoseBase} for base header management functionality
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
 * const certChain = signBase.x5chain;
 *
 * // Verify certificate chain and get public key
 * const publicKey = signBase.verifyX5Chain();
 *
 * // Verify signature internally
 * const isValid = signBase.internalVerify({
 *   jwkPublicKey: publicKey,
 *   toBeSigned: dataToVerify
 * });
 * ```
 */
export class SignBase extends CoseBase {
  /**
   * The cryptographic signature bytes.
   *
   * @description
   * Raw signature bytes that authenticate the COSE structure.
   * The format depends on the signing algorithm used.
   */
  readonly signature: Uint8Array;

  /**
   * Creates a new instance of SignBase.
   *
   * @description
   * Initializes the signature structure with protected headers, unprotected headers,
   * and signature bytes. Calls the parent {@link CoseBase} constructor to decode
   * protected headers automatically.
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
    super(protectedHeaders, unprotectedHeaders);
    this.signature = signature;
  }

  /**
   * Returns the X.509 certificate chain (x5chain) from COSE headers.
   *
   * @description
   * Retrieves the X.509 certificate chain using the inherited {@link CoseBase.getHeader}
   * method. The order is expected to be: leaf certificate first, followed by
   * intermediate certificates, then root certificate. Searches first in protected
   * headers, then in unprotected headers.
   *
   * Returns `undefined` if no X.509 certificate chain is present, which is valid
   * for Device Authentication where certificates are not used.
   *
   * @returns Array of DER-encoded certificate bytes, or `undefined` if not present
   *
   * @example
   * ```typescript
   * const certChain = signBase.x5chain;
   * if (certChain) {
   *   console.log(`Found ${certChain.length} certificates in chain`);
   * } else {
   *   console.log('No certificate chain (e.g., Device Authentication)');
   * }
   * ```
   */
  get x5chain(): Uint8Array[] | undefined {
    const x5cHeader = this.getHeader(Header.X5Chain);

    if (!x5cHeader) {
      return undefined;
    }

    // Handle both single certificate and array of certificates
    const x5c = Array.isArray(x5cHeader) ? x5cHeader : [x5cHeader];

    if (x5c.length === 0) {
      return undefined;
    }

    return x5c as Uint8Array[];
  }

  /**
   * Verifies the X.509 certificate chain (x5chain) in the COSE headers and returns the leaf's JWK public key.
   *
   * @description
   * This method parses the DER-encoded certificates from the COSE x5chain header, validates the
   * time validity and cryptographic signature of each certificate using {@link verifyX5Chain},
   * and returns the public key from the leaf certificate (converted to a JWK).
   *
   * Throws if the chain is missing, a certificate fails to parse, or the chain is invalid.
   *
   * @param options - Options for certificate chain verification (see {@link VerifyX5ChainOptions}).
   * @returns {JwkPublicKey} The JWK public key from the leaf certificate.
   *
   * @throws {Error} If the X.509 chain is not found, a certificate fails to parse, or validation fails.
   *
   * @example
   * ```typescript
   * try {
   *   const jwk = signBase.verifyX5Chain();
   *   // Use jwk for further signature or payload verification
   * } catch (e) {
   *   console.error('X.509 chain validation failed', e);
   * }
   * ```
   */
  verifyX5Chain(options: VerifyX5ChainOptions = {}): JwkPublicKey {
    const { x5chain } = this;

    if (!x5chain) {
      throw new Error('X.509 certificate chain not found');
    }

    const x509s = x5chain.map((c, index) => {
      try {
        return derBytesToX509(c);
      } catch (error) {
        console.error(error);
        throw new Error(`Failed to parse X.509 certificate[${index}]`);
      }
    });
    verifyX5Chain(x509s, options);

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
