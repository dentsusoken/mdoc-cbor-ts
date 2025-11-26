import { Curve } from '@/cose/types';
import { JwkCurve } from '@/jwk/types';

const JWK_TO_COSE_CURVE: Record<string, number> = {
  [JwkCurve.P256]: Curve.P256,
  [JwkCurve.P384]: Curve.P384,
  [JwkCurve.P521]: Curve.P521,
  [JwkCurve.X25519]: Curve.X25519,
  [JwkCurve.X448]: Curve.X448,
  [JwkCurve.Ed25519]: Curve.Ed25519,
  [JwkCurve.Ed448]: Curve.Ed448,
};

/**
 * Converts a JWK curve to the corresponding COSE curve.
 *
 * @param curve - The JWK curve string to convert
 * @returns The corresponding COSE curve identifier
 * @throws {Error} When the provided curve is not a valid JWK curve or is not a string
 *
 * @example
 * ```typescript
 * const coseCurve = jwkToCoseCurve('P-256'); // Returns Curve.P256 (1)
 * const edCurve = jwkToCoseCurve('Ed25519'); // Returns Curve.Ed25519 (6)
 *
 * // Throws error for invalid curves
 * jwkToCoseCurve('invalid-curve'); // Throws: Unsupported JWK curve: invalid-curve
 * jwkToCoseCurve(null); // Throws: Unsupported JWK curve: null
 * ```
 */
export const jwkToCoseCurve = (curve: unknown): number => {
  if (typeof curve !== 'string') {
    throw new Error(`Unsupported JWK curve: ${curve}`);
  }

  const coseCurve = JWK_TO_COSE_CURVE[curve];

  if (coseCurve == null) {
    throw new Error(`Unsupported JWK curve: ${curve}`);
  }

  return coseCurve;
};
