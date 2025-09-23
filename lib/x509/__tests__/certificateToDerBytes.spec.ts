import { describe, it, expect } from 'vitest';
import { certificateToDerBytes } from '../certificateToDerBytes';
import { createSelfSignedCertificate } from '../createSelfSignedCertificate';
import { generateP256KeyPair } from '@/crypto/generateP256KeyPair';
import { X509Certificate } from 'node:crypto';

describe('certificateToDerBytes', () => {
  it('converts jsrsasign Certificate to DER bytes', () => {
    const { privateJwk, publicJwk } = generateP256KeyPair();

    const cert = createSelfSignedCertificate({
      subjectJwkPublicKey: publicJwk,
      caJwkPrivateKey: privateJwk,
      digestAlgorithm: 'SHA-256',
      subject: 'User1',
      validityDays: 1,
      serialHex: '01',
    });

    const der = certificateToDerBytes(cert);
    const x = new X509Certificate(Buffer.from(der));
    const expected = new Uint8Array(x.raw);

    expect(der).toBeInstanceOf(Uint8Array);
    expect(der).toEqual(expected);
    // DER must start with SEQUENCE (0x30)
    expect(der[0]).toBe(0x30);
  });
});
