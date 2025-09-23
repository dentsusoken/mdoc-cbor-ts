import { describe, it, expect } from 'vitest';
import { pemToX509 } from '../pemToX509';
import { createSelfSignedCertificate } from '../createSelfSignedCertificate';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';

const p256 = createSignatureCurve('P-256', randomBytes);

const SAMPLE_CERT = `MIICQDCCAamgAwIBAgIBADANBgkqhkiG9w0BAQsFADA9MQswCQYDVQQGEwJ1czEQMA4GA1UECAwHQWxhYmFtYTENMAsGA1UECgwEVGVzdDENMAsGA1UEAwwEVGVzdDAeFw0yNTAzMDUxMDU4NDVaFw0yNjAzMDUxMDU4NDVaMD0xCzAJBgNVBAYTAnVzMRAwDgYDVQQIDAdBbGFiYW1hMQ0wCwYDVQQKDARUZXN0MQ0wCwYDVQQDDARUZXN0MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGV5Y+z0dZ/TG5sVOqPa/7b0rLncHDst2heR4cfhPVk23NEmrHut25mzPH3x9z/IDQggR3Tg3gs964RMnxRic1Q5rG19Z3K9KeRqChBuNMOyLRMrTE79QZjGAWEe1m48v0qb14M5zAHpLOL2GUoCbdWG44GDWfezymZcYbvnaO2QIDAQABo1AwTjAdBgNVHQ4EFgQUfQixBT210TwWyZ4l4ZvXPWuj2XYwHwYDVR0jBBgwFoAUfQixBT210TwWyZ4l4ZvXPWuj2XYwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOBgQAY3Qs9/pb6Zzdrsd/CkjpTENQCavRpfbchPZrqG5ZS2Sl/IqoFqMx4himW51+Cj/ICGAOGx/q2b84Sb+11LyHB+L6uMWSWM6egPPiNaPojQQcEPvhoNdNjrtBAoOZo4LlvQ0R7u55hmqxVQDAPwdPOOILeMAHKDsiqx3E6xfzImQ==`;
const pem = `-----BEGIN CERTIFICATE-----\n${SAMPLE_CERT}\n-----END CERTIFICATE-----`;

describe('pemToX509', () => {
  it('parses PEM to jsrsasign X509 and exposes subject/issuer', () => {
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

    const pem = cert.getPEM();

    const x509 = pemToX509(pem);

    expect(x509.getSubjectString()).toBe('/CN=User1');
    expect(x509.getIssuerString()).toBe('/CN=User1');
  });

  it('parses sample PEM to jsrsasign X509 and exposes subject/issuer', () => {
    const x509 = pemToX509(pem);

    expect(x509.getSubjectString()).toBe('/C=us/ST=Alabama/O=Test/CN=Test');
    expect(x509.getIssuerString()).toBe('/C=us/ST=Alabama/O=Test/CN=Test');
  });
});
