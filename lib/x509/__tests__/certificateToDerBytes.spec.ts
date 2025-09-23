import { describe, it, expect } from 'vitest';
import { certificateToDerBytes } from '../certificateToDerBytes';
import { createSelfSignedCertificate } from '../createSelfSignedCertificate';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import {
  createPublicKey,
  X509Certificate,
  type JsonWebKey as NodeJsonWebKey,
} from 'node:crypto';

describe('certificateToDerBytes', () => {
  const p256 = createSignatureCurve('P-256', randomBytes);
  it('converts jsrsasign Certificate to DER bytes', () => {
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const subjectJwkPublicKey = p256.toJwkPublicKey(publicKey);
    const caJwkPrivateKey = p256.toJwkPrivateKey(privateKey);

    const cert = createSelfSignedCertificate({
      subjectJwkPublicKey,
      caJwkPrivateKey,
      digestAlgorithm: 'SHA-256',
      subject: 'User1',
      validityDays: 1,
      serialHex: '01',
    });

    const der = certificateToDerBytes(cert);
    const x = new X509Certificate(Buffer.from(der));
    const nodePublicKey = createPublicKey({
      key: subjectJwkPublicKey as unknown as NodeJsonWebKey,
      format: 'jwk',
    });
    const ok = x.verify(nodePublicKey);
    expect(ok).toBe(true);
    // const expected = new Uint8Array(x.raw);

    // expect(der).toBeInstanceOf(Uint8Array);
    // expect(der).toEqual(expected);
    // // DER must start with SEQUENCE (0x30)
    // expect(der[0]).toBe(0x30);
  });
});
