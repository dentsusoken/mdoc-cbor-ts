import { EcPublicJwk } from '@/jwk/types';
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
 * - `keyId` is the optional UTF-8 encoded bytes of JWK `kid`.
 */
type JwkToCoseCurveAlgorithmKeyIdResult = {
  curve: Curves;
  algorithm: Algorithms;
  keyId?: Uint8Array;
};

const encoder = new TextEncoder();

/**
 * Converts an EC public JWK's metadata (`crv`, optional `alg`, optional `kid`)
 * into COSE curve, algorithm, and optional key identifier bytes.
 *
 * Behavior:
 * - Throws if `crv` is missing or null.
 * - If `alg` is provided, maps it to a COSE algorithm; otherwise uses the
 *   canonical algorithm for the resolved curve.
 * - If `kid` is present, encodes it as UTF-8 bytes for COSE `kid`.
 *
 * @param jwk EC public JWK containing `crv` and optional `alg` and `kid`.
 * @returns Object with COSE `curve`, `algorithm`, and optional `keyId`.
 */
export const jwkToCoseCurveAlgorithmKeyId = (
  jwk: EcPublicJwk
): JwkToCoseCurveAlgorithmKeyIdResult => {
  if (jwk.crv == null) {
    throw new Error('Missing curve in EC public key');
  }

  const curve = jwkToCoseCurve(jwk.crv);

  const algorithm = jwk.alg
    ? jwkToCoseAlgorithm(jwk.alg)
    : CURVES_TO_ALGORITHMS[curve];

  const keyId = jwk.kid ? encoder.encode(jwk.kid) : undefined;

  return { curve, algorithm, keyId };
};
