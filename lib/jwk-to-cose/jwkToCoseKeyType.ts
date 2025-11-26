import { KeyType } from '@/cose/types';
import { JwkKeyType } from '@/jwk/types';

const JWK_TO_COSE_KEY_TYPE: Record<string, number> = {
  [JwkKeyType.OKP]: KeyType.OKP,
  [JwkKeyType.EC]: KeyType.EC,
  [JwkKeyType.oct]: KeyType.oct,
};

/**
 * Converts a JWK key type to the corresponding COSE key type.
 *
 * @param jwkKeyType - The JWK key type string to convert
 * @returns The corresponding COSE key type identifier
 * @throws {Error} When the provided jwkKeyType is not a valid JWK key type or is not a string
 *
 * @example
 * ```typescript
 * const coseKeyType = jwkToCoseKeyType('EC'); // Returns KeyType.EC (2)
 * const octKeyType = jwkToCoseKeyType('oct'); // Returns KeyType.oct (4)
 *
 * // Throws error for invalid key types
 * jwkToCoseKeyType('RSA'); // Throws: Unsupported JWK key type: RSA
 * jwkToCoseKeyType(null); // Throws: Unsupported JWK key type: null
 * ```
 */
export const jwkToCoseKeyType = (jwkKeyType: unknown): number => {
  if (typeof jwkKeyType !== 'string') {
    throw new Error(`Unsupported JWK key type: ${jwkKeyType}`);
  }

  const coseKeyType = JWK_TO_COSE_KEY_TYPE[jwkKeyType];

  if (coseKeyType == null) {
    throw new Error(`Unsupported JWK key type: ${jwkKeyType}`);
  }

  return coseKeyType;
};
