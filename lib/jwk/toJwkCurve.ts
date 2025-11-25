import { isJwkCurve } from './isJwkCurve';
import { JwkCurve } from './types';

/**
 * Converts a value to a valid JWK curve.
 *
 * @param curve - The value to convert to a JWK curve
 * @returns The validated JWK curve
 * @throws {Error} When the provided value is not a valid JWK curve
 *
 * @example
 * ```typescript
 * const curve = toJwkCurve(JwkCurve.P256); // Returns JwkCurve.P256
 * const ed25519Curve = toJwkCurve('Ed25519'); // Returns JwkCurve.Ed25519
 *
 * // Throws error for invalid curves
 * toJwkCurve(999); // Throws: Unsupported JWK curve: 999
 * toJwkCurve('InvalidCurve'); // Throws: Unsupported JWK curve: InvalidCurve
 * ```
 */
export const toJwkCurve = (curve: unknown): JwkCurve => {
  if (isJwkCurve(curve)) {
    return curve;
  }

  throw new Error(`Unsupported JWK curve: ${curve}`);
};
