import { describe, it, expect } from 'vitest';
import { KEYUTIL, X509 } from 'jsrsasign';
import {
  webcrypto as nodeWebCrypto,
  randomBytes as nodeRandomBytes,
} from 'node:crypto';
import { createSelfSignedCertificate } from '../createSelfSignedCertificate';

const rng = (n: number): Uint8Array => {
  if (typeof nodeRandomBytes === 'function') {
    return new Uint8Array(nodeRandomBytes(n));
  }
  const out = new Uint8Array(n);
  const cryptoObj =
    globalThis.crypto && 'getRandomValues' in globalThis.crypto
      ? globalThis.crypto
      : (nodeWebCrypto as unknown as Crypto);
  cryptoObj.getRandomValues(out);
  return out;
};

describe('createSelfSignedCertificate jsrsasign, EC, SHA-256', () => {
  it('creates a valid self-signed certificate from PEM keys', () => {
    // Generate EC P-256 key pair and export PEMs
    const { prvKeyObj, pubKeyObj } = KEYUTIL.generateKeypair('EC', 'secp256r1');
    const privateKeyPem = KEYUTIL.getPEM(prvKeyObj, 'PKCS8PRV');
    // @ts-expect-error jsrsasign supports this format at runtime
    const publicKeyPem = KEYUTIL.getPEM(pubKeyObj, 'PKCS8PUB');

    const certPem = createSelfSignedCertificate({
      publicKeyPem,
      privateKeyPem,
      digestAlgorithm: 'SHA-256',
      subject: { commonName: 'User1' },
      validityDays: 1,
      randomBytes: rng,
    });

    expect(typeof certPem).toBe('string');
    expect(certPem.startsWith('-----BEGIN CERTIFICATE-----')).toBe(true);
    expect(certPem.trim().endsWith('-----END CERTIFICATE-----')).toBe(true);

    // Verify with jsrsasign X509
    const x = new X509();
    x.readCertPEM(certPem);
    const pub = x.getPublicKey();
    const ok = x.verifySignature(pub);
    expect(ok).toBe(true);
  });
});
