import { COSEKey, COSEKeyParam, Headers, ProtectedHeaders } from '@auth0/cose';

/**
 * Type definition for building protected headers
 * @description
 * A function that creates protected headers for a COSE message using the provided COSE key.
 * The function extracts the algorithm and key ID from the COSE key and creates
 * the corresponding protected headers.
 *
 * @param coseKey - The COSE key containing algorithm and key ID information
 * @returns The created ProtectedHeaders object
 */
export type BuildProtectedHeaders = (coseKey: COSEKey) => ProtectedHeaders;

/**
 * Creates protected headers for a COSE message
 * @description
 * Extracts algorithm and key ID from the provided COSE key and creates
 * protected headers with these values. Throws an error if either the
 * algorithm or key ID is missing from the COSE key.
 *
 * @example
 * ```typescript
 * const protectedHeaders = buildProtectedHeaders(coseKey);
 * ```
 */
export const buildProtectedHeaders: BuildProtectedHeaders = (coseKey) => {
  const alg = coseKey.get(COSEKeyParam.Algorithm);
  const kid = coseKey.get(COSEKeyParam.KeyID);
  if (!alg) {
    throw new Error('Algorithm not found');
  }
  if (!kid) {
    throw new Error('Key ID not found');
  }

  return new ProtectedHeaders([
    [Headers.Algorithm, alg],
    [Headers.KeyID, kid],
  ]);
};
