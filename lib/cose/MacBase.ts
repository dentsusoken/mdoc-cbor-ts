import { CoseBase } from './CoseBase';
import { generateHmac } from '@/utils/generateHmac';
import { compareUint8Arrays, decodeBase64Url } from 'u8a-utils';
import { Header, MacAlgorithm } from './types';
import { isCoseMacAlgorithm } from './isMacAlgorithm';
import { MAC_ALGORITHM_TO_DIGEST_ALGORITHM } from './constants';
import { JwkOctKey } from '@/jwk/types';
import { MAC_ALGORITHM_TO_JWK_ALGORITHM } from './constants';

/**
 * Parameters for internal MAC verification.
 *
 * @description
 * Configuration object containing the JWK octet key and data required
 * for verifying a COSE MAC (Message Authentication Code) internally.
 */
type InternalVerifyParams = {
  /** The JWK octet key to use for MAC verification */
  jwkOctKey: JwkOctKey;
  /** The data that was MACed, ready for verification (MAC_structure) */
  toBeMaced: Uint8Array;
};

/**
 * Provides shared functionality for COSE MAC (Message Authentication Code) structures.
 *
 * @description
 * Extends {@link CoseBase} to provide MAC-specific functionality using HMAC algorithms.
 * Inherits protected/unprotected header management and adds MAC verification capabilities.
 * This class supports HMAC-based message authentication using symmetric keys for data
 * integrity and authenticity verification.
 *
 * **Supported MAC Algorithms:**
 * - HS256 (HMAC using SHA-256)
 * - HS384 (HMAC using SHA-384)
 * - HS512 (HMAC using SHA-512)
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
 * @see {@link https://datatracker.ietf.org/doc/html/rfc8152#section-6 | RFC 8152 Section 6 - MAC}
 *
 * @example
 * ```typescript
 * // Create a MacBase instance
 * const macBase = new MacBase(
 *   protectedHeadersBytes,
 *   unprotectedHeadersMap,
 *   tagBytes
 * );
 *
 * // Get MAC algorithm
 * const algorithm = macBase.macAlgorithm; // e.g., MacAlgorithms.HS256
 *
 * // Verify MAC internally with JWK octet key
 * const jwkOctKey: JwkOctKey = {
 *   kty: 'oct',
 *   alg: 'HS256',
 *   k: 'base64url-encoded-key'
 * };
 * const isValid = macBase.internalVerify({
 *   jwkOctKey,
 *   toBeMaced: macStructureBytes
 * });
 * ```
 */
export class MacBase extends CoseBase {
  /**
   * The MAC tag (authentication tag) bytes.
   *
   * @description
   * Raw HMAC bytes that authenticate the COSE MAC structure.
   * The length depends on the MAC algorithm used (32 bytes for HS256,
   * 48 bytes for HS384, 64 bytes for HS512).
   */
  readonly tag: Uint8Array;

  /**
   * Creates a new instance of MacBase.
   *
   * @description
   * Initializes the MAC structure with protected headers, unprotected headers,
   * and MAC tag bytes. Calls the parent {@link CoseBase} constructor to decode
   * protected headers automatically.
   *
   * @param protectedHeaders - CBOR-encoded protected headers bytes (bstr)
   * @param unprotectedHeaders - Unprotected headers map
   * @param tag - MAC tag (authentication tag) bytes
   *
   * @example
   * ```typescript
   * const macBase = new MacBase(
   *   new Uint8Array([0xa1, 0x01, 0x05]), // Protected headers (alg: HS256)
   *   new Map([[4, new Uint8Array([0x01, 0x02])]]), // Unprotected headers (kid)
   *   new Uint8Array([0x3a, 0x5f, ...]) // MAC tag (32 bytes for HS256)
   * );
   * ```
   */
  constructor(
    protectedHeaders: Uint8Array,
    unprotectedHeaders: Map<number, unknown>,
    tag: Uint8Array
  ) {
    super(protectedHeaders, unprotectedHeaders);
    this.tag = tag;
  }

  /**
   * Returns the MAC algorithm from headers.
   *
   * @description
   * Retrieves the MAC algorithm identifier from the headers using the inherited
   * {@link CoseBase.getHeader} method. Validates that it is a supported MAC algorithm
   * (HS256, HS384, or HS512). Searches first in protected headers, then in
   * unprotected headers.
   *
   * @returns The MAC algorithm identifier
   * @throws {Error} If the algorithm header is missing or is not a valid MAC algorithm
   *
   * @example
   * ```typescript
   * const algorithm = macBase.macAlgorithm; // MacAlgorithms.HS256 (5)
   *
   * switch (algorithm) {
   *   case MacAlgorithms.HS256:
   *     console.log('Using HMAC-SHA256');
   *     break;
   *   case MacAlgorithms.HS384:
   *     console.log('Using HMAC-SHA384');
   *     break;
   *   case MacAlgorithms.HS512:
   *     console.log('Using HMAC-SHA512');
   *     break;
   * }
   * ```
   */
  get macAlgorithm(): MacAlgorithm {
    const alg = this.getHeader(Header.Algorithm);

    if (!isCoseMacAlgorithm(alg)) {
      throw new Error(`Invalid MAC algorithm: ${alg}`);
    }

    return alg;
  }

  /**
   * Internal method to verify a MAC using a JWK octet key.
   *
   * @description
   * Verifies that the JWK algorithm matches the COSE MAC algorithm, decodes the
   * symmetric key from Base64URL, generates an HMAC, and compares it with the stored
   * tag to verify authenticity. The digest algorithm is automatically selected based
   * on the MAC algorithm (SHA-256 for HS256, SHA-384 for HS384, SHA-512 for HS512).
   *
   * @param params - Verification parameters
   * @param params.jwkOctKey - The JWK octet key to verify with
   * @param params.toBeMaced - The CBOR-encoded MAC_structure bytes that were MACed
   * @returns True if the MAC is valid (tags match), false otherwise
   * @throws {Error} If the JWK algorithm doesn't match the COSE MAC algorithm
   *
   * @example
   * ```typescript
   * const jwkOctKey: JwkOctKey = {
   *   kty: 'oct',
   *   alg: 'HS256',
   *   k: 'base64url-encoded-key'
   * };
   * const macStructure = encodeMacStructure(...); // Encoded MAC_structure
   *
   * const isValid = macBase.internalVerify({
   *   jwkOctKey,
   *   toBeMaced: macStructure
   * });
   *
   * if (isValid) {
   *   console.log('MAC verification successful');
   * } else {
   *   console.log('MAC verification failed');
   * }
   * ```
   */
  internalVerify = ({
    jwkOctKey,
    toBeMaced,
  }: InternalVerifyParams): boolean => {
    const expectedJwkAlg = MAC_ALGORITHM_TO_JWK_ALGORITHM[this.macAlgorithm];

    if (jwkOctKey.alg !== expectedJwkAlg) {
      throw new Error(
        `Algorithm mismatch: expected ${expectedJwkAlg}, got ${jwkOctKey.alg}`
      );
    }

    const key = decodeBase64Url(jwkOctKey.k);
    const digestAlgorithm =
      MAC_ALGORITHM_TO_DIGEST_ALGORITHM[this.macAlgorithm];
    const hmac = generateHmac({
      digestAlgorithm,
      key,
      message: toBeMaced,
    });

    return compareUint8Arrays(hmac, this.tag);
  };
}
