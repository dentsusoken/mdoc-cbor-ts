import { describe, expect, it } from 'vitest';
import { toDigestAlgorithm } from '../toDigestAlgorithm';
import { DigestAlgorithm } from '../types';

describe('toDigestAlgorithm', (): void => {
  describe('should convert valid inputs', (): void => {
    it('accepts enum values', (): void => {
      expect(toDigestAlgorithm(DigestAlgorithm.SHA256)).toBe(
        DigestAlgorithm.SHA256
      );
      expect(toDigestAlgorithm(DigestAlgorithm.SHA384)).toBe(
        DigestAlgorithm.SHA384
      );
      expect(toDigestAlgorithm(DigestAlgorithm.SHA512)).toBe(
        DigestAlgorithm.SHA512
      );
    });

    it('accepts matching string literals', (): void => {
      expect(toDigestAlgorithm('SHA-256')).toBe(DigestAlgorithm.SHA256);
      expect(toDigestAlgorithm('SHA-384')).toBe(DigestAlgorithm.SHA384);
      expect(toDigestAlgorithm('SHA-512')).toBe(DigestAlgorithm.SHA512);
    });
  });

  describe('should throw for invalid inputs', (): void => {
    it('rejects non-enum strings with exact message', (): void => {
      const invalids = ['SHA256', 'sha-256', 'MD5', 'SHA-1', ''];
      invalids.forEach((value) => {
        expect(() => toDigestAlgorithm(value)).toThrowError(
          `Unsupported COSE digest algorithm: ${value}`
        );
      });
    });
  });
});
