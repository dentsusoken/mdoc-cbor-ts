import { describe, it, expect } from 'vitest';
import { generateP256KeyPair } from '../generateP256KeyPair';
import { signES256 } from '../signES256';
import { verifyES256 } from '../verifyES256';
import { importEcPrivateKeyFromJwk } from '../importEcPrivateKeyFromJwk';

describe('verifyES256', () => {
  it('verifies signature created by signES256', () => {
    const { privateJwk, publicJwk } = generateP256KeyPair();
    const data = new TextEncoder().encode('hello world');
    const signature = signES256({ privateJwk, data });
    const ok = verifyES256({ publicJwk, data, signature });
    expect(ok).toBe(true);
  });

  it('verifies signature created by Web Crypto', async () => {
    const { privateJwk, publicJwk } = generateP256KeyPair();
    const data = new TextEncoder().encode('hello world');

    const privateKey = await importEcPrivateKeyFromJwk(privateJwk);
    const signature = new Uint8Array(
      await crypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        privateKey,
        data
      )
    );

    const ok = verifyES256({ publicJwk, data, signature });
    expect(ok).toBe(true);
  });
});
