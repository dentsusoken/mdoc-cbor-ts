import { Algorithms, Headers, ProtectedHeaders, Sign1 } from '@auth0/cose';
import { X509Certificate } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { extractPublicKey } from './ExtractPublicKey';

const SAMPLE_CERT = `MIICQDCCAamgAwIBAgIBADANBgkqhkiG9w0BAQsFADA9MQswCQYDVQQGEwJ1czEQMA4GA1UECAwHQWxhYmFtYTENMAsGA1UECgwEVGVzdDENMAsGA1UEAwwEVGVzdDAeFw0yNTAzMDUxMDU4NDVaFw0yNjAzMDUxMDU4NDVaMD0xCzAJBgNVBAYTAnVzMRAwDgYDVQQIDAdBbGFiYW1hMQ0wCwYDVQQKDARUZXN0MQ0wCwYDVQQDDARUZXN0MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGV5Y+z0dZ/TG5sVOqPa/7b0rLncHDst2heR4cfhPVk23NEmrHut25mzPH3x9z/IDQggR3Tg3gs964RMnxRic1Q5rG19Z3K9KeRqChBuNMOyLRMrTE79QZjGAWEe1m48v0qb14M5zAHpLOL2GUoCbdWG44GDWfezymZcYbvnaO2QIDAQABo1AwTjAdBgNVHQ4EFgQUfQixBT210TwWyZ4l4ZvXPWuj2XYwHwYDVR0jBBgwFoAUfQixBT210TwWyZ4l4ZvXPWuj2XYwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOBgQAY3Qs9/pb6Zzdrsd/CkjpTENQCavRpfbchPZrqG5ZS2Sl/IqoFqMx4himW51+Cj/ICGAOGx/q2b84Sb+11LyHB+L6uMWSWM6egPPiNaPojQQcEPvhoNdNjrtBAoOZo4LlvQ0R7u55hmqxVQDAPwdPOOILeMAHKDsiqx3E6xfzImQ==`;
const pem = `-----BEGIN CERTIFICATE-----\n${SAMPLE_CERT}\n-----END CERTIFICATE-----`;
const x5c = new X509Certificate(pem);

describe('extractPublicKey', () => {
  const mockCertificate = Buffer.from('test-certificate');
  const mockAlgorithm = Algorithms.ES256;

  it('should extract public key from protected headers', async () => {
    const protectedHeaders = new ProtectedHeaders([
      [Headers.X5Chain, new Uint8Array(x5c.raw)],
      [Headers.Algorithm, mockAlgorithm],
    ]);

    const issuerAuth = new Sign1(
      protectedHeaders.encode(),
      new Map(),
      Buffer.from('test-payload'),
      Buffer.from('test-signature')
    );

    const result = await extractPublicKey(issuerAuth);

    expect(result).toBeDefined();
    // Note: The actual key value cannot be tested as it's a KeyLike object
  });

  it('should extract public key from unprotected headers', async () => {
    const protectedHeaders = new ProtectedHeaders();
    const unprotectedHeaders = new Map<number, unknown>([
      [Headers.X5Chain, new Uint8Array(x5c.raw)],
      [Headers.Algorithm, mockAlgorithm],
    ]);

    const issuerAuth = new Sign1(
      protectedHeaders.encode(),
      unprotectedHeaders,
      Buffer.from('test-payload'),
      Buffer.from('test-signature')
    );

    const result = await extractPublicKey(issuerAuth);

    expect(result).toBeDefined();
    // Note: The actual key value cannot be tested as it's a KeyLike object
  });

  it('should handle array of certificates', async () => {
    const protectedHeaders = new ProtectedHeaders([
      [Headers.X5Chain, [new Uint8Array(x5c.raw), new Uint8Array(x5c.raw)]],
      [Headers.Algorithm, mockAlgorithm],
    ]);

    const unprotectedHeaders = new Map<number, unknown>([
      [Headers.X5Chain, [new Uint8Array(x5c.raw), new Uint8Array(x5c.raw)]],
      [Headers.Algorithm, mockAlgorithm],
    ]);

    const issuerAuth = new Sign1(
      protectedHeaders.encode(),
      unprotectedHeaders,
      Buffer.from('test-payload'),
      Buffer.from('test-signature')
    );

    const result = await extractPublicKey(issuerAuth);

    expect(result).toBeDefined();
    // Note: The actual key value cannot be tested as it's a KeyLike object
  });

  it('should throw error when no certificate found', async () => {
    const protectedHeaders = new ProtectedHeaders();
    const unprotectedHeaders = new Map<number, unknown>();

    const issuerAuth = new Sign1(
      protectedHeaders.encode(),
      unprotectedHeaders,
      Buffer.from('test-payload'),
      Buffer.from('test-signature')
    );

    await expect(extractPublicKey(issuerAuth)).rejects.toThrow(
      'X509 certificate not found'
    );
  });

  it('should throw error when no algorithm found', async () => {
    const protectedHeaders = new ProtectedHeaders();
    const unprotectedHeaders = new Map<number, unknown>([
      [Headers.X5Chain, new Uint8Array(x5c.raw)],
    ]);

    const issuerAuth = new Sign1(
      protectedHeaders.encode(),
      unprotectedHeaders,
      Buffer.from('test-payload'),
      Buffer.from('test-signature')
    );

    await expect(extractPublicKey(issuerAuth)).rejects.toThrow();
  });
});
