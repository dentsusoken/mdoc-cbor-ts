import { describe, it, expect } from 'vitest';
import { JwkCurves } from '../../jwk/types';
import { JwsAlgorithms } from '../types';
import { JWK_CRV_TO_JWS_ALG } from '../constants';

/**
 * Tests for JWK_CRV_TO_JWS_ALG mapping
 */

describe('JWK_CRV_TO_JWS_ALG', () => {
  it('should have correct mappings for all supported curves', () => {
    expect(JWK_CRV_TO_JWS_ALG[JwkCurves.P256]).toBe(JwsAlgorithms.ES256);
    expect(JWK_CRV_TO_JWS_ALG[JwkCurves.P384]).toBe(JwsAlgorithms.ES384);
    expect(JWK_CRV_TO_JWS_ALG[JwkCurves.P521]).toBe(JwsAlgorithms.ES512);
    expect(JWK_CRV_TO_JWS_ALG[JwkCurves.Ed25519]).toBe(JwsAlgorithms.EdDSA);
    expect(JWK_CRV_TO_JWS_ALG[JwkCurves.Ed448]).toBe(JwsAlgorithms.EdDSA);
    expect(JWK_CRV_TO_JWS_ALG[JwkCurves.X25519]).toBeUndefined();
    expect(JWK_CRV_TO_JWS_ALG[JwkCurves.X448]).toBeUndefined();
  });

  it('should have mappings for all JwkCurves enum values', () => {
    const allCurves = Object.values(JwkCurves);
    allCurves.forEach((curve) => {
      expect(JWK_CRV_TO_JWS_ALG).toHaveProperty(curve);
    });
  });
});
