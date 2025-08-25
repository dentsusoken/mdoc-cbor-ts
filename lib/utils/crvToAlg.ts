import { Curve, Algorithms } from '@auth0/cose';

/**
 * Maps COSE curve identifiers to their corresponding JOSE algorithm identifiers
 * @description
 * A utility function that converts COSE curve enum values to their corresponding
 * JSON Web Signature (JWS) algorithm identifiers. This function supports NIST P-curves
 * and Edwards curves commonly used in cryptographic operations.
 *
 * @param crv - The COSE curve identifier to map
 * @returns The corresponding JOSE algorithm identifier, or undefined if not supported
 *
 * @example
 * ```typescript
 * import { Curve } from '@auth0/cose';
 *
 * const algorithm = crvToAlg(Curve['P-256']); // Returns 'ES256'
 * const eddsaAlg = crvToAlg(Curve.Ed25519); // Returns 'EdDSA'
 * const unsupported = crvToAlg(Curve.X25519); // Returns undefined
 * ```
 */
export const crvToAlg = (crv: Curve | undefined): Algorithms | undefined => {
  if (!crv) {
    return undefined;
  }

  switch (crv) {
    case Curve['P-256']:
      return Algorithms.ES256;
    case Curve['P-384']:
      return Algorithms.ES384;
    case Curve['P-521']:
      return Algorithms.ES512;
    case Curve.Ed25519:
    case Curve.Ed448:
      return Algorithms.EdDSA;
    default:
      return undefined;
  }
};
