import { describe, it, expect } from 'vitest';
import { pemToX509 } from '../pemToX509';
import { createSelfSignedCertificate } from '../createSelfSignedCertificate';
import { generateP256KeyPair } from '@/crypto/generateP256KeyPair';

describe('pemToX509', () => {
  it('parses PEM to jsrsasign X509 and exposes subject/issuer', () => {
    const { privateJwk, publicJwk } = generateP256KeyPair();

    const cert = createSelfSignedCertificate({
      subjectPublicJwk: publicJwk,
      caPrivateJwk: privateJwk,
      digestAlgorithm: 'SHA-256',
      subject: 'User1',
      validityDays: 1,
      serialHex: '01',
    });

    const pem = cert.getPEM();

    const x509 = pemToX509(pem);

    expect(x509.getSubjectString()).toBe('/CN=User1');
    expect(x509.getIssuerString()).toBe('/CN=User1');
  });
});
