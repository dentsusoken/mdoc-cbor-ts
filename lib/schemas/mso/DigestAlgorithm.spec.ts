import { describe, expect, it } from 'vitest';
import { digestAlgorithmSchema } from './DigestAlgorithm';

describe('DigestAlgorithm', () => {
  it('should accept valid digest algorithms', () => {
    const validAlgorithms = ['SHA-256', 'SHA-384', 'SHA-512'];

    validAlgorithms.forEach((algorithm) => {
      expect(() => digestAlgorithmSchema.parse(algorithm)).not.toThrow();
      expect(digestAlgorithmSchema.parse(algorithm)).toBe(algorithm);
    });
  });

  it('should throw error for invalid algorithms', () => {
    const invalidAlgorithms = [
      'MD5',
      'SHA-1',
      'SHA-224',
      'invalid',
      123,
      true,
      null,
      undefined,
    ];

    invalidAlgorithms.forEach((algorithm) => {
      expect(() => digestAlgorithmSchema.parse(algorithm)).toThrow();
    });
  });
});
