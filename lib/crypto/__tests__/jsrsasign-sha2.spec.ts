import { describe, it, expect } from 'vitest';
import { KJUR, hextob64 } from 'jsrsasign';
import { webcrypto as nodeWebCrypto } from 'node:crypto';

describe('jsrsasign SHA2', () => {
  it('computes SHA-256 hex for known vector', () => {
    const message = 'abc';
    const md = new KJUR.crypto.MessageDigest({
      alg: 'sha256',
      prov: 'cryptojs',
    });
    md.updateString(message);
    const hex = md.digest();
    expect(hex).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it('computes SHA-256 base64 for known vector', () => {
    const message = 'abc';
    const md = new KJUR.crypto.MessageDigest({
      alg: 'sha256',
      prov: 'cryptojs',
    });
    md.updateString(message);
    const hex = md.digest();
    const b64 = hextob64(hex);
    expect(b64).toBe('ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=');
  });

  it('Web Crypto SHA-256 matches jsrsasign for the same message', async () => {
    const message = 'abc';
    const md = new KJUR.crypto.MessageDigest({
      alg: 'sha256',
      prov: 'cryptojs',
    });
    md.updateString(message);
    const hexJsrsasign = md.digest();
    const expectedBase64 = hextob64(hexJsrsasign);

    const subtle =
      globalThis.crypto && 'subtle' in globalThis.crypto
        ? globalThis.crypto.subtle
        : nodeWebCrypto.subtle;

    const data = new TextEncoder().encode(message);
    const buf = await subtle.digest('SHA-256', data);
    const u8 = new Uint8Array(buf);
    const hexWebCrypto = Array.from(u8)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const b64WebCrypto = Buffer.from(u8).toString('base64');

    expect(hexWebCrypto).toBe(hexJsrsasign);
    expect(b64WebCrypto).toBe(expectedBase64);
  });

  it('Web Crypto SHA-384 matches jsrsasign for the same message', async () => {
    const message = 'abc';
    const md = new KJUR.crypto.MessageDigest({
      alg: 'sha384',
      prov: 'cryptojs',
    });
    md.updateString(message);
    const hexJsrsasign = md.digest();
    const expectedBase64 = hextob64(hexJsrsasign);

    const subtle =
      globalThis.crypto && 'subtle' in globalThis.crypto
        ? globalThis.crypto.subtle
        : nodeWebCrypto.subtle;

    const data = new TextEncoder().encode(message);
    const buf = await subtle.digest('SHA-384', data);
    const u8 = new Uint8Array(buf);
    const hexWebCrypto = Array.from(u8)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const b64WebCrypto = Buffer.from(u8).toString('base64');

    expect(hexWebCrypto).toBe(hexJsrsasign);
    expect(b64WebCrypto).toBe(expectedBase64);
  });

  it('Web Crypto SHA-512 matches jsrsasign for the same message', async () => {
    const message = 'abc';
    const md = new KJUR.crypto.MessageDigest({
      alg: 'sha512',
      prov: 'cryptojs',
    });
    md.updateString(message);
    const hexJsrsasign = md.digest();
    const expectedBase64 = hextob64(hexJsrsasign);

    const subtle =
      globalThis.crypto && 'subtle' in globalThis.crypto
        ? globalThis.crypto.subtle
        : nodeWebCrypto.subtle;

    const data = new TextEncoder().encode(message);
    const buf = await subtle.digest('SHA-512', data);
    const u8 = new Uint8Array(buf);
    const hexWebCrypto = Array.from(u8)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const b64WebCrypto = Buffer.from(u8).toString('base64');

    expect(hexWebCrypto).toBe(hexJsrsasign);
    expect(b64WebCrypto).toBe(expectedBase64);
  });
});
