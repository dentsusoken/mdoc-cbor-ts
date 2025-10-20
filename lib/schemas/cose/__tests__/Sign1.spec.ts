import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { sign1Schema } from '../Sign1';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { Tag } from 'cbor-x';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { valueInvalidTypeMessage } from '@/schemas/messages/valueInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('Sign1', (): void => {
  const schema = sign1Schema;

  describe('tuple input', (): void => {
    describe('successful validation', (): void => {
      it('should parse a valid 4-element tuple to Tag(18, [...])', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = Uint8Array.from([]);
        const signature = Uint8Array.from([]);

        const input = [
          protectedHeaders,
          unprotectedHeaders,
          payload,
          signature,
        ] as const;
        const result = schema.parse(input);

        expect(result).toBeInstanceOf(Tag);
        const resultTag = result as Tag;
        expect(resultTag.tag).toBe(18);
        expect(resultTag.value).toEqual(input);
      });

      it('should handle null payload', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = null;
        const signature = Uint8Array.from([]);

        const input = [
          protectedHeaders,
          unprotectedHeaders,
          payload,
          signature,
        ] as const;
        const result = schema.parse(input);

        expect(result).toBeInstanceOf(Tag);
        const resultTag = result as Tag;
        expect(resultTag.tag).toBe(18);
        expect(resultTag.value).toEqual(input);
      });
    });

    describe('validation errors', (): void => {
      it('should reject undefined payload', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = undefined;
        const signature = Uint8Array.from([]);

        const input = [
          protectedHeaders,
          unprotectedHeaders,
          payload,
          signature,
        ] as const;
        try {
          schema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expectedInner = valueInvalidTypeMessage({
            expected: 'Buffer or Uint8Array',
            received: getTypeName(payload),
          });
          const expected = containerInvalidValueMessage(
            'Sign1',
            [2],
            expectedInner
          );
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject arrays with too few elements', (): void => {
        const input = [
          Uint8Array.from([]),
          new Map<number, unknown>(),
          Uint8Array.from([]),
        ];
        try {
          schema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = 'Sign1: Array must contain at least 4 element(s)';
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject arrays with too many elements', (): void => {
        const input = [
          Uint8Array.from([]),
          new Map<number, unknown>(),
          Uint8Array.from([]),
          Uint8Array.from([]),
          'extra',
        ];
        try {
          schema.parse(input as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = 'Sign1: Array must contain at most 4 element(s)';
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('should throw error for invalid type inputs', (): void => {
    const expectedMessage = (v: unknown): string =>
      containerInvalidTypeMessage({
        target: 'Sign1',
        expected:
          'Array[Uint8Array, HeaderMap, Uint8Array, Uint8Array] or Tag(18)',
        received: getTypeName(v),
      });

    const testCases: Array<{
      name: string;
      input: unknown;
      expected: (v: unknown) => string;
    }> = [
      {
        name: 'null input',
        input: null,
        expected: expectedMessage,
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: expectedMessage,
      },
      {
        name: 'boolean input',
        input: true,
        expected: expectedMessage,
      },
      {
        name: 'number input',
        input: 123,
        expected: expectedMessage,
      },
      {
        name: 'string input',
        input: 'string',
        expected: expectedMessage,
      },
      {
        name: 'plain object input',
        input: {},
        expected: expectedMessage,
      },
    ];

    testCases.forEach(({ name, input, expected }): void => {
      it(`should reject ${name}`, (): void => {
        try {
          schema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected(input));
        }
      });
    });
  });

  describe('tag input (Tag(18, [...]))', (): void => {
    describe('successful validation', (): void => {
      it('should accept Tag(18) wrapping a valid tuple', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = Uint8Array.from([]);
        const signature = Uint8Array.from([]);

        const tuple: Tag18Content = [
          protectedHeaders,
          unprotectedHeaders,
          payload,
          signature,
        ];
        const tagInput = createTag18(tuple);
        const result = schema.parse(tagInput);

        expect(result).toBeInstanceOf(Tag);
        const resultTag = result as Tag;
        expect(resultTag.tag).toBe(18);
        expect(resultTag.value).toEqual(tuple);
      });

      it('should accept Tag(18) with null payload', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = null;
        const signature = Uint8Array.from([]);

        const tuple: Tag18Content = [
          protectedHeaders,
          unprotectedHeaders,
          payload,
          signature,
        ];
        const tagInput = createTag18(tuple);
        const result = schema.parse(tagInput);

        expect(result).toBeInstanceOf(Tag);
        const resultTag = result as Tag;
        expect(resultTag.tag).toBe(18);
        expect(resultTag.value).toEqual(tuple);
      });
    });

    describe('validation errors', (): void => {
      it('should reject Tag with non-18 tag value', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = Uint8Array.from([]);
        const signature = Uint8Array.from([]);

        const badTag = new Tag(
          [protectedHeaders, unprotectedHeaders, payload, signature],
          0
        );
        try {
          schema.parse(badTag as unknown as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = containerInvalidTypeMessage({
            target: 'Sign1',
            expected: 'Tag(18)',
            received: 'Tag(0)',
          });
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject Tag(18) with undefined payload', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = undefined;
        const signature = Uint8Array.from([]);

        const badTag = createTag18([
          protectedHeaders,
          unprotectedHeaders,
          payload as unknown as never,
          signature,
        ] as never);
        try {
          schema.parse(badTag as unknown as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expectedInner = valueInvalidTypeMessage({
            expected: 'Buffer or Uint8Array',
            received: getTypeName(payload),
          });
          const expected = containerInvalidValueMessage(
            'Sign1',
            [2],
            expectedInner
          );
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject Tag(18) with wrong inner length (too few)', (): void => {
        const badTag = createTag18([
          Uint8Array.from([]),
          new Map<number, unknown>(),
          Uint8Array.from([]),
        ] as unknown as never);
        try {
          schema.parse(badTag as unknown as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = 'Sign1: Array must contain at least 4 element(s)';
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject Tag(18) with wrong inner length (too many)', (): void => {
        const badTag = createTag18([
          Uint8Array.from([]),
          new Map<number, unknown>(),
          Uint8Array.from([]),
          Uint8Array.from([]),
          'extra',
        ] as unknown as never);
        try {
          schema.parse(badTag as unknown as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = 'Sign1: Array must contain at most 4 element(s)';
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('object with getContentForEncoding() method', (): void => {
    describe('successful validation', (): void => {
      it('should accept object with getContentForEncoding() that returns a valid tuple', (): void => {
        const protectedHeaders = Uint8Array.from([1, 2, 3]);
        const unprotectedHeaders = new Map<number, unknown>([[1, 'test']]);
        const payload = Uint8Array.from([4, 5, 6]);
        const signature = Uint8Array.from([7, 8, 9]);

        // Mock @auth0/cose Sign1 instance
        const mockSign1 = {
          getContentForEncoding: (): unknown[] => {
            return [protectedHeaders, unprotectedHeaders, payload, signature];
          },
        };

        const result = schema.parse(mockSign1);

        expect(result).toBeInstanceOf(Tag);
        const resultTag = result as Tag;
        expect(resultTag.tag).toBe(18);
        expect(resultTag.value).toEqual([
          protectedHeaders,
          unprotectedHeaders,
          payload,
          signature,
        ]);
      });

      it('should accept object with getContentForEncoding() that returns null payload', (): void => {
        const protectedHeaders = Uint8Array.from([1, 2, 3]);
        const unprotectedHeaders = new Map<number, unknown>([[1, 'test']]);
        const payload = null;
        const signature = Uint8Array.from([7, 8, 9]);

        const mockSign1 = {
          getContentForEncoding: (): unknown[] => {
            return [protectedHeaders, unprotectedHeaders, payload, signature];
          },
        };

        const result = schema.parse(mockSign1);

        expect(result).toBeInstanceOf(Tag);
        const resultTag = result as Tag;
        expect(resultTag.tag).toBe(18);
        expect(resultTag.value).toEqual([
          protectedHeaders,
          unprotectedHeaders,
          payload,
          signature,
        ]);
      });
    });

    describe('validation errors', (): void => {
      it('should reject object with getContentForEncoding() that returns invalid tuple (too few elements)', (): void => {
        const mockSign1 = {
          getContentForEncoding: (): unknown[] => {
            return [
              Uint8Array.from([]),
              new Map<number, unknown>(),
              Uint8Array.from([]),
            ];
          },
        };

        try {
          schema.parse(mockSign1);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = 'Sign1: Array must contain at least 4 element(s)';
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject object with getContentForEncoding() that returns invalid tuple (too many elements)', (): void => {
        const mockSign1 = {
          getContentForEncoding: (): unknown[] => {
            return [
              Uint8Array.from([]),
              new Map<number, unknown>(),
              Uint8Array.from([]),
              Uint8Array.from([]),
              'extra',
            ];
          },
        };

        try {
          schema.parse(mockSign1);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = 'Sign1: Array must contain at most 4 element(s)';
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject object with getContentForEncoding() that returns invalid tuple (undefined payload)', (): void => {
        const mockSign1 = {
          getContentForEncoding: (): unknown[] => {
            return [
              Uint8Array.from([]),
              new Map<number, unknown>(),
              undefined,
              Uint8Array.from([]),
            ];
          },
        };

        try {
          schema.parse(mockSign1 as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expectedInner = valueInvalidTypeMessage({
            expected: 'Buffer or Uint8Array',
            received: 'undefined',
          });
          const expected = containerInvalidValueMessage(
            'Sign1',
            [2],
            expectedInner
          );
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject object with getContentForEncoding() that returns non-array', (): void => {
        const mockSign1 = {
          getContentForEncoding: (): unknown => {
            return 'not an array' as unknown;
          },
        };

        try {
          schema.parse(mockSign1);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = containerInvalidTypeMessage({
            target: 'Sign1',
            expected: 'Array',
            received: getTypeName(mockSign1.getContentForEncoding()),
          });
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
