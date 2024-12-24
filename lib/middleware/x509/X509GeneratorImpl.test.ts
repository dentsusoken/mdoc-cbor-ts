import { describe, it, expect, beforeEach, vi } from 'vitest';
import { X509GeneratorImpl, X509GeneratorConfig } from './X509GeneratorImpl';
import { KeyManager } from '../keys';
import * as x509 from '@peculiar/x509';

vi.mock('@peculiar/x509', () => {
  return {
    X509CertificateGenerator: {
      createSelfSigned: vi.fn().mockResolvedValue({
        rawData: new ArrayBuffer(0),
        toString: vi
          .fn()
          .mockReturnValue('-----BEGIN CERTIFICATE-----\nMIIB...'),
      }),
    },
    SubjectAlternativeNameExtension: vi.fn().mockImplementation((names) => ({
      names: names.map((name: { type: string; value: string }) => ({
        type: name.type,
        value: name.value,
      })),
    })),
    GeneralName: vi.fn().mockImplementation((type, value) => ({
      type,
      value,
    })),
  };
});

describe('X509GeneratorImpl', () => {
  let keyManager: KeyManager;
  let config: X509GeneratorConfig;
  let generator: X509GeneratorImpl;
  let originalCrypto: Crypto;

  beforeEach(() => {
    // Save original crypto
    originalCrypto = global.crypto;

    // Mock crypto.getRandomValues
    Object.defineProperty(global, 'crypto', {
      value: {
        getRandomValues: vi.fn().mockReturnValue(new Uint8Array(32)),
      },
      configurable: true,
    });

    // Mock KeyManager
    keyManager = {
      getCryptoKeyPair: vi.fn().mockResolvedValue({
        privateKey: {
          algorithm: {
            name: 'ECDSA',
          },
        },
        publicKey: {},
      }),
    } as unknown as KeyManager;

    // Mock X509Configuration
    config = {
      X509_COUNTRY_NAME: 'JP',
      X509_STATE_OR_PROVINCE_NAME: 'Tokyo',
      X509_LOCALITY_NAME: 'Chiyoda',
      X509_ORGANIZATION_NAME: 'Example Corp',
      X509_COMMON_NAME: 'example.com',
      X509_NOT_VALID_BEFORE: new Date('2023-01-01'),
      X509_NOT_VALID_AFTER: new Date('2024-01-01'),
      X509_SAN_URL: 'https://example.com',
      NAMED_CURVE: 'P-256',
      KEY_ALGORITHM: 'ES256',
      HASH_ALGORITHM: 'SHA-256',
    };

    generator = new X509GeneratorImpl(keyManager, config);
  });

  afterEach(() => {
    // Restore original crypto
    Object.defineProperty(global, 'crypto', {
      value: originalCrypto,
      configurable: true,
    });
  });

  describe('generate', () => {
    it('should generate PEM certificate', async () => {
      const cert = await generator.generate('pem');
      expect(typeof cert).toBe('string');
      expect(cert).toContain('-----BEGIN CERTIFICATE-----');
      expect(keyManager.getCryptoKeyPair).toHaveBeenCalled();
      expect(x509.X509CertificateGenerator.createSelfSigned).toHaveBeenCalled();
    });

    it('should generate DER certificate', async () => {
      const cert = await generator.generate('der');
      expect(cert).toBeInstanceOf(ArrayBuffer);
      expect(keyManager.getCryptoKeyPair).toHaveBeenCalled();
      expect(x509.X509CertificateGenerator.createSelfSigned).toHaveBeenCalled();
    });

    it('should use correct configuration values', async () => {
      await generator.generate('pem');

      const createSelfSignedCall = (
        x509.X509CertificateGenerator.createSelfSigned as ReturnType<
          typeof vi.fn
        >
      ).mock.calls[0][0];
      expect(createSelfSignedCall.name).toContain(
        `C=${config.X509_COUNTRY_NAME}`
      );
      expect(createSelfSignedCall.name).toContain(
        `ST=${config.X509_STATE_OR_PROVINCE_NAME}`
      );
      expect(createSelfSignedCall.name).toContain(
        `L=${config.X509_LOCALITY_NAME}`
      );
      expect(createSelfSignedCall.name).toContain(
        `O=${config.X509_ORGANIZATION_NAME}`
      );
      expect(createSelfSignedCall.name).toContain(
        `CN=${config.X509_COMMON_NAME}`
      );
      expect(createSelfSignedCall.notBefore).toStrictEqual(
        config.X509_NOT_VALID_BEFORE
      );
      expect(createSelfSignedCall.notAfter).toStrictEqual(
        config.X509_NOT_VALID_AFTER
      );
    });

    it('should include subject alternative name extension', async () => {
      await generator.generate('pem');

      const createSelfSignedCall = (
        x509.X509CertificateGenerator.createSelfSigned as ReturnType<
          typeof vi.fn
        >
      ).mock.calls[0][0];
      // @ts-expect-error
      const sanExtension = createSelfSignedCall.extensions[0];

      expect(x509.SubjectAlternativeNameExtension).toHaveBeenCalled();
      expect(x509.GeneralName).toHaveBeenCalledWith('url', config.X509_SAN_URL);
    });
  });
});
