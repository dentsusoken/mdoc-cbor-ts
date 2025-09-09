import { describe, it, expect } from 'vitest';
import { importEcPublicKeyFromJwk } from '../importEcPublicKeyFromJwk';
import { generateP256KeyPair } from '../generateP256KeyPair';

describe('importEcPublicKeyFromJwk', () => {
  it('imports P-256 public JWK and verifies signature', async () => {
    const { privateKeyJwk, publicKeyJwk } = generateP256KeyPair();

    const pubWithKid = {
      ...publicKeyJwk,
      kid: 'test-key',
    } as typeof publicKeyJwk & {
      kid: string;
    };
    const publicKey = await importEcPublicKeyFromJwk(pubWithKid);

    const privateKey = await crypto.subtle.importKey(
      'jwk',
      privateKeyJwk,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );

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
