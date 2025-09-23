import { describe, it, expect } from 'vitest';
import { derBytesToX509 } from '../derBytesToX509';
import { createSelfSignedCertificate } from '../createSelfSignedCertificate';
import { certificateToDerBytes } from '../certificateToDerBytes';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';

const p256 = createSignatureCurve('P-256', randomBytes);

describe('derBytesToX509', () => {
  it('parses DER to jsrsasign X509 and exposes subject/issuer and verifies signature', () => {
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
    const x509 = derBytesToX509(der);

    expect(x509.getSubjectString()).toBe('/CN=User1');
    expect(x509.getIssuerString()).toBe('/CN=User1');

    const pub = x509.getPublicKey();
    expect(x509.verifySignature(pub)).toBe(true);
  });
});
