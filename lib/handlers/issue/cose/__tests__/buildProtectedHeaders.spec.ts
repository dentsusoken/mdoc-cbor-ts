import { describe, expect, it } from 'vitest';
import { buildProtectedHeaders } from '../buildProtectedHeaders';
import { ECPublicJwk } from '@/crypto/types';
import { Headers, Algorithms } from '@/cose/types';
import { JwsAlgorithms } from '@/jws/types';
import { ExactKeyMap } from 'exact-key-map';

describe('buildProtectedHeaders', () => {
  it('should create protected headers with algorithm and key ID', () => {
    const publicJwk: ECPublicJwk = {
      kty: 'EC',
      crv: 'P-256',
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      alg: JwsAlgorithms.ES256,
      kid: 'key-123',
    };

    const headers = buildProtectedHeaders(publicJwk);

    expect(headers).toBeInstanceOf(ExactKeyMap);
    expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES256);
    expect(headers.get(Headers.KeyID)).toEqual(
      new TextEncoder().encode('key-123')
    );
  });

  it('should create protected headers with algorithm only when no key ID', () => {
    const publicJwk: ECPublicJwk = {
      kty: 'EC',
      crv: 'P-256',
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      alg: JwsAlgorithms.ES256,
      // No kid parameter
    };

    const headers = buildProtectedHeaders(publicJwk);

    expect(headers).toBeInstanceOf(ExactKeyMap);
    expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES256);
    expect(headers.get(Headers.KeyID)).toBeUndefined();
  });

  it('should create protected headers with different algorithms', () => {
    const publicJwk: ECPublicJwk = {
      kty: 'EC',
      crv: 'P-384',
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      alg: JwsAlgorithms.ES384,
      kid: 'key-456',
    };

    const headers = buildProtectedHeaders(publicJwk);

    expect(headers).toBeInstanceOf(ExactKeyMap);
    expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES384);
    expect(headers.get(Headers.KeyID)).toEqual(
      new TextEncoder().encode('key-456')
    );
  });

  it('should throw error when algorithm is missing and curve is not supported', () => {
    const publicJwk: ECPublicJwk = {
      kty: 'EC',
      crv: 'P-xxx' as 'P-256' | 'P-384' | 'P-521', // Invalid curve
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      // No alg parameter
      kid: 'key-123',
    };

    expect(() => buildProtectedHeaders(publicJwk)).toThrow(
      'Missing algorithm in EC public key'
    );
  });

  it('should derive algorithm from curve when alg is not provided', () => {
    const publicJwk: ECPublicJwk = {
      kty: 'EC',
      crv: 'P-256',
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      // No alg parameter - should derive from curve
      kid: 'key-789',
    };

    const headers = buildProtectedHeaders(publicJwk);

    expect(headers).toBeInstanceOf(ExactKeyMap);
    expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES256); // Derived from P-256
    expect(headers.get(Headers.KeyID)).toEqual(
      new TextEncoder().encode('key-789')
    );
  });

  it('should handle empty key ID string', () => {
    const publicJwk: ECPublicJwk = {
      kty: 'EC',
      crv: 'P-256',
      x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
      y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
      alg: JwsAlgorithms.ES256,
      kid: '', // Empty string - falsy value, so key ID won't be set
    };

    const headers = buildProtectedHeaders(publicJwk);

    expect(headers).toBeInstanceOf(ExactKeyMap);
    expect(headers.get(Headers.Algorithm)).toBe(Algorithms.ES256);
    expect(headers.get(Headers.KeyID)).toBeUndefined(); // Empty string is falsy, so no key ID is set
  });
});
