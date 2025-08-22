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
  describe('success cases', () => {
    it('should accept valid digest algorithms', () => {
      ALLOWED_DIGEST_ALGORITHMS.forEach((algorithm) => {
        expect(digestAlgorithmSchema.parse(algorithm)).toBe(algorithm);
      });
    });
  });

  describe('error cases', () => {
    const cases: Array<{
      name: string;
      value: unknown;
      expectedMessage: string;
    }> = [
      {
        name: 'invalid type: number',
        value: 123,
        expectedMessage: DIGEST_ALGORITHM_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'invalid type: boolean',
        value: true,
        expectedMessage: DIGEST_ALGORITHM_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'invalid type: null',
        value: null,
        expectedMessage: DIGEST_ALGORITHM_INVALID_TYPE_MESSAGE,
      },
      {
        name: 'required value missing: undefined',
        value: undefined,
        expectedMessage: DIGEST_ALGORITHM_REQUIRED_MESSAGE,
      },
      {
        name: 'disallowed algorithm: MD5',
        value: 'MD5',
        expectedMessage: DIGEST_ALGORITHM_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'disallowed algorithm: SHA-1',
        value: 'SHA-1',
        expectedMessage: DIGEST_ALGORITHM_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'disallowed algorithm: SHA-224',
        value: 'SHA-224',
        expectedMessage: DIGEST_ALGORITHM_INVALID_VALUE_MESSAGE,
      },
      {
        name: 'disallowed algorithm: invalid',
        value: 'invalid',
        expectedMessage: DIGEST_ALGORITHM_INVALID_VALUE_MESSAGE,
      },
    ];

    cases.forEach(({ name, value, expectedMessage }) => {
      it(name, () => {
        try {
          digestAlgorithmSchema.parse(value);
          expect.unreachable('Expected parsing to throw');
        } catch (err) {
          expect(err).toBeInstanceOf(ZodError);
          const issues = (err as ZodError).issues;
          expect(issues[0]?.message).toBe(expectedMessage);
        }
      });
    });
  });
});
