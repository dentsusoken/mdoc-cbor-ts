import { describe, it, expect } from 'vitest';
import { KJUR, hextob64 } from 'jsrsasign';

describe('jsrsasign HMAC-SHA2', () => {
  const testKey = 'secret';
  const testMessage = 'hello world';

  it('computes HMAC-SHA256 hex for known vector', () => {
    const mac = new KJUR.crypto.Mac({
      alg: 'HmacSHA256',
      pass: { utf8: testKey },
    });
    mac.updateString(testMessage);
    const hex = mac.doFinal();
    expect(hex).toBe(
      '734cc62f32841568f45715aeb9f4d7891324e6d948e4c6c60c0621cdac48623a'
    );
  });

  it('computes HMAC-SHA256 base64 for known vector', () => {
    const mac = new KJUR.crypto.Mac({
      alg: 'HmacSHA256',
      pass: { utf8: testKey },
    });
    mac.updateString(testMessage);
    const hex = mac.doFinal();
    const b64 = hextob64(hex);
    expect(b64).toBe('c0zGLzKEFWj0VxWuufTXiRMk5tlI5MbGDAYhzaxIYjo=');
  });

  it('Web Crypto HMAC-SHA256 matches jsrsasign for the same message', async () => {
    const mac = new KJUR.crypto.Mac({
      alg: 'HmacSHA256',
      pass: { utf8: testKey },
    });
    mac.updateString(testMessage);
    const hexJsrsasign = mac.doFinal();
    const expectedBase64 = hextob64(hexJsrsasign);

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(testKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const data = new TextEncoder().encode(testMessage);
    const buf = await crypto.subtle.sign('HMAC', key, data);
    const u8 = new Uint8Array(buf);
    const hexWebCrypto = Array.from(u8)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const b64WebCrypto = Buffer.from(u8).toString('base64');

    expect(hexWebCrypto).toBe(hexJsrsasign);
    expect(b64WebCrypto).toBe(expectedBase64);
  });

  it('Web Crypto HMAC-SHA384 matches jsrsasign for the same message', async () => {
    const mac = new KJUR.crypto.Mac({
      alg: 'HmacSHA384',
      pass: { utf8: testKey },
    });
    mac.updateString(testMessage);
    const hexJsrsasign = mac.doFinal();
    const expectedBase64 = hextob64(hexJsrsasign);

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(testKey),
      { name: 'HMAC', hash: 'SHA-384' },
      false,
      ['sign']
    );

    const data = new TextEncoder().encode(testMessage);
    const buf = await crypto.subtle.sign('HMAC', key, data);
    const u8 = new Uint8Array(buf);
    const hexWebCrypto = Array.from(u8)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const b64WebCrypto = Buffer.from(u8).toString('base64');

    expect(hexWebCrypto).toBe(hexJsrsasign);
    expect(b64WebCrypto).toBe(expectedBase64);
  });

  it('Web Crypto HMAC-SHA512 matches jsrsasign for the same message', async () => {
    const mac = new KJUR.crypto.Mac({
      alg: 'HmacSHA512',
      pass: { utf8: testKey },
    });
    mac.updateString(testMessage);
    const hexJsrsasign = mac.doFinal();
    const expectedBase64 = hextob64(hexJsrsasign);

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(testKey),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );

    const data = new TextEncoder().encode(testMessage);
    const buf = await crypto.subtle.sign('HMAC', key, data);
    const u8 = new Uint8Array(buf);
    const hexWebCrypto = Array.from(u8)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const b64WebCrypto = Buffer.from(u8).toString('base64');

    expect(hexWebCrypto).toBe(hexJsrsasign);
    expect(b64WebCrypto).toBe(expectedBase64);
  });

  it('HMAC-SHA256 with different key produces different result', () => {
    const mac1 = new KJUR.crypto.Mac({
      alg: 'HmacSHA256',
      pass: { utf8: 'key1' },
    });
    mac1.updateString(testMessage);
    const hex1 = mac1.doFinal();

    const mac2 = new KJUR.crypto.Mac({
      alg: 'HmacSHA256',
      pass: { utf8: 'key2' },
    });
    mac2.updateString(testMessage);
    const hex2 = mac2.doFinal();

    expect(hex1).not.toBe(hex2);
  });

  it('HMAC-SHA256 with different message produces different result', () => {
    const mac1 = new KJUR.crypto.Mac({
      alg: 'HmacSHA256',
      pass: { utf8: testKey },
    });
    mac1.updateString('message1');
    const hex1 = mac1.doFinal();

    const mac2 = new KJUR.crypto.Mac({
      alg: 'HmacSHA256',
      pass: { utf8: testKey },
    });
    mac2.updateString('message2');
    const hex2 = mac2.doFinal();

    expect(hex1).not.toBe(hex2);
  });

  it('HMAC-SHA256 with empty message', () => {
    const mac = new KJUR.crypto.Mac({
      alg: 'HmacSHA256',
      pass: { utf8: testKey },
    });
    mac.updateString('');
    const hex = mac.doFinal();
    expect(hex).toBe(
      'f9e66e179b6747ae54108f82f8ade8b3c25d76fd30afde6c395822c530196169'
    );
  });

  it('HMAC-SHA256 with empty key', () => {
    const mac = new KJUR.crypto.Mac({
      alg: 'HmacSHA256',
      pass: { utf8: '' },
    });
    mac.updateString(testMessage);
    const hex = mac.doFinal();
    expect(hex).toBe(
      'c2ea634c993f050482b4e6243224087f7c23bdd3c07ab1a45e9a21c62fad994e'
    );
  });
});
