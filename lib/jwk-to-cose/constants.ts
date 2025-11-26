import { JwkKeyType } from '@/jwk/types';
import { KeyType } from '@/cose/types';

/**
 * Mapping from JWK (JSON Web Key) key type to COSE (CBOR Object Signing and Encryption) key type.
 *
 * @description
 * This constant provides a direct mapping between JWK key type identifier and its corresponding
 * COSE key type identifier. JWK uses string-based key type name while COSE uses numeric identifier
 * as defined in the IANA COSE Key Types registry.
 *
 * @example
 * ```typescript
 * // Convert JWK key type to COSE key type
 * const coseKeyType = JWK_TO_COSE_KEY_TYPE[JwkKeyType.EC]; // Returns 2
 *
 * // Use in COSE key construction
 * const coseKey = new Map([[1, JWK_TO_COSE_KEY_TYPE[JwkKeyType.EC]]]); // kty parameter
 * ```
 *
 * @see {@link JwkKeyType} - JWK key type string identifiers
 * @see {@link KeyType} - COSE key type numeric identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-type} - IANA COSE Key Types registry
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.1} - JWK key type specifications
 */
export const JWK_TO_COSE_KEY_TYPE: Record<string, number> = {
  [JwkKeyType.OKP]: KeyType.OKP,
  [JwkKeyType.EC]: KeyType.EC,
  [JwkKeyType.oct]: KeyType.oct,
};
