import { describe, it, expect } from 'vitest';
import { generateP256KeyPair } from '../generateP256KeyPair';
import { type ECPrivateJWK } from '../types';
import { importEcPublicKeyFromJwk } from '../importEcPublicKeyFromJwk';
import { KEYUTIL } from 'jsrsasign';

const isBase64Url = (s: unknown): s is string =>
  typeof s === 'string' && /^[A-Za-z0-9_-]+$/.test(s);

const importPrivateKeyFromJwk = async (
  jwk: ECPrivateJWK
): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
};

describe('generateP256KeyPair', () => {
  it('returns valid JWKs for P-256', () => {
    const { privateKeyJwk, publicKeyJwk } = generateP256KeyPair();
    // const privateKey = KEYUTIL.getKey(privateKeyJwk);
    // const publicKey = KEYUTIL.getKey(publicKeyJwk);
    // //console.log(privateKey);
    // const privateKeyJwk2 = KEYUTIL.getJWK(privateKey);
    // console.log(privateKeyJwk2);
    // const publicKeyJwk2 = KEYUTIL.getJWK(publicKey);
    // console.log(publicKeyJwk2);

    expect(publicKeyJwk.kty).toBe('EC');
    expect(publicKeyJwk.crv).toBe('P-256');
    expect(isBase64Url(publicKeyJwk.x)).toBe(true);
    expect(isBase64Url(publicKeyJwk.y)).toBe(true);
    expect('d' in publicKeyJwk).toBe(false);

    expect(privateKeyJwk.kty).toBe('EC');
    expect(privateKeyJwk.crv).toBe('P-256');
    expect(isBase64Url(privateKeyJwk.x)).toBe(true);
    expect(isBase64Url(privateKeyJwk.y)).toBe(true);
    expect(isBase64Url(privateKeyJwk.d)).toBe(true);
  });

  it('imports into Web Crypto and verifies a signature', async () => {
    const { privateKeyJwk, publicKeyJwk } = generateP256KeyPair();

    const privateKey = await importPrivateKeyFromJwk(privateKeyJwk);
    const publicKey = await importEcPublicKeyFromJwk(publicKeyJwk);

    const data = new TextEncoder().encode('hello world');
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      privateKey,
      data
    );

    const ok = await crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      publicKey,
      signature,
      data
    );
    expect(ok).toBe(true);
  });
});
