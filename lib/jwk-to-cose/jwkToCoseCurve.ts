import { Curve } from '@/cose/types';
import { JWK_TO_COSE_CURVE } from './constants';
import { toJwkCurve } from '@/jwk/toJwkCurve';

/**
 * Converts a JWK curve to the corresponding COSE curve.
 *
 * @param curve - The JWK curve string to convert
 * @returns The corresponding COSE curve identifier
 * @throws {Error} When the provided curve is not a valid JWK curve
 *
 * @example
 * ```typescript
 * const coseCurve = jwkToCoseCurve('P-256'); // Returns Curves.P256 (1)
 * const edCurve = jwkToCoseCurve('Ed25519'); // Returns Curves.Ed25519 (6)
 *
 * // Throws error for invalid curves
 * jwkToCoseCurve('invalid-curve'); // Throws: Unsupported JWK curve: invalid-curve
 * ```
 */
export const jwkToCoseCurve = (curve: string): Curve => {
  return JWK_TO_COSE_CURVE[toJwkCurve(curve)];
};
