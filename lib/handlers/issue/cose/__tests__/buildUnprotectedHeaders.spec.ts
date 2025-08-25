import { Headers, UnprotectedHeaders } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { buildUnprotectedHeaders } from '../buildUnprotectedHeaders';

describe('buildUnprotectedHeaders', () => {
  it('should create unprotected headers with single certificate', () => {
    const certBytes = new Uint8Array([
      0x30, 0x82, 0x01, 0x3d, 0x30, 0x82, 0x01, 0x26,
    ]);
    const headers = buildUnprotectedHeaders([certBytes]);

    expect(headers).toBeInstanceOf(UnprotectedHeaders);
    const x5chain = headers.get(Headers.X5Chain);
    expect(x5chain).toBeInstanceOf(Array);
    expect(x5chain).toHaveLength(1);
    expect(x5chain![0]).toEqual(certBytes);
  });

  it('should create unprotected headers with certificate chain', () => {
    const leafCert = new Uint8Array([0x30, 0x82, 0x01, 0x3d]); // leaf certificate bytes
    const intermediateCert = new Uint8Array([0x30, 0x82, 0x01, 0x4a]); // intermediate certificate bytes
    const rootCert = new Uint8Array([0x30, 0x82, 0x01, 0x5b]); // root certificate bytes

    const headers = buildUnprotectedHeaders([
      leafCert,
      intermediateCert,
      rootCert,
    ]);

    expect(headers).toBeInstanceOf(UnprotectedHeaders);
    const x5chain = headers.get(Headers.X5Chain);
    expect(x5chain).toBeInstanceOf(Array);
    expect(x5chain).toHaveLength(3);
    expect(x5chain![0]).toEqual(leafCert);
    expect(x5chain![1]).toEqual(intermediateCert);
    expect(x5chain![2]).toEqual(rootCert);
  });

  it('should handle certificates from base64 encoded data', () => {
    const certBase64 =
      'MIICQDCCAamgAwIBAgIBADANBgkqhkiG9w0BAQsFADA9MQswCQYDVQQGEwJ1czEQMA4GA1UECAwHQWxhYmFtYTENMAsGA1UECgwEVGVzdDENMAsGA1UEAwwEVGVzdDAeFw0yNTAzMDUxMDU4NDVaFw0yNjAzMDUxMDU4NDVaMD0xCzAJBgNVBAYTAnVzMRAwDgYDVQQIDAdBbGFiYW1hMQ0wCwYDVQQKDARUZXN0MQ0wCwYDVQQDDARUZXN0MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGV5Y+z0dZ/TG5sVOqPa/7b0rLncHDst2heR4cfhPVk23NEmrHut25mzPH3x9z/IDQggR3Tg3gs964RMnxRic1Q5rG19Z3K9KeRqChBuNMOyLRMrTE79QZjGAWEe1m48v0qb14M5zAHpLOL2GUoCbdWG44GDWfezymZcYbvnaO2QIDAQABo1AwTjAdBgNVHQ4EFgQUfQixBT210TwWyZ4l4ZvXPWuj2XYwHwYDVR0jBBgwFoAUfQixBT210TwWyZ4l4ZvXPWuj2XYwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOBgQAY3Qs9/pb6Zzdrsd/CkjpTENQCavRpfbchPZrqG5ZS2Sl/IqoFqMx4himW51+Cj/ICGAOGx/q2b84Sb+11LyHB+L6uMWSWM6egPPiNaPojQQcEPvhoNdNjrtBAoOZo4LlvQ0R7u55hmqxVQDAPwdPOOILeMAHKDsiqx3E6xfzImQ==';
    const certBytes = Buffer.from(certBase64, 'base64');
    const certU8a = new Uint8Array(
      certBytes,
      certBytes.byteOffset,
      certBytes.byteLength
    );

    const headers = buildUnprotectedHeaders([certU8a]);

    expect(headers).toBeInstanceOf(UnprotectedHeaders);
    const x5chain = headers.get(Headers.X5Chain);
    expect(x5chain).toHaveLength(1);
    expect(x5chain![0]).toEqual(certU8a);
  });
});
