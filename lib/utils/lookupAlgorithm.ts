import { Algorithms } from '@auth0/cose';

/**
 * Looks up the algorithm name from its COSE algorithm number
 * @description
 * A utility function that converts a COSE algorithm number to its corresponding
 * algorithm name. This function supports various signature algorithms including
 * EdDSA, ES256/384/512, PS256/384/512, and RS256/384/512.
 *
 * @param number - The COSE algorithm number to look up
 * @returns The corresponding algorithm name as a string
 * @throws {Error} If the provided algorithm number is not supported
 *
 * @example
 * ```typescript
 * const algorithm = lookupAlgorithm(-7); // Returns 'ES256'
 * ```
 */
export const lookupAlgorithm = (number?: Algorithms): string => {
  switch (number) {
    case -8:
      return 'EdDSA';
    case -7:
      return 'ES256';
    case -35:
      return 'ES384';
    case -36:
      return 'ES512';
    case -37:
      return 'PS256';
    case -38:
      return 'PS384';
    case -39:
      return 'PS512';
    case -257:
      return 'RS256';
    case -258:
      return 'RS384';
    case -259:
      return 'RS512';
    default:
      throw new Error('Invalid algorithm');
  }
};
