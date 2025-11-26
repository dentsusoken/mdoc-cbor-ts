import { JwkKeyType } from '@/jwk/types';
import { KeyType } from '@/cose/types';

/**
 * Mapping from COSE (CBOR Object Signing and Encryption) key type to JWK (JSON Web Key) key type.
 *
 * @description
 * This constant provides a direct mapping between COSE key type identifier and its corresponding
 * JWK key type identifier. COSE uses numeric identifier as defined in the IANA COSE Key Types registry
 * while JWK uses string-based key type name.
 *
 * @example
 * ```typescript
 * // Convert COSE key type to JWK key type
 * const jwkKeyType = COSE_TO_JWK_KEY_TYPE[KeyType.EC]; // Returns 'EC'
 *
 * // Use in JWK key construction
 * const jwk = {
 *   kty: COSE_TO_JWK_KEY_TYPE[KeyType.EC],
 *   // ...
 * };
 * ```
 *
 * @see {@link KeyType} - COSE key type numeric identifiers
 * @see {@link JwkKeyType} - JWK key type string identifiers
 * @see {@link https://www.iana.org/assignments/cose/cose.xhtml#key-type} - IANA COSE Key Types registry
 * @see {@link https://tools.ietf.org/html/rfc7517#section-4.1} - JWK key type specifications
 */
export const COSE_TO_JWK_KEY_TYPE: Record<KeyType, JwkKeyType> = {
  [KeyType.OKP]: JwkKeyType.OKP,
  [KeyType.EC]: JwkKeyType.EC,
  [KeyType.oct]: JwkKeyType.oct,
};
