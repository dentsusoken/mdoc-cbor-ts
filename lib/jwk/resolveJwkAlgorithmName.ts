import { JwkAlgorithm, JwkCurve } from './types';

/**
 * Mapping from JWK EC curve to JWK EC algorithm.
 * Used to derive algorithm from curve when algorithm is missing in JWK.
 */
const JWK_EC_CURVE_TO_JWK_EC_ALGORITHM: Record<string, string> = {
  [JwkCurve.P256]: JwkAlgorithm.ES256,
  [JwkCurve.P384]: JwkAlgorithm.ES384,
  [JwkCurve.P521]: JwkAlgorithm.ES512,
};

/**
 * Parameters for resolving algorithm name from JWK fields.
 */
export type ResolveJwkAlgorithmNameParams = {
  /** The `alg` field from a JWK (may be undefined). */
  algorithmName?: string;
  /** The `crv` field from a JWK (may be undefined). */
  curveName?: string;
};

/**
 * Resolves the algorithm name from a JWK's `alg` or `crv` field.
 *
 * @description
 * This function attempts to determine the algorithm name from a JWK object.
 * It first checks if `algorithmName` is provided. If `algorithmName` is missing or undefined,
 * it attempts to derive the algorithm from `curveName` for EC keys:
 * - P-256 → ES256
 * - P-384 → ES384
 * - P-521 → ES512
 *
 * If neither `algorithmName` nor `curveName` can be used to determine the algorithm, an error is thrown.
 *
 * @param params - The parameters containing algorithm and curve names.
 * @param params.algorithmName - The `alg` field from a JWK (may be undefined).
 * @param params.curveName - The `crv` field from a JWK (may be undefined).
 * @returns The resolved algorithm name as a string.
 * @throws {Error} If the algorithm cannot be determined (both `algorithmName` and `curveName` are missing or invalid).
 *
 * @example
 * ```typescript
 * // With explicit algorithm
 * const algorithm1 = resolveAlgorithmName({ algorithmName: 'ES256', curveName: 'P-256' });
 * // Returns 'ES256'
 *
 * // Algorithm derived from curve
 * const algorithm2 = resolveAlgorithmName({ curveName: 'P-256' });
 * // Returns 'ES256' (derived from P-256)
 *
 * // Missing both (throws error)
 * const algorithm3 = resolveAlgorithmName({});
 * // Throws Error: Missing algorithm in JWK
 * ```
 */
export const resolveJwkAlgorithmName = ({
  algorithmName,
  curveName,
}: ResolveJwkAlgorithmNameParams): string => {
  const resolvedAlg =
    algorithmName ??
    (curveName ? JWK_EC_CURVE_TO_JWK_EC_ALGORITHM[curveName] : undefined);

  if (resolvedAlg == null) {
    throw new Error('Missing algorithm in JWK');
  }

  return resolvedAlg;
};
