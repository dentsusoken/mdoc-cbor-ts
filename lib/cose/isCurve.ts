import { Curve } from './types';

/**
 * Checks if a given value is a valid COSE curve.
 *
 * @param curve - The value to check
 * @returns True if the value is a valid COSE curve, false otherwise
 *
 * @example
 * ```typescript
 * isCurve(Curve.P256); // Returns true
 * isCurve(1); // Returns true (P256)
 * isCurve('P-256'); // Returns false (not a number)
 * isCurve(999); // Returns false (not a valid curve)
 * ```
 */
export const isCurve = (curve: unknown): curve is Curve => {
  if (typeof curve !== 'number') {
    return false;
  }

  return Object.values(Curve).includes(curve);
};
