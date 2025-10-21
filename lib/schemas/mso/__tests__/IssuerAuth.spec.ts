import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { issuerAuthSchema } from '../IssuerAuth';
import { containerInvalidTypeMessage } from '@/schemas/messages/containerInvalidTypeMessage';
import { Tag } from 'cbor-x';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { containerInvalidValueMessage } from '@/schemas/messages/containerInvalidValueMessage';
import { valueInvalidTypeMessage } from '@/schemas/messages/valueInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

describe('IssuerAuth', (): void => {
  const schema = issuerAuthSchema;

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
            expected: 'Uint8Array or Buffer',
            received: getTypeName(payload),
          });
          const expected = containerInvalidValueMessage({
            target: 'IssuerAuth',
            path: [2],
            originalMessage: expectedInner,
          });
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
          const expected =
            'IssuerAuth: Array must contain at least 4 element(s)';
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
          const expected =
            'IssuerAuth: Array must contain at most 4 element(s)';
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('should throw error for invalid type inputs', (): void => {
    const expectedMessage = (v: unknown): string =>
      containerInvalidTypeMessage({
        target: 'IssuerAuth',
        expected:
          '[Uint8Array, HeaderMap, Uint8Array | null, Uint8Array] or Tag(18)',
        received: getTypeName(v),
      });

    const testCases: Array<{
      name: string;
      input: unknown;
      expected: (v: unknown) => string;
    }> = [
      { name: 'null input', input: null, expected: expectedMessage },
      { name: 'undefined input', input: undefined, expected: expectedMessage },
      { name: 'boolean input', input: true, expected: expectedMessage },
      { name: 'number input', input: 123, expected: expectedMessage },
      { name: 'string input', input: 'string', expected: expectedMessage },
      { name: 'plain object input', input: {}, expected: expectedMessage },
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

  describe('tag input (Tag([...], 18))', (): void => {
    describe('successful validation', (): void => {
      it('should accept Tag([...], 18) wrapping a valid tuple', (): void => {
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
            target: 'IssuerAuth',
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
            expected: 'Uint8Array or Buffer',
            received: getTypeName(payload),
          });
          const expected = containerInvalidValueMessage({
            target: 'IssuerAuth',
            path: [2],
            originalMessage: expectedInner,
          });
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
          const expected =
            'IssuerAuth: Array must contain at least 4 element(s)';
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
          const expected =
            'IssuerAuth: Array must contain at most 4 element(s)';
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
