import { describe, it, expect } from 'vitest';
import { signES256 } from '../signES256';
import { generateP256KeyPair } from '../generateP256KeyPair';
import { importEcPublicKeyFromJwk } from '../importEcPublicKeyFromJwk';

describe('signES256', () => {
  it('signs with ES256 and verifies via Web Crypto', async () => {
    const { privateJwk, publicJwk } = generateP256KeyPair();
    const data = new TextEncoder().encode('hello world');

    const concatSig = signES256({ privateJwk, data });

    const publicKey = await importEcPublicKeyFromJwk(publicJwk);

    const ok = await crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      publicKey,
      concatSig,
      data
    );

    expect(ok).toBe(true);
  });
});
