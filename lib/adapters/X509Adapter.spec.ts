import { COSEKey } from '@auth0/cose';
import { X509Certificate } from '@peculiar/x509';
import { describe, expect, it } from 'vitest';
import { X509Adapter } from './X509Adapter';

const SAMPLE_CERT = `MIICQDCCAamgAwIBAgIBADANBgkqhkiG9w0BAQsFADA9MQswCQYDVQQGEwJ1czEQMA4GA1UECAwHQWxhYmFtYTENMAsGA1UECgwEVGVzdDENMAsGA1UEAwwEVGVzdDAeFw0yNTAzMDUxMDU4NDVaFw0yNjAzMDUxMDU4NDVaMD0xCzAJBgNVBAYTAnVzMRAwDgYDVQQIDAdBbGFiYW1hMQ0wCwYDVQQKDARUZXN0MQ0wCwYDVQQDDARUZXN0MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGV5Y+z0dZ/TG5sVOqPa/7b0rLncHDst2heR4cfhPVk23NEmrHut25mzPH3x9z/IDQggR3Tg3gs964RMnxRic1Q5rG19Z3K9KeRqChBuNMOyLRMrTE79QZjGAWEe1m48v0qb14M5zAHpLOL2GUoCbdWG44GDWfezymZcYbvnaO2QIDAQABo1AwTjAdBgNVHQ4EFgQUfQixBT210TwWyZ4l4ZvXPWuj2XYwHwYDVR0jBBgwFoAUfQixBT210TwWyZ4l4ZvXPWuj2XYwDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOBgQAY3Qs9/pb6Zzdrsd/CkjpTENQCavRpfbchPZrqG5ZS2Sl/IqoFqMx4himW51+Cj/ICGAOGx/q2b84Sb+11LyHB+L6uMWSWM6egPPiNaPojQQcEPvhoNdNjrtBAoOZo4LlvQ0R7u55hmqxVQDAPwdPOOILeMAHKDsiqx3E6xfzImQ==`;

describe('X509Adapter', () => {
  describe('constructor', () => {
    it('should create an X509Adapter instance', () => {
      const certificate = new X509Certificate(SAMPLE_CERT);
      const privateKey = COSEKey.fromJWK({
        kty: 'EC',
        crv: 'P-256',
        x: 'test-x',
        y: 'test-y',
        d: 'test-d',
      });

      const adapter = new X509Adapter(certificate, privateKey);
      expect(adapter).toBeInstanceOf(X509Adapter);
    });
  });

  describe('certificate', () => {
    it('should return the certificate', () => {
      const certificate = new X509Certificate(SAMPLE_CERT);
      const privateKey = COSEKey.fromJWK({
        kty: 'EC',
        crv: 'P-256',
        x: 'test-x',
        y: 'test-y',
        d: 'test-d',
      });

      const adapter = new X509Adapter(certificate, privateKey);
      expect(adapter.certificate).toBe(certificate);
    });
  });

  describe('privateKey', () => {
    it('should return the private key', () => {
      const certificate = new X509Certificate(SAMPLE_CERT);
      const privateKey = COSEKey.fromJWK({
        kty: 'EC',
        crv: 'P-256',
        x: 'test-x',
        y: 'test-y',
        d: 'test-d',
      });

      const adapter = new X509Adapter(certificate, privateKey);
      expect(adapter.privateKey).toBe(privateKey);
    });
  });

  describe('importJWKPrivateKey', () => {
    it('should create an X509Adapter from a JWK', async () => {
      const jwk = {
        kty: 'EC',
        crv: 'P-256',
        x: 'test-x',
        y: 'test-y',
        d: 'test-d',
        x5c: [SAMPLE_CERT],
      };

      const adapter = await X509Adapter.importJWKPrivateKey(jwk);
      expect(adapter).toBeInstanceOf(X509Adapter);
      expect(adapter.certificate).toBeInstanceOf(X509Certificate);
      expect(adapter.privateKey).toBeInstanceOf(COSEKey);
    });

    it('should throw error when x5c is missing', async () => {
      const jwk = {
        kty: 'EC',
        crv: 'P-256',
        x: 'test-x',
        y: 'test-y',
        d: 'test-d',
      };

      await expect(X509Adapter.importJWKPrivateKey(jwk)).rejects.toThrow(
        'x5c is required'
      );
    });

    it('should throw error when x5c is empty', async () => {
      const jwk = {
        kty: 'EC',
        crv: 'P-256',
        x: 'test-x',
        y: 'test-y',
        d: 'test-d',
        x5c: [],
      };

      await expect(X509Adapter.importJWKPrivateKey(jwk)).rejects.toThrow(
        'x5c is required'
      );
    });
  });
});
