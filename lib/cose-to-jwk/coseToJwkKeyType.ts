import { KeyType } from '@/cose/types';
import { JwkKeyType } from '@/jwk/types';

const COSE_TO_JWK_KEY_TYPE: Record<number, string> = {
  [KeyType.OKP]: JwkKeyType.OKP,
  [KeyType.EC]: JwkKeyType.EC,
  [KeyType.oct]: JwkKeyType.oct,
};

/**
 * Converts a COSE key type to the corresponding JWK key type.
 *
 * @param coseKeyType - The COSE key type number to convert
 * @returns The corresponding JWK key type identifier
 * @throws {Error} When the provided coseKeyType is not a valid COSE key type or is not a number
 *
 * @example
 * ```typescript
 * const jwkKeyType = coseToJwkKeyType(KeyType.EC); // Returns 'EC'
 * const octKeyType = coseToJwkKeyType(KeyType.oct); // Returns 'oct'
 *
 * // Throws error for invalid key types
 * coseToJwkKeyType(999); // Throws: Unsupported COSE key type for JWK conversion: 999
 * coseToJwkKeyType(null); // Throws: Unsupported COSE key type for JWK conversion: null
 * ```
 */
export const coseToJwkKeyType = (coseKeyType: unknown): JwkKeyType => {
  if (typeof coseKeyType !== 'number') {
    throw new Error(
      `Unsupported COSE key type for JWK conversion: ${coseKeyType}`
    );
  }

  const jwkKeyType = COSE_TO_JWK_KEY_TYPE[coseKeyType];

  if (jwkKeyType == null) {
    throw new Error(
      `Unsupported COSE key type for JWK conversion: ${coseKeyType}`
    );
  }

  return jwkKeyType as JwkKeyType;
};
