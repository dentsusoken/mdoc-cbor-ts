import { isJwkCurve } from './isJwkCurve';
import { JwkCurve } from './types';

/**
 * Converts a string to a valid JWK curve.
 *
 * @param curve - The string to convert to a JWK curve
 * @returns The validated JWK curve
 * @throws {Error} When the provided curve is not a valid JWK curve
 *
 * @example
 * ```typescript
 * const curve = toJwkCurve('P-256'); // Returns JwkCurves.P256
 * const edCurve = toJwkCurve('Ed25519'); // Returns JwkCurves.Ed25519
 *
 * // Throws error for invalid curves
 * toJwkCurve('invalid-curve'); // Throws: Unsupported JWK curve: invalid-curve
 * ```
 */
export const toJwkCurve = (curve: string): JwkCurve => {
  if (isJwkCurve(curve)) {
    return curve;
  }

  throw new Error(`Unsupported JWK curve: ${curve}`);
};
