import { describe, it, expect } from 'vitest';
import { generateP256KeyPair } from '../generateP256KeyPair';
import { importEcPublicKeyFromJwk } from '../importEcPublicKeyFromJwk';
import { importEcPrivateKeyFromJwk } from '../importEcPrivateKeyFromJwk';

const isBase64Url = (s: unknown): s is string =>
  typeof s === 'string' && /^[A-Za-z0-9_-]+$/.test(s);

describe('generateP256KeyPair', () => {
  it('returns valid JWKs for P-256', () => {
    const { privateJwk, publicJwk } = generateP256KeyPair();
    // const privateKey = KEYUTIL.getKey(privateKeyJwk);
    // const publicKey = KEYUTIL.getKey(publicKeyJwk);
    // //console.log(privateKey);
    // const privateKeyJwk2 = KEYUTIL.getJWK(privateKey);
    // console.log(privateKeyJwk2);
    // const publicKeyJwk2 = KEYUTIL.getJWK(publicKey);
    // console.log(publicKeyJwk2);

    expect(publicJwk.kty).toBe('EC');
    expect(publicJwk.crv).toBe('P-256');
    expect(isBase64Url(publicJwk.x)).toBe(true);
    expect(isBase64Url(publicJwk.y)).toBe(true);
    expect('d' in publicJwk).toBe(false);

    expect(privateJwk.kty).toBe('EC');
    expect(privateJwk.crv).toBe('P-256');
    expect(isBase64Url(privateJwk.x)).toBe(true);
    expect(isBase64Url(privateJwk.y)).toBe(true);
    expect(isBase64Url(privateJwk.d)).toBe(true);
  });

  it('imports into Web Crypto and verifies a signature', async () => {
    const { privateJwk, publicJwk } = generateP256KeyPair();

    const privateKey = await importEcPrivateKeyFromJwk(privateJwk);
    const publicKey = await importEcPublicKeyFromJwk(publicJwk);

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
