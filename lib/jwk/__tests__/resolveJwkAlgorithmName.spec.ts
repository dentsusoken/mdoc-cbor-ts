import { describe, it, expect } from 'vitest';
import { resolveJwkAlgorithmName } from '../resolveJwkAlgorithmName';
import { JwkAlgorithm, JwkCurve } from '../types';

describe('resolveJwkAlgorithmName', () => {
  describe('should return correct algorithm for valid inputs', () => {
    it('for explicit algorithm (ES256)', () => {
      const result = resolveJwkAlgorithmName({
        algorithmName: JwkAlgorithm.ES256,
        curveName: JwkCurve.P256,
      });
      expect(result).toBe(JwkAlgorithm.ES256);
    });

    it('for explicit algorithm (ES384)', () => {
      const result = resolveJwkAlgorithmName({
        algorithmName: JwkAlgorithm.ES384,
        curveName: JwkCurve.P384,
      });
      expect(result).toBe(JwkAlgorithm.ES384);
    });

    it('for explicit algorithm (ES512)', () => {
      const result = resolveJwkAlgorithmName({
        algorithmName: JwkAlgorithm.ES512,
        curveName: JwkCurve.P521,
      });
      expect(result).toBe(JwkAlgorithm.ES512);
    });

    it('for algorithm derived from P-256 curve', () => {
      const result = resolveJwkAlgorithmName({ curveName: JwkCurve.P256 });
      expect(result).toBe(JwkAlgorithm.ES256);
    });

    it('for algorithm derived from P-384 curve', () => {
      const result = resolveJwkAlgorithmName({ curveName: JwkCurve.P384 });
      expect(result).toBe(JwkAlgorithm.ES384);
    });

    it('for algorithm derived from P-521 curve', () => {
      const result = resolveJwkAlgorithmName({ curveName: JwkCurve.P521 });
      expect(result).toBe(JwkAlgorithm.ES512);
    });

    it('for explicit algorithm takes precedence over curve', () => {
      const result = resolveJwkAlgorithmName({
        algorithmName: JwkAlgorithm.ES256,
        curveName: JwkCurve.P384,
      });
      expect(result).toBe(JwkAlgorithm.ES256);
    });
  });

  describe('should throw Error for invalid inputs', () => {
    it('for missing both algorithm and curve', () => {
      expect(() => resolveJwkAlgorithmName({})).toThrow(
        'Missing algorithm in JWK'
      );
    });

    it('for undefined algorithmName and undefined curveName', () => {
      expect(() =>
        resolveJwkAlgorithmName({
          algorithmName: undefined,
          curveName: undefined,
        })
      ).toThrow('Missing algorithm in JWK');
    });

    it('for null algorithmName and undefined curveName', () => {
      expect(() =>
        resolveJwkAlgorithmName({
          algorithmName: null as unknown as string,
          curveName: undefined,
        })
      ).toThrow('Missing algorithm in JWK');
    });

    it('for undefined algorithmName and null curveName', () => {
      expect(() =>
        resolveJwkAlgorithmName({
          algorithmName: undefined,
          curveName: null as unknown as string,
        })
      ).toThrow('Missing algorithm in JWK');
    });

    it('for undefined algorithmName and unsupported curve', () => {
      expect(() =>
        resolveJwkAlgorithmName({ curveName: JwkCurve.Ed25519 })
      ).toThrow('Missing algorithm in JWK');
    });

    it('for undefined algorithmName and invalid curve string', () => {
      expect(() =>
        resolveJwkAlgorithmName({ curveName: 'invalid-curve' })
      ).toThrow('Missing algorithm in JWK');
    });
  });
});
