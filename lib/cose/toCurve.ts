import { isCurve } from './isCurve';
import { Curve } from './types';

/**
 * Converts a value to a valid COSE curve.
 *
 * @param curve - The value to convert to a COSE curve
 * @returns The validated COSE curve
 * @throws {Error} When the provided value is not a valid COSE curve
 *
 * @example
 * ```typescript
 * const curve = toCurve(Curve.P256); // Returns Curve.P256
 * const p384Curve = toCurve(2); // Returns Curve.P384
 *
 * // Throws error for invalid curves
 * toCurve(999); // Throws: Unsupported COSE curve: 999
 * toCurve('P-256'); // Throws: Unsupported COSE curve: P-256
 * ```
 */
export const toCurve = (curve: unknown): Curve => {
  if (isCurve(curve)) {
    return curve;
  }

  throw new Error(`Unsupported COSE curve: ${curve}`);
};
