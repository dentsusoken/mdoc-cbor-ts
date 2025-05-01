import { Headers, UnprotectedHeaders } from '@auth0/cose';
import { X509Certificate } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildUnprotectedHeaders } from './BuildUnprotectedHeaders';

const SAMPLE_CERT = `MIICQDCCAamgAwIBAgIBADANBgkqhkiG9w0BAQsFADA9MQswCQYDVQQGEwJ1czEQMA4GA1UECAwHQWxhYmFtYTENMAsGA1UECgwEVGVzdDENMAsGA1UEAwwEVGVzdDAeFw0yNTAzMDUxMDU4NDVaFw0yNjAzMDUxMDU4NDVaMD0xCzAJBgNVBAYTAnVzMRAwDgYDVQQIDAdBbGFiYW1hMQ0wCwYDVQQKDARUZXN0MQ0wCwYDVQQDDARUZXN0MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGV5Y+z0dZ/TG5sVOqPa/7b0rLncHDst2heR4cfhPVk23NEmrHut25mzPH3x9z/IDQggR3Tg3gs964RMnxRic1Q5rG19Z3K9KeRqChBuNMOyLRMrTE79QZjGAWEe1m48v0qb14M5zAHpLOL2GUoCbdWG44GDWfezymZcYbvnaO2QIDAQABo1AwTjAdBgNVHQ4EFgQUfQixBT210TwWyZ4l4ZvXPWuj2XYwHwYDVR0jBBgwFoAUfQixBT210TwWyZ4l4ZvXPWuj2XYwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOBgQAY3Qs9/pb6Zzdrsd/CkjpTENQCavRpfbchPZrqG5ZS2Sl/IqoFqMx4himW51+Cj/ICGAOGx/q2b84Sb+11LyHB+L6uMWSWM6egPPiNaPojQQcEPvhoNdNjrtBAoOZo4LlvQ0R7u55hmqxVQDAPwdPOOILeMAHKDsiqx3E6xfzImQ==`;
const pem = `-----BEGIN CERTIFICATE-----\n${SAMPLE_CERT}\n-----END CERTIFICATE-----`;

describe('buildUnprotectedHeaders', () => {
  it('should create unprotected headers with certificate chain', () => {
    const cert = new X509Certificate(pem);
    const headers = buildUnprotectedHeaders(cert);

    expect(headers).toBeInstanceOf(UnprotectedHeaders);
    const x5chain = headers.get(Headers.X5Chain)!;
    expect(x5chain).toBeInstanceOf(Uint8Array);
    expect(x5chain.length).toBeGreaterThan(0);
  });

  it('should handle certificate with raw data', () => {
    const cert = new X509Certificate(pem);
    const headers = buildUnprotectedHeaders(cert);
    const x5chain = headers.get(Headers.X5Chain);

    // Verify that the certificate's raw data is included in the headers
    expect(x5chain).toEqual(new Uint8Array(cert.raw));
  });
});
