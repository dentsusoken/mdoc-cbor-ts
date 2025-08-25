import { describe, it, expect } from 'vitest';
import { Curve, Algorithms } from '@auth0/cose';
import { crvToAlg } from '../crvToAlg';

/**
 * Tests for crvToAlg utility
 */

describe('crvToAlg', () => {
  it('should map NIST P-256 to ES256', () => {
    expect(crvToAlg(Curve['P-256'])).toBe(Algorithms.ES256);
  });

  it('should map NIST P-384 to ES384', () => {
    expect(crvToAlg(Curve['P-384'])).toBe(Algorithms.ES384);
  });

  it('should map NIST P-521 to ES512', () => {
    expect(crvToAlg(Curve['P-521'])).toBe(Algorithms.ES512);
  });

  it('should map Ed25519 to EdDSA', () => {
    expect(crvToAlg(Curve.Ed25519)).toBe(Algorithms.EdDSA);
  });

  it('should map Ed448 to EdDSA', () => {
    expect(crvToAlg(Curve.Ed448)).toBe(Algorithms.EdDSA);
  });

  it('should return undefined for unsupported curve identifiers', () => {
    expect(crvToAlg(Curve.X25519)).toBeUndefined();
    expect(crvToAlg(Curve.X448)).toBeUndefined();
    expect(crvToAlg(999 as unknown as Curve)).toBeUndefined();
  });

  it('should return undefined when input is undefined', () => {
    expect(crvToAlg(undefined)).toBeUndefined();
  });
});
