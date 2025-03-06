import { describe, expect, it } from 'vitest';
import { DigestAlgorithm } from '../schemas/mso';
import { Configuration } from './Configuration';

describe('Configuration', () => {
  describe('constructor', () => {
    it('should create a configuration with default values when no options provided', () => {
      const config = new Configuration({});
      expect(config.digestAlgorithm).toBe('SHA-256');
      expect(config.validFrom).toBe(0);
      expect(config.validUntil).toBe(365 * 24 * 60 * 60 * 1000); // 1 year in milliseconds
      expect(config.expectedUpdate).toBeUndefined();
      expect(config.tagElements).toEqual({
        birth_date: 1004,
        expiry_date: 1004,
        issue_date: 1004,
      });
    });

    it('should create a configuration with custom values', () => {
      const customOptions = {
        digestAlgorithm: 'SHA-384' as DigestAlgorithm,
        validFrom: 1000,
        validUntil: 2000,
        expectedUpdate: 1500,
        tagElements: {
          birth_date: 2000,
          custom_tag: 3000,
        },
      };

      const config = new Configuration(customOptions);
      expect(config.digestAlgorithm).toBe('SHA-384');
      expect(config.validFrom).toBe(1000);
      expect(config.validUntil).toBe(2000);
      expect(config.expectedUpdate).toBe(1500);
      expect(config.tagElements).toEqual({
        birth_date: 2000,
        expiry_date: 1004,
        issue_date: 1004,
        custom_tag: 3000,
      });
    });
  });

  describe('getters', () => {
    it('should return default digest algorithm when not specified', () => {
      const config = new Configuration({});
      expect(config.digestAlgorithm).toBe('SHA-256');
    });

    it('should return custom digest algorithm when specified', () => {
      const config = new Configuration({ digestAlgorithm: 'SHA-384' });
      expect(config.digestAlgorithm).toBe('SHA-384');
    });

    it('should return default validFrom when not specified', () => {
      const config = new Configuration({});
      expect(config.validFrom).toBe(0);
    });

    it('should return custom validFrom when specified', () => {
      const config = new Configuration({ validFrom: 1000 });
      expect(config.validFrom).toBe(1000);
    });

    it('should return default validUntil when not specified', () => {
      const config = new Configuration({});
      expect(config.validUntil).toBe(365 * 24 * 60 * 60 * 1000);
    });

    it('should return custom validUntil when specified', () => {
      const config = new Configuration({ validUntil: 2000 });
      expect(config.validUntil).toBe(2000);
    });

    it('should return undefined for expectedUpdate when not specified', () => {
      const config = new Configuration({});
      expect(config.expectedUpdate).toBeUndefined();
    });

    it('should return custom expectedUpdate when specified', () => {
      const config = new Configuration({ expectedUpdate: 1500 });
      expect(config.expectedUpdate).toBe(1500);
    });

    it('should return default tagElements when not specified', () => {
      const config = new Configuration({});
      expect(config.tagElements).toEqual({
        birth_date: 1004,
        expiry_date: 1004,
        issue_date: 1004,
      });
    });

    it('should merge custom tagElements with defaults', () => {
      const config = new Configuration({
        tagElements: {
          birth_date: 2000,
          custom_tag: 3000,
        },
      });
      expect(config.tagElements).toEqual({
        birth_date: 2000,
        expiry_date: 1004,
        issue_date: 1004,
        custom_tag: 3000,
      });
    });
  });
});
