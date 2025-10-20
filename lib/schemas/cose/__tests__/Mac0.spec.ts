import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { mac0Schema } from '../Mac0';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { Tag } from 'cbor-x';
import { createTag17, type Tag17Content } from '@/cbor/createTag17';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { valueInvalidTypeMessage } from '@/schemas/messages/valueInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('Mac0', (): void => {
  const schema = mac0Schema;

  describe('tuple input', (): void => {
    describe('successful validation', (): void => {
      it('should parse a valid 4-element tuple to Tag(17, [...])', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = Uint8Array.from([]);
        const tag = Uint8Array.from([]);

        const input = [
          protectedHeaders,
          unprotectedHeaders,
          payload,
          tag,
        ] as const;
        const result = schema.parse(input);

        expect(result).toBeInstanceOf(Tag);
        const resultTag = result as Tag;
        expect(resultTag.tag).toBe(17);
        expect(resultTag.value).toEqual(input);
      });

      it('should handle null payload', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = null;
        const tag = Uint8Array.from([]);

        const input = [
          protectedHeaders,
          unprotectedHeaders,
          payload,
          tag,
        ] as const;
        const result = schema.parse(input);

        expect(result).toBeInstanceOf(Tag);
        const resultTag = result as Tag;
        expect(resultTag.tag).toBe(17);
        expect(resultTag.value).toEqual(input);
      });
    });

    describe('validation errors', (): void => {
      it('should reject undefined payload', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = undefined;
        const tag = Uint8Array.from([]);

        const input = [
          protectedHeaders,
          unprotectedHeaders,
          payload,
          tag,
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
            'Mac0',
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
          const expected = 'Mac0: Array must contain at least 4 element(s)';
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
          const expected = 'Mac0: Array must contain at most 4 element(s)';
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('should throw error for invalid type inputs', (): void => {
    const expectedMessage = (v: unknown): string =>
      containerInvalidTypeMessage({
        target: 'Mac0',
        expected:
          'Array[Uint8Array, HeaderMap, Uint8Array, Uint8Array] or Tag(17)',
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

  describe('tag input (Tag(17, [...]))', (): void => {
    describe('successful validation', (): void => {
      it('should accept Tag(17) wrapping a valid tuple', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = Uint8Array.from([]);
        const tag = Uint8Array.from([]);

        const tuple: Tag17Content = [
          protectedHeaders,
          unprotectedHeaders,
          payload,
          tag,
        ];
        const tagInput = createTag17(tuple);
        const result = schema.parse(tagInput);

        expect(result).toBeInstanceOf(Tag);
        const resultTag = result as Tag;
        expect(resultTag.tag).toBe(17);
        expect(resultTag.value).toEqual(tuple);
      });

      it('should accept Tag(17) with null payload', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = null;
        const tag = Uint8Array.from([]);

        const tuple: Tag17Content = [
          protectedHeaders,
          unprotectedHeaders,
          payload,
          tag,
        ];
        const tagInput = createTag17(tuple);
        const result = schema.parse(tagInput);

        expect(result).toBeInstanceOf(Tag);
        const resultTag = result as Tag;
        expect(resultTag.tag).toBe(17);
        expect(resultTag.value).toEqual(tuple);
      });
    });

    describe('validation errors', (): void => {
      it('should reject Tag with non-17 tag value', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = Uint8Array.from([]);
        const tag = Uint8Array.from([]);

        const badTag = new Tag(
          [protectedHeaders, unprotectedHeaders, payload, tag],
          0
        );
        try {
          schema.parse(badTag as unknown as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = containerInvalidTypeMessage({
            target: 'Mac0',
            expected: 'Tag(17)',
            received: 'Tag(0)',
          });
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject Tag(17) with undefined payload', (): void => {
        const protectedHeaders = Uint8Array.from([]);
        const unprotectedHeaders = new Map<number, unknown>();
        const payload = undefined;
        const tag = Uint8Array.from([]);

        const badTag = createTag17([
          protectedHeaders,
          unprotectedHeaders,
          payload as unknown as never,
          tag,
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
            'Mac0',
            [2],
            expectedInner
          );
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject Tag(17) with wrong inner length (too few)', (): void => {
        const badTag = createTag17([
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
          const expected = 'Mac0: Array must contain at least 4 element(s)';
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject Tag(17) with wrong inner length (too many)', (): void => {
        const badTag = createTag17([
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
          const expected = 'Mac0: Array must contain at most 4 element(s)';
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
        const tag = Uint8Array.from([7, 8, 9]);

        // Mock @auth0/cose Mac0 instance
        const mockMac0 = {
          getContentForEncoding: (): unknown[] => {
            return [protectedHeaders, unprotectedHeaders, payload, tag];
          },
        };

        const result = schema.parse(mockMac0);

        expect(result).toBeInstanceOf(Tag);
        const resultTag = result as Tag;
        expect(resultTag.tag).toBe(17);
        expect(resultTag.value).toEqual([
          protectedHeaders,
          unprotectedHeaders,
          payload,
          tag,
        ]);
      });

      it('should accept object with getContentForEncoding() that returns null payload', (): void => {
        const protectedHeaders = Uint8Array.from([1, 2, 3]);
        const unprotectedHeaders = new Map<number, unknown>([[1, 'test']]);
        const payload = null;
        const tag = Uint8Array.from([7, 8, 9]);

        const mockMac0 = {
          getContentForEncoding: (): unknown[] => {
            return [protectedHeaders, unprotectedHeaders, payload, tag];
          },
        };

        const result = schema.parse(mockMac0);

        expect(result).toBeInstanceOf(Tag);
        const resultTag = result as Tag;
        expect(resultTag.tag).toBe(17);
        expect(resultTag.value).toEqual([
          protectedHeaders,
          unprotectedHeaders,
          payload,
          tag,
        ]);
      });
    });

    describe('validation errors', (): void => {
      it('should reject object with getContentForEncoding() that returns invalid tuple (too few elements)', (): void => {
        const mockMac0 = {
          getContentForEncoding: (): unknown[] => {
            return [
              Uint8Array.from([]),
              new Map<number, unknown>(),
              Uint8Array.from([]),
            ];
          },
        };

        try {
          schema.parse(mockMac0);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = 'Mac0: Array must contain at least 4 element(s)';
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject object with getContentForEncoding() that returns invalid tuple (too many elements)', (): void => {
        const mockMac0 = {
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
          schema.parse(mockMac0);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = 'Mac0: Array must contain at most 4 element(s)';
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject object with getContentForEncoding() that returns invalid tuple (undefined payload)', (): void => {
        const mockMac0 = {
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
          schema.parse(mockMac0 as never);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expectedInner = valueInvalidTypeMessage({
            expected: 'Buffer or Uint8Array',
            received: 'undefined',
          });
          const expected = containerInvalidValueMessage(
            'Mac0',
            [2],
            expectedInner
          );
          expect(zodError.issues[0].message).toBe(expected);
        }
      });

      it('should reject object with getContentForEncoding() that returns non-array', (): void => {
        const mockMac0 = {
          getContentForEncoding: (): unknown => {
            return 'not an array' as unknown;
          },
        };

        try {
          schema.parse(mockMac0);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          const expected = containerInvalidTypeMessage({
            target: 'Mac0',
            expected: 'Array',
            received: getTypeName(mockMac0.getContentForEncoding()),
          });
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
