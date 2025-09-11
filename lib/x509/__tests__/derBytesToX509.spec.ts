import { describe, it, expect } from 'vitest';
import { derBytesToX509 } from '../derBytesToX509';
import { createSelfSignedCertificate } from '../createSelfSignedCertificate';
import { generateP256KeyPair } from '@/crypto/generateP256KeyPair';
import { certificateToDerBytes } from '../certificateToDerBytes';

describe('derBytesToX509', () => {
  it('parses DER to jsrsasign X509 and exposes subject/issuer and verifies signature', () => {
    const { privateJwk, publicJwk } = generateP256KeyPair();

    const cert = createSelfSignedCertificate({
      subjectPublicJwk: publicJwk,
      caPrivateJwk: privateJwk,
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
