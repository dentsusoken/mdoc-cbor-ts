import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import {
  digestAlgorithmSchema,
  ALLOWED_DIGEST_ALGORITHMS,
  DIGEST_ALGORITHM_INVALID_TYPE_MESSAGE,
  DIGEST_ALGORITHM_REQUIRED_MESSAGE,
  DIGEST_ALGORITHM_INVALID_VALUE_MESSAGE,
} from '../DigestAlgorithm';

describe('DigestAlgorithm', () => {
  it('should accept valid digest algorithms', () => {
    ALLOWED_DIGEST_ALGORITHMS.forEach((algorithm) => {
      expect(digestAlgorithmSchema.parse(algorithm)).toBe(algorithm);
    });
  });

  it('should throw error for invalid type', () => {
    const cases = [123, true, null];
    cases.forEach((value) => {
      try {
        digestAlgorithmSchema.parse(value);
        expect.unreachable('Expected parsing to throw');
      } catch (err) {
        expect(err).toBeInstanceOf(ZodError);
        const issues = (err as ZodError).issues;
        expect(issues[0]?.message).toBe(DIGEST_ALGORITHM_INVALID_TYPE_MESSAGE);
      }
    });
  });

  it('should throw error when required value is missing', () => {
    try {
      digestAlgorithmSchema.parse(undefined);
      expect.unreachable('Expected parsing to throw');
    } catch (err) {
      expect(err).toBeInstanceOf(ZodError);
      const issues = (err as ZodError).issues;
      expect(issues[0]?.message).toBe(DIGEST_ALGORITHM_REQUIRED_MESSAGE);
    }
  });

  it('should throw error for disallowed algorithm string', () => {
    const cases = ['MD5', 'SHA-1', 'SHA-224', 'invalid'];
    cases.forEach((value) => {
      try {
        digestAlgorithmSchema.parse(value);
        expect.unreachable('Expected parsing to throw');
      } catch (err) {
        expect(err).toBeInstanceOf(ZodError);
        const issues = (err as ZodError).issues;
        expect(issues[0]?.message).toBe(DIGEST_ALGORITHM_INVALID_VALUE_MESSAGE);
      }
    });
  });
});
