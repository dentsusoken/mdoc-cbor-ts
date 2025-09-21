import { describe, it, expect } from 'vitest';
import { jwkToCoseCurveAlgorithmKeyId } from '../jwkToCoseCurveAlgorithmKeyId';
import { Algorithms, Curves } from '../types';
import { EcPublicJwk, JwkAlgorithms, JwkCurves } from '@/jwk/types';

// Helper to create a base EC public JWK with overrides
const createJwk = (overrides: Partial<EcPublicJwk> = {}): EcPublicJwk => ({
  kty: 'EC',
  crv: 'P-256',
  x: 'x',
  y: 'y',
  ...overrides,
});

describe('jwkToCoseCurveAlgorithmKeyId', () => {
  describe('valid inputs', () => {
    it('maps P-256 to Curves.P256 and default Algorithms.ES256 when alg absent', () => {
      const jwk = createJwk({ crv: JwkCurves.P256 });
      const result = jwkToCoseCurveAlgorithmKeyId(jwk);

      expect(result.curve).toBe(Curves.P256);
      expect(result.algorithm).toBe(Algorithms.ES256);
      expect(result.keyId).toBeUndefined();
    });

    it('maps P-384 to Curves.P384 and default Algorithms.ES384 when alg absent', () => {
      const jwk = createJwk({ crv: JwkCurves.P384 });
      const result = jwkToCoseCurveAlgorithmKeyId(jwk);

      expect(result.curve).toBe(Curves.P384);
      expect(result.algorithm).toBe(Algorithms.ES384);
    });

    it('maps P-521 to Curves.P521 and default Algorithms.ES512 when alg absent', () => {
      const jwk = createJwk({ crv: JwkCurves.P521 });
      const result = jwkToCoseCurveAlgorithmKeyId(jwk);

      expect(result.curve).toBe(Curves.P521);
      expect(result.algorithm).toBe(Algorithms.ES512);
    });

    it('uses specified JWK alg to set algorithm', () => {
      const jwk = createJwk({ crv: JwkCurves.P256, alg: JwkAlgorithms.ES256 });
      const result = jwkToCoseCurveAlgorithmKeyId(jwk);

      expect(result.curve).toBe(Curves.P256);
      expect(result.algorithm).toBe(Algorithms.ES256);
    });

    it('encodes kid as UTF-8 bytes when present', () => {
      const kid = 'test-key-id';
      const jwk = createJwk({ kid });
      const result = jwkToCoseCurveAlgorithmKeyId(jwk);

      expect(result.keyId).toBeInstanceOf(Uint8Array);
      expect(new TextDecoder().decode(result.keyId!)).toBe(kid);
    });
  });

  describe('invalid inputs', () => {
    it('throws when crv is missing', () => {
      const jwk = { kty: 'EC' } as unknown as EcPublicJwk;

      expect(() => jwkToCoseCurveAlgorithmKeyId(jwk)).toThrow(
        'Missing curve in EC public key'
      );
    });

    it('throws when crv is null', () => {
      const jwk = createJwk({ crv: null as unknown as 'P-256' });

      expect(() => jwkToCoseCurveAlgorithmKeyId(jwk)).toThrow(
        'Missing curve in EC public key'
      );
    });

    it('throws when crv is undefined', () => {
      const jwk = createJwk({ crv: undefined as unknown as 'P-256' });

      expect(() => jwkToCoseCurveAlgorithmKeyId(jwk)).toThrow(
        'Missing curve in EC public key'
      );
    });
  });
});
