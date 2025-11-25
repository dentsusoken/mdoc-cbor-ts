import { COSE_TO_JWK_CURVE } from './constants';
import { toCurve } from '@/cose/toCurve';
import { JwkCurve } from '@/jwk/types';

/**
 * Converts a COSE curve to the corresponding JWK curve.
 *
 * @param curve - The COSE curve to convert (number or Curve enum value)
 * @returns The corresponding JWK curve identifier
 * @throws {Error} When the provided curve is not a valid COSE curve
 *
 * @example
 * ```typescript
 * const jwkCurve = coseToJwkCurve(Curve.P256); // Returns JwkCurve.P256 ('P-256')
 * const edCurve = coseToJwkCurve(6); // Returns JwkCurve.Ed25519 ('Ed25519')
 *
 * // Throws error for invalid curves
 * coseToJwkCurve(999); // Throws: Unsupported COSE curve: 999
 * coseToJwkCurve('P-256'); // Throws: Unsupported COSE curve: P-256
 * ```
 */
export const coseToJwkCurve = (curve: unknown): JwkCurve => {
  const coseCurve = toCurve(curve);
  return COSE_TO_JWK_CURVE[coseCurve];
};
