import { Curve } from '@/cose/types';
import { JwkCurve } from '@/jwk/types';

const COSE_TO_JWK_CURVE: Record<number, string> = {
  [Curve.P256]: JwkCurve.P256,
  [Curve.P384]: JwkCurve.P384,
  [Curve.P521]: JwkCurve.P521,
  [Curve.X25519]: JwkCurve.X25519,
  [Curve.X448]: JwkCurve.X448,
  [Curve.Ed25519]: JwkCurve.Ed25519,
  [Curve.Ed448]: JwkCurve.Ed448,
};

/**
 * Converts a COSE curve to the corresponding JWK curve.
 *
 * @param coseCurve - The COSE curve number to convert
 * @returns The corresponding JWK curve identifier
 * @throws {Error} When the provided coseCurve is not a valid COSE curve or is not a number
 *
 * @example
 * ```typescript
 * const jwkCurve = coseToJwkCurve(Curve.P256); // Returns 'P-256'
 * const edCurve = coseToJwkCurve(Curve.Ed25519); // Returns 'Ed25519'
 *
 * // Throws error for invalid curves
 * coseToJwkCurve(999); // Throws: Unsupported COSE curve for JWK conversion: 999
 * coseToJwkCurve(null); // Throws: Unsupported COSE curve for JWK conversion: null
 * ```
 */
export const coseToJwkCurve = (coseCurve: unknown): JwkCurve => {
  if (typeof coseCurve !== 'number') {
    throw new Error(`Unsupported COSE curve for JWK conversion: ${coseCurve}`);
  }

  const jwkCurve = COSE_TO_JWK_CURVE[coseCurve];

  if (jwkCurve == null) {
    throw new Error(`Unsupported COSE curve for JWK conversion: ${coseCurve}`);
  }

  return jwkCurve as JwkCurve;
};
