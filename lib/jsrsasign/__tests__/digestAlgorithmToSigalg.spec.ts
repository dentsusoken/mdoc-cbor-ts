import { describe, it, expect } from 'vitest';
import { digestAlgorithmToSigalg } from '../digestAlgorithmToSigalg';
import type { Sigalg } from '../types';

describe('digestAlgorithmToSigalg', () => {
  it('should convert SHA-256 to SHA256withECDSA', () => {
    const result = digestAlgorithmToSigalg('SHA-256');
    expect(result).toBe('SHA256withECDSA');
  });

  it('should convert SHA-384 to SHA384withECDSA', () => {
    const result = digestAlgorithmToSigalg('SHA-384');
    expect(result).toBe('SHA384withECDSA');
  });

  it('should convert SHA-512 to SHA512withECDSA', () => {
    const result = digestAlgorithmToSigalg('SHA-512');
    expect(result).toBe('SHA512withECDSA');
  });

  it('should return the correct type for all supported algorithms', () => {
    const algorithms: string[] = ['SHA-256', 'SHA-384', 'SHA-512'];

    algorithms.forEach((algorithm) => {
      const result = digestAlgorithmToSigalg(algorithm);
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^SHA\d+withECDSA$/);
    });
  });

  it('should throw error for unsupported digest algorithm', () => {
    // Type assertion to bypass TypeScript checking for this test
    const unsupportedAlgorithm = 'SHA-1';

    expect(() => {
      digestAlgorithmToSigalg(unsupportedAlgorithm);
    }).toThrow('Unsupported digest algorithm: SHA-1');
  });

  it('should throw error for empty string', () => {
    const emptyString = '';

    expect(() => {
      digestAlgorithmToSigalg(emptyString);
    }).toThrow('Unsupported digest algorithm: ');
  });

  it('should throw error for null-like values', () => {
    const nullValue = null as unknown as string;

    expect(() => {
      digestAlgorithmToSigalg(nullValue);
    }).toThrow('Unsupported digest algorithm: null');
  });

  it('should throw error for undefined values', () => {
    const undefinedValue = undefined as unknown as string;

    expect(() => {
      digestAlgorithmToSigalg(undefinedValue);
    }).toThrow('Unsupported digest algorithm: undefined');
  });

  it('should handle all valid DigestAlgorithm values', () => {
    const validAlgorithms = ['SHA-256', 'SHA-384', 'SHA-512'];
    const expectedResults: Sigalg[] = [
      'SHA256withECDSA',
      'SHA384withECDSA',
      'SHA512withECDSA',
    ];

    validAlgorithms.forEach((algorithm, index) => {
      const result = digestAlgorithmToSigalg(algorithm);
      expect(result).toBe(expectedResults[index]);
    });
  });

  it('should maintain consistent mapping between digest and signature algorithms', () => {
    const testCases = [
      { digest: 'SHA-256', expected: 'SHA256withECDSA' },
      { digest: 'SHA-384', expected: 'SHA384withECDSA' },
      { digest: 'SHA-512', expected: 'SHA512withECDSA' },
    ];

    testCases.forEach(({ digest, expected }) => {
      const result = digestAlgorithmToSigalg(digest);
      expect(result).toBe(expected);
    });
  });
});
