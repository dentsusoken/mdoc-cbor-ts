import { describe, expect, it } from 'vitest';
import { isDigestAlgorithm } from '../isDigestAlgorithm';
import { DigestAlgorithm } from '../types';

describe('isDigestAlgorithm', (): void => {
  describe('should return true for valid algorithms', (): void => {
    it('accepts all DigestAlgorithm enum values', (): void => {
      expect(isDigestAlgorithm(DigestAlgorithm.SHA256)).toBe(true);
      expect(isDigestAlgorithm(DigestAlgorithm.SHA384)).toBe(true);
      expect(isDigestAlgorithm(DigestAlgorithm.SHA512)).toBe(true);
    });

    it('accepts a literal that matches an enum value', (): void => {
      expect(isDigestAlgorithm('SHA-256')).toBe(true);
      expect(isDigestAlgorithm('SHA-384')).toBe(true);
      expect(isDigestAlgorithm('SHA-512')).toBe(true);
    });
  });

  describe('should return false for invalid inputs', (): void => {
    it('rejects strings that are close but not exact', (): void => {
      const invalids = ['sha-256', 'SHA256', 'MD5', 'SHA-1', ''];
      invalids.forEach((value) => {
        expect(isDigestAlgorithm(value)).toBe(false);
      });
    });

    it('rejects non-string values', (): void => {
      const invalids = [undefined, null, 123, {}, []] as unknown[];
      invalids.forEach((v) => {
        // Cast to string to satisfy the function signature; runtime should return false
        expect(isDigestAlgorithm(v as unknown as string)).toBe(false);
      });
    });
  });
});
