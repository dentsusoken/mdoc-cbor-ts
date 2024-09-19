import { EnvLoader } from './EnvLoader';
import {
  CBORTAGS_ATTR_MAP,
  COSEKEY_HAZMAT_CRV_MAP,
  CRV_LEN_MAP,
  DIGEST_SALT_LENGTH,
  HASHALG_MAP,
  TSMDOC_EXP_DELTA_HOURS,
  TSMDOC_HASHALG,
  X509_COMMON_NAME,
  X509_COUNTRY_NAME,
  X509_DER_CERT,
  X509_LOCALITY_NAME,
  X509_NOT_VALID_AFTER,
  X509_NOT_VALID_AFTER_DAYS,
  X509_NOT_VALID_BEFORE,
  X509_ORGANIZATION_NAME,
  X509_SAN_URL,
  X509_STATE_OR_PROVINCE_NAME,
} from './settings';

const notValidAfter = new Date();
const notValidBefore = new Date();

describe('settings', () => {
  beforeEach(() => {
    EnvLoader.load({
      TSMDOC_EXP_DELTA_HOURS: '10',
      TSMDOC_HASHALG: 'SHA-512',
      X509_COMMON_NAME: 'test',
      X509_COUNTRY_NAME: 'UK',
      X509_DER_CERT: 'test',
      X509_LOCALITY_NAME: 'test',
      X509_NOT_VALID_AFTER: notValidAfter.toString(),
      X509_NOT_VALID_AFTER_DAYS: '0',
      X509_NOT_VALID_BEFORE: notValidBefore.toString(),
      X509_ORGANIZATION_NAME: 'test',
      X509_SAN_URL: 'test',
      X509_STATE_OR_PROVINCE_NAME: 'test',
    });
  });
  describe('CBORTAGS_ATTR_MAP', () => {
    it('should be defined', () => {
      expect(CBORTAGS_ATTR_MAP).toBeDefined();
    });
  });
  describe('COSEKEY_HAZMAT_CRV_MAP', () => {
    it('should be defined', () => {
      expect(COSEKEY_HAZMAT_CRV_MAP).toBeDefined();
    });
  });
  describe('CRV_LEN_MAP', () => {
    it('should be defined', () => {
      expect(CRV_LEN_MAP).toBeDefined();
    });
  });
  describe('DIGEST_SALT_LENGTH', () => {
    it('should be defined', () => {
      expect(DIGEST_SALT_LENGTH).toBeDefined();
    });
  });
  describe('HASHALG_MAP', () => {
    it('should be defined', () => {
      expect(HASHALG_MAP).toBeDefined();
    });
  });
  describe('TSMDOC_EXP_DELTA_HOURS', () => {
    it('should return env value', () => {
      expect(TSMDOC_EXP_DELTA_HOURS()).toEqual(10);
    });
    it('should return default value', () => {
      EnvLoader.load({
        TSMDOC_EXP_DELTA_HOURS: undefined,
      });
      expect(TSMDOC_EXP_DELTA_HOURS()).toEqual(0);
    });
  });
  describe('TSMDOC_HASHALG', () => {
    it('should return env value', () => {
      expect(TSMDOC_HASHALG()).toEqual('SHA-512');
    });
    it('should return default value', () => {
      EnvLoader.load({
        TSMDOC_HASHALG: undefined,
      });
      expect(TSMDOC_HASHALG()).toEqual('SHA-256');
    });
  });
  describe('X509_COMMON_NAME', () => {
    it('should return env value', () => {
      expect(X509_COMMON_NAME()).toEqual('test');
    });
    it('should return default value', () => {
      EnvLoader.load({
        X509_COMMON_NAME: undefined,
      });
      expect(X509_COMMON_NAME()).toEqual('mysite.com');
    });
  });
  describe('X509_COUNTRY_NAME', () => {
    it('should return env value', () => {
      expect(X509_COUNTRY_NAME()).toEqual('UK');
    });
    it('should return default value', () => {
      EnvLoader.load({
        X509_COUNTRY_NAME: undefined,
      });
      expect(X509_COUNTRY_NAME()).toEqual('US');
    });
  });
  describe('X509_DER_CERT', () => {
    it('should return env value', () => {
      expect(X509_DER_CERT()).toEqual('test');
    });
    it('should return default value', () => {
      EnvLoader.load({
        X509_DER_CERT: undefined,
      });
      expect(X509_DER_CERT()).toEqual(undefined);
    });
  });
  describe('X509_LOCALITY_NAME', () => {
    it('should return env value', () => {
      expect(X509_LOCALITY_NAME()).toEqual('test');
    });
    it('should return default value', () => {
      EnvLoader.load({
        X509_LOCALITY_NAME: undefined,
      });
      expect(X509_LOCALITY_NAME()).toEqual('San Francisco');
    });
  });
  describe('X509_NOT_VALID_AFTER', () => {
    it('should return env value', () => {
      expect(X509_NOT_VALID_AFTER()).toEqual(
        new Date(notValidAfter.toString())
      );
    });
    it('should return default value', () => {
      EnvLoader.load({
        X509_NOT_VALID_AFTER: undefined,
      });
      const now = new Date();
      expect(X509_NOT_VALID_AFTER().getDate()).toEqual(now.getDate() + 10);
    });
  });
  describe('X509_NOT_VALID_AFTER_DAYS', () => {
    it('should return env value', () => {
      expect(X509_NOT_VALID_AFTER_DAYS()).toEqual(0);
    });
    it('should return default value', () => {
      EnvLoader.load({
        X509_NOT_VALID_AFTER_DAYS: undefined,
      });
      expect(X509_NOT_VALID_AFTER_DAYS()).toEqual(10);
    });
  });
  describe('X509_NOT_VALID_BEFORE', () => {
    it('should return env value', () => {
      expect(X509_NOT_VALID_BEFORE()).toEqual(
        new Date(notValidBefore.toString())
      );
    });
    it('should return default value', () => {
      EnvLoader.load({
        X509_NOT_VALID_BEFORE: undefined,
      });
      const before = new Date();
      const target = X509_NOT_VALID_BEFORE();
      const after = new Date();
      expect(before <= target && target <= after).toBe(true);
    });
  });
  describe('X509_ORGANIZATION_NAME', () => {
    it('should return env value', () => {
      expect(X509_ORGANIZATION_NAME()).toEqual('test');
    });
    it('should return default value', () => {
      EnvLoader.load({
        X509_ORGANIZATION_NAME: undefined,
      });
      expect(X509_ORGANIZATION_NAME()).toEqual('My Company');
    });
  });
  describe('X509_SAN_URL', () => {
    it('should return env value', () => {
      expect(X509_SAN_URL()).toEqual('test');
    });
    it('should return default value', () => {
      EnvLoader.load({
        X509_SAN_URL: undefined,
      });
      expect(X509_SAN_URL()).toEqual(
        'https://credential-issuer.oidc-federation.online'
      );
    });
  });
  describe('X509_STATE_OR_PROVINCE_NAME', () => {
    it('should return env value', () => {
      expect(X509_STATE_OR_PROVINCE_NAME()).toEqual('test');
    });
    it('should return default value', () => {
      EnvLoader.load({
        X509_STATE_OR_PROVINCE_NAME: undefined,
      });
      expect(X509_STATE_OR_PROVINCE_NAME()).toEqual('California');
    });
  });
});
