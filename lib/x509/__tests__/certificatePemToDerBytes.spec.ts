import { describe, it, expect } from 'vitest';
import { certificatePemToDerBytes } from '../certificatePemToDerBytes';
import { createSelfSignedCertificate } from '../createSelfSignedCertificate';
import { certificateToDerBytes } from '../certificateToDerBytes';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';

const p256 = createSignatureCurve('P-256', randomBytes);

const SAMPLE_CERT_1 = `MIICQDCCAamgAwIBAgIBADANBgkqhkiG9w0BAQsFADA9MQswCQYDVQQGEwJ1czEQMA4GA1UECAwHQWxhYmFtYTENMAsGA1UECgwEVGVzdDENMAsGA1UEAwwEVGVzdDAeFw0yNTAzMDUxMDU4NDVaFw0yNjAzMDUxMDU4NDVaMD0xCzAJBgNVBAYTAnVzMRAwDgYDVQQIDAdBbGFiYW1hMQ0wCwYDVQQKDARUZXN0MQ0wCwYDVQQDDARUZXN0MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGV5Y+z0dZ/TG5sVOqPa/7b0rLncHDst2heR4cfhPVk23NEmrHut25mzPH3x9z/IDQggR3Tg3gs964RMnxRic1Q5rG19Z3K9KeRqChBuNMOyLRMrTE79QZjGAWEe1m48v0qb14M5zAHpLOL2GUoCbdWG44GDWfezymZcYbvnaO2QIDAQABo1AwTjAdBgNVHQ4EFgQUfQixBT210TwWyZ4l4ZvXPWuj2XYwHwYDVR0jBBgwFoAUfQixBT210TwWyZ4l4ZvXPWuj2XYwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOBgQAY3Qs9/pb6Zzdrsd/CkjpTENQCavRpfbchPZrqG5ZS2Sl/IqoFqMx4himW51+Cj/ICGAOGx/q2b84Sb+11LyHB+L6uMWSWM6egPPiNaPojQQcEPvhoNdNjrtBAoOZo4LlvQ0R7u55hmqxVQDAPwdPOOILeMAHKDsiqx3E6xfzImQ==`;

describe('certificatePemToDerBytes', () => {
  it('converts single PEM certificate to DER bytes', () => {
    const pem = `-----BEGIN CERTIFICATE-----
${SAMPLE_CERT_1}
-----END CERTIFICATE-----`;

    const result = certificatePemToDerBytes(pem);

    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Uint8Array);
    // DER must start with SEQUENCE (0x30)
    expect(result[0][0]).toBe(0x30);
  });

  it('converts multiple PEM certificates to DER bytes array', () => {
    const pem = `-----BEGIN CERTIFICATE-----
${SAMPLE_CERT_1}
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
${SAMPLE_CERT_1}
-----END CERTIFICATE-----`;

    const result = certificatePemToDerBytes(pem);

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(Uint8Array);
    expect(result[1]).toBeInstanceOf(Uint8Array);
    expect(result[0][0]).toBe(0x30);
    expect(result[1][0]).toBe(0x30);
  });

  it('handles PEM with extra whitespace and newlines', () => {
    const pem = `
    -----BEGIN CERTIFICATE-----
    ${SAMPLE_CERT_1}
    -----END CERTIFICATE-----
    `;

    const result = certificatePemToDerBytes(pem);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Uint8Array);
    expect(result[0][0]).toBe(0x30);
  });

  it('handles PEM without newlines in base64 content', () => {
    const pem = `-----BEGIN CERTIFICATE-----${SAMPLE_CERT_1}-----END CERTIFICATE-----`;

    const result = certificatePemToDerBytes(pem);

    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Uint8Array);
    expect(result[0][0]).toBe(0x30);
  });

  it('returns empty array for empty string', () => {
    const result = certificatePemToDerBytes('');

    expect(result).toEqual([]);
  });

  it('converts generated certificate PEM to DER bytes correctly', () => {
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
    const expectedDer = certificateToDerBytes(cert);

    const result = certificatePemToDerBytes(pem);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(expectedDer);
  });

  it('converts multiple generated certificates to DER bytes correctly', () => {
    const privateKey1 = p256.randomPrivateKey();
    const publicKey1 = p256.getPublicKey(privateKey1);
    const subjectJwkPublicKey1 = p256.toJwkPublicKey(publicKey1);
    const caJwkPrivateKey1 = p256.toJwkPrivateKey(privateKey1);

    const cert1 = createSelfSignedCertificate({
      subjectJwkPublicKey: subjectJwkPublicKey1,
      caJwkPrivateKey: caJwkPrivateKey1,
      digestAlgorithm: 'SHA-256',
      subject: 'User1',
      validityDays: 1,
      serialHex: '01',
    });

    const privateKey2 = p256.randomPrivateKey();
    const publicKey2 = p256.getPublicKey(privateKey2);
    const subjectJwkPublicKey2 = p256.toJwkPublicKey(publicKey2);
    const caJwkPrivateKey2 = p256.toJwkPrivateKey(privateKey2);

    const cert2 = createSelfSignedCertificate({
      subjectJwkPublicKey: subjectJwkPublicKey2,
      caJwkPrivateKey: caJwkPrivateKey2,
      digestAlgorithm: 'SHA-256',
      subject: 'User2',
      validityDays: 1,
      serialHex: '02',
    });

    const pem1 = cert1.getPEM();
    const pem2 = cert2.getPEM();
    const combinedPem = `${pem1}\n${pem2}`;

    const expectedDer1 = certificateToDerBytes(cert1);
    const expectedDer2 = certificateToDerBytes(cert2);

    const result = certificatePemToDerBytes(combinedPem);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(expectedDer1);
    expect(result[1]).toEqual(expectedDer2);
  });
});
