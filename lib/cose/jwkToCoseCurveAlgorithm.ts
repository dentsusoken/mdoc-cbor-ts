import { JwkBase } from '@/jwk/types';
import { jwkToCoseAlgorithm } from './jwkToCoseAlgorithm';
import { CURVES_TO_ALGORITHMS } from './constants';
import { jwkToCoseCurve } from './jwkToCoseCurve';
import { Algorithms, Curves } from './types';

/**
 * Result of converting EC JWK metadata into COSE parameters.
 *
 * - `curve` is the COSE curve derived from the JWK `crv` value.
 * - `algorithm` is the COSE algorithm derived from JWK `alg`,
 *   or the default algorithm for the resolved curve if `alg` is absent.
 */
type JwkToCoseCurveAlgorithmResult = {
  curve: Curves;
  algorithm: Algorithms;
};

/**
 * Converts an EC JWK's metadata (`crv`, optional `alg`) into COSE curve and algorithm.
 *
 * This function supports both public and private EC JWKs, extracting only the curve
 * and algorithm information needed for COSE operations.
 *
 * Behavior:
 * - Throws if `crv` is missing or null.
 * - If `alg` is provided, maps it to a COSE algorithm; otherwise uses the
 *   canonical algorithm for the resolved curve.
 *
 * @param jwk EC JWK (public or private) containing `crv` and optional `alg`.
 * @returns Object with COSE `curve` and `algorithm`.
 */
export const jwkToCoseCurveAlgorithm = (
  jwk: JwkBase
): JwkToCoseCurveAlgorithmResult => {
  if (jwk.crv == null) {
    throw new Error('Missing curve in EC key');
  }

  const curve = jwkToCoseCurve(jwk.crv);

  const algorithm = jwk.alg
    ? jwkToCoseAlgorithm(jwk.alg)
    : CURVES_TO_ALGORITHMS[curve];

  return { curve, algorithm };
};
