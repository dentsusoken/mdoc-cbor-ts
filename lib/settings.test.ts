import { describe, it, expect } from 'vitest';
import { Settings } from './settings';
import { DateTime } from 'luxon';

describe('Settings', () => {
  describe('constructor', () => {
    it('should initialize with given environment variables', () => {
      const env = { TEST_KEY: 'testValue' };
      const settings = new Settings(env);

      expect(settings).toBeInstanceOf(Settings);
    });
  });

  describe('COSEKEY_HAZMAT_CRV_MAP', () => {
    it('should have correct curve mappings', () => {
      const settings = new Settings();

      expect(settings.COSEKEY_HAZMAT_CRV_MAP.secp256r1).toBe('P-256');
      expect(settings.COSEKEY_HAZMAT_CRV_MAP.secp384r1).toBe('P-384');
      expect(settings.COSEKEY_HAZMAT_CRV_MAP.secp521r1).toBe('P-521');
    });
  });

  describe('CRV_LEN_MAP', () => {
    it('should have correct curve length mappings', () => {
      const settings = new Settings();

      expect(settings.CRV_LEN_MAP.secp256r1).toBe(32);
      expect(settings.CRV_LEN_MAP.secp384r1).toBe(48);
      expect(settings.CRV_LEN_MAP.secp521r1).toBe(66);
    });
  });

  describe('TSMDOC_HASHALG', () => {
    it('should return default hash algorithm', () => {
      const settings = new Settings();

      expect(settings.TSMDOC_HASHALG()).toBe('SHA-256');
    });

    it('should return hash algorithm from environment', () => {
      const env = { TSMDOC_HASHALG: 'SHA-512' };
      const settings = new Settings(env);

      expect(settings.TSMDOC_HASHALG()).toBe('SHA-512');
    });
  });

  describe('TSMDOC_EXP_DELTA_HOURS', () => {
    it('should return default expiration delta hours', () => {
      const settings = new Settings();

      expect(settings.TSMDOC_EXP_DELTA_HOURS()).toBe(0);
    });

    it('should return expiration delta hours from environment', () => {
      const env = { TSMDOC_EXP_DELTA_HOURS: '5' };
      const settings = new Settings(env);

      expect(settings.TSMDOC_EXP_DELTA_HOURS()).toBe(5);
    });
  });

  describe('HASHALG_MAP', () => {
    it('should have correct hash algorithm mappings', () => {
      const settings = new Settings();

      expect(settings.HASHALG_MAP['SHA-256']).toBe('sha256');
      expect(settings.HASHALG_MAP['SHA-512']).toBe('sha512');
    });
  });

  describe('DIGEST_SALT_LENGTH', () => {
    it('should have correct digest salt length', () => {
      const settings = new Settings();

      expect(settings.DIGEST_SALT_LENGTH).toBe(32);
    });
  });

  describe('X509_DER_CERT', () => {
    it('should return default X509 DER certificate', () => {
      const settings = new Settings();

      expect(settings.X509_DER_CERT()).toBe('');
    });

    it('should return X509 DER certificate from environment', () => {
      const env = { X509_DER_CERT: 'cert' };
      const settings = new Settings(env);

      expect(settings.X509_DER_CERT()).toBe('cert');
    });
  });

  describe('X509_NOT_VALID_BEFORE', () => {
    it('should return default not valid before date', () => {
      const settings = new Settings();

      expect(settings.X509_NOT_VALID_BEFORE()).toBeInstanceOf(Date);
    });

    it('should return not valid before date from environment', () => {
      const env = { X509_NOT_VALID_BEFORE: '2024-10-08' };
      const settings = new Settings(env);

      expect(settings.X509_NOT_VALID_BEFORE()).toStrictEqual(
        DateTime.fromFormat('2024-10-08', 'yyyy-MM-dd').toJSDate()
      );
    });
  });

  describe('X509_NOT_VALID_AFTER', () => {
    it('should return default not valid after date', () => {
      const settings = new Settings();

      expect(settings.X509_NOT_VALID_BEFORE()).toBeInstanceOf(Date);
    });

    it('should return not valid after date from environment', () => {
      const env = { X509_NOT_VALID_AFTER: '2024-10-08' };
      const settings = new Settings(env);

      expect(settings.X509_NOT_VALID_AFTER()).toStrictEqual(
        DateTime.fromFormat('2024-10-08', 'yyyy-MM-dd').toJSDate()
      );
    });
  });

  describe('CBORTAGS_ATTR_MAP', () => {
    it('should have correct CBOR tags attribute mappings', () => {
      const settings = new Settings();

      expect(settings.CBORTAGS_ATTR_MAP.birth_date).toBe(1004);
      expect(settings.CBORTAGS_ATTR_MAP.expiry_date).toBe(1004);
      expect(settings.CBORTAGS_ATTR_MAP.issue_date).toBe(1004);
    });
  });
});
