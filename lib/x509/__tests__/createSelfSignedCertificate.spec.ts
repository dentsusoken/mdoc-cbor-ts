import { describe, it, expect } from 'vitest';
import { KJUR } from 'jsrsasign';
import { createSelfSignedCertificate } from '../createSelfSignedCertificate';
import { generateP256KeyPair } from '@/crypto/generateP256KeyPair';
import { createPublicKey, X509Certificate } from 'node:crypto';
import type { JsonWebKey as NodeJsonWebKey } from 'node:crypto';
import { certificateToDerBytes } from '../certificateToDerBytes';

describe('createSelfSignedCertificate jsrsasign, EC, SHA-256', () => {
  it('creates a valid self-signed certificate from JWK keys', () => {
    // Generate EC P-256 key pair and export JWKs
    const { privateJwk, publicJwk } = generateP256KeyPair();

    const cert = createSelfSignedCertificate({
      subjectPublicJwk: publicJwk,
      caPrivateJwk: privateJwk,
      digestAlgorithm: 'SHA-256',
      subject: 'User1',
      validityDays: 1,
      serialHex: '01',
    });

    expect(cert).toBeInstanceOf(KJUR.asn1.x509.Certificate);

    // Verify with Node's X509Certificate
    const der = certificateToDerBytes(cert);
    const x = new X509Certificate(Buffer.from(der));
    const x2 = new X509Certificate(cert.getPEM());
    const pub = createPublicKey({
      key: publicJwk as unknown as NodeJsonWebKey,
      format: 'jwk',
    });

    const ok = x.verify(pub);
    const ok2 = x2.verify(pub);
    expect(ok).toBe(true);
    expect(ok2).toBe(true);
    expect(x.subject).toBe('CN=User1');
    expect(x2.subject).toBe('CN=User1');
    expect(x.issuer).toBe('CN=User1');
    expect(x2.issuer).toBe('CN=User1');
  });
});
