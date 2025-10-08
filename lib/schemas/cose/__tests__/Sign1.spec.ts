import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createSign1Schema, sign1InvalidTypeMessage } from '../Sign1';
import { requiredMessage } from '@/schemas/common/Required';
import {
  fixedTupleLengthTooFewMessage,
  fixedTupleLengthTooManyMessage,
} from '@/schemas/common/FixedTupleLength';
import { Tag } from 'cbor-x';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { Sign1Tuple } from '../Sign1';

describe('Sign1', () => {
  const schema = createSign1Schema('DeviceSignature');

  describe('tuple input', () => {
    it('should parse a valid 4-element tuple to Tag(18, [...])', () => {
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
      const tag = result as Tag;
      expect(tag.tag).toBe(18);
      expect(tag.value).toEqual(input);
    });

    it('should reject undefined payload (nullable only)', () => {
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
        expect(zodError.issues[0].message).toBe(
          sign1InvalidTypeMessage('DeviceSignature')
        );
      }
    });

    it('should handle null payload', () => {
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
      const tag = result as Tag;
      expect(tag.tag).toBe(18);
      expect(tag.value).toEqual(input);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expected: requiredMessage('DeviceSignature'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: requiredMessage('DeviceSignature'),
      },
      {
        name: 'boolean input',
        input: true,
        expected: sign1InvalidTypeMessage('DeviceSignature'),
      },
      {
        name: 'number input',
        input: 123,
        expected: sign1InvalidTypeMessage('DeviceSignature'),
      },
      {
        name: 'string input',
        input: 'string',
        expected: sign1InvalidTypeMessage('DeviceSignature'),
      },
      {
        name: 'plain object input',
        input: {},
        expected: sign1InvalidTypeMessage('DeviceSignature'),
      },
    ];

    testCases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          schema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });

  describe('should enforce array length = 4 (tuple input)', () => {
    it('should reject arrays with too few elements', () => {
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
        expect(zodError.issues[0].message).toBe(
          fixedTupleLengthTooFewMessage('DeviceSignature', 4)
        );
      }
    });

    it('should reject arrays with too many elements', () => {
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
        expect(zodError.issues[0].message).toBe(
          fixedTupleLengthTooManyMessage('DeviceSignature', 4)
        );
      }
    });
  });

  describe('tag input (Tag(18, [...]))', () => {
    it('should accept Tag(18) wrapping a valid tuple', () => {
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
      const tag = result as Tag;
      expect(tag.tag).toBe(18);
      expect(tag.value).toEqual(tuple);
    });

    it('should accept Tag(18) with null payload', () => {
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
      const tag = result as Tag;
      expect(tag.tag).toBe(18);
      expect(tag.value).toEqual(tuple);
    });

    it('should reject Tag with non-18 tag value', () => {
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
        expect(zodError.issues[0].message).toBe('Invalid input');
      }
    });

    it('should reject Tag(18) with undefined payload', () => {
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
        expect(zodError.issues[0].message).toBe('Invalid input');
      }
    });

    it('should reject Tag(18) with wrong inner length (too few)', () => {
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
        expect(zodError.issues[0].message).toBe('Invalid input');
      }
    });

    it('should reject Tag(18) with wrong inner length (too many)', () => {
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
        expect(zodError.issues[0].message).toBe('Invalid input');
      }
    });
  });

  describe('object with getContentForEncoding() method', () => {
    it('should accept object with getContentForEncoding() that returns a valid tuple', () => {
      const protectedHeaders = Uint8Array.from([1, 2, 3]);
      const unprotectedHeaders = new Map<number, unknown>([[1, 'test']]);
      const payload = Uint8Array.from([4, 5, 6]);
      const signature = Uint8Array.from([7, 8, 9]);

      // Mock @auth0/cose Sign1 instance
      const mockSign1 = {
        getContentForEncoding(): Sign1Tuple {
          return [protectedHeaders, unprotectedHeaders, payload, signature];
        },
      };

      const result = schema.parse(mockSign1);

      expect(result).toBeInstanceOf(Tag);
      const tag = result as Tag;
      expect(tag.tag).toBe(18);
      expect(tag.value).toEqual([
        protectedHeaders,
        unprotectedHeaders,
        payload,
        signature,
      ]);
    });

    it('should accept object with getContentForEncoding() that returns null payload', () => {
      const protectedHeaders = Uint8Array.from([1, 2, 3]);
      const unprotectedHeaders = new Map<number, unknown>([[1, 'test']]);
      const payload = null;
      const signature = Uint8Array.from([7, 8, 9]);

      const mockSign1 = {
        getContentForEncoding(): Sign1Tuple {
          return [protectedHeaders, unprotectedHeaders, payload, signature];
        },
      };

      const result = schema.parse(mockSign1);

      expect(result).toBeInstanceOf(Tag);
      const tag = result as Tag;
      expect(tag.tag).toBe(18);
      expect(tag.value).toEqual([
        protectedHeaders,
        unprotectedHeaders,
        payload,
        signature,
      ]);
    });

    it('should reject object with getContentForEncoding() that returns invalid tuple (too few elements)', () => {
      const mockSign1 = {
        getContentForEncoding(): Array<unknown> {
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
        expect(zodError.issues[0].message).toBe(
          fixedTupleLengthTooFewMessage('DeviceSignature', 4)
        );
      }
    });

    it('should reject object with getContentForEncoding() that returns invalid tuple (too many elements)', () => {
      const mockSign1 = {
        getContentForEncoding(): Array<unknown> {
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
        expect(zodError.issues[0].message).toBe(
          fixedTupleLengthTooManyMessage('DeviceSignature', 4)
        );
      }
    });

    it('should reject object with getContentForEncoding() that returns invalid tuple (undefined payload)', () => {
      const mockSign1 = {
        getContentForEncoding(): Array<unknown> {
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
        expect(zodError.issues[0].message).toBe(
          sign1InvalidTypeMessage('DeviceSignature')
        );
      }
    });

    it('should reject object with getContentForEncoding() that returns non-array', () => {
      const mockSign1 = {
        getContentForEncoding(): unknown {
          return 'not an array';
        },
      };

      try {
        schema.parse(mockSign1);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          sign1InvalidTypeMessage('DeviceSignature')
        );
      }
    });
  });
});
