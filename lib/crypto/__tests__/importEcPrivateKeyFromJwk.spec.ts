import { describe, it, expect } from 'vitest';
import { importEcPrivateKeyFromJwk } from '../importEcPrivateKeyFromJwk';
import { importEcPublicKeyFromJwk } from '../importEcPublicKeyFromJwk';
import { generateP256KeyPair } from '../generateP256KeyPair';

describe('importEcPrivateKeyFromJwk', () => {
  it('imports P-256 private JWK and signs/verifies', async () => {
    const { privateKeyJwk, publicKeyJwk } = generateP256KeyPair();

    const privKey = await importEcPrivateKeyFromJwk(privateKeyJwk);
    const pubKey = await importEcPublicKeyFromJwk(publicKeyJwk);

    const data = new TextEncoder().encode('hello world');
    const sig = await crypto.subtle.sign(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      privKey,
      data
    );
    const ok = await crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      pubKey,
      sig,
      data
    );
    expect(ok).toBe(true);
  });
});
