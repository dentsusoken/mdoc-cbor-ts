import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createMac0Schema, mac0InvalidTypeMessage, Mac0Tuple } from '../Mac0';
import { requiredMessage } from '@/schemas/common/Required';
import {
  fixedTupleLengthTooFewMessage,
  fixedTupleLengthTooManyMessage,
} from '@/schemas/common/FixedTupleLength';
import { Tag } from 'cbor-x';
import { createTag17, type Tag17Content } from '@/cbor/createTag17';

describe('Mac0', () => {
  const schema = createMac0Schema('DeviceMac');

  describe('tuple input', () => {
    it('should parse a valid 4-element tuple to Tag(17, [...])', () => {
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

    it('should reject undefined payload (nullable only)', () => {
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
        expect(zodError.issues[0].message).toBe(
          mac0InvalidTypeMessage('DeviceMac')
        );
      }
    });

    it('should handle null payload', () => {
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

  describe('should throw error for invalid type inputs', () => {
    const testCases = [
      {
        name: 'null input',
        input: null,
        expected: requiredMessage('DeviceMac'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: requiredMessage('DeviceMac'),
      },
      {
        name: 'boolean input',
        input: true,
        expected: mac0InvalidTypeMessage('DeviceMac'),
      },
      {
        name: 'number input',
        input: 123,
        expected: mac0InvalidTypeMessage('DeviceMac'),
      },
      {
        name: 'string input',
        input: 'string',
        expected: mac0InvalidTypeMessage('DeviceMac'),
      },
      {
        name: 'plain object input',
        input: {},
        expected: mac0InvalidTypeMessage('DeviceMac'),
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
          fixedTupleLengthTooFewMessage('DeviceMac', 4)
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
          fixedTupleLengthTooManyMessage('DeviceMac', 4)
        );
      }
    });
  });

  describe('tag input (Tag(17, [...]))', () => {
    it('should accept Tag(17) wrapping a valid tuple', () => {
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

    it('should accept Tag(17) with null payload', () => {
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

    it('should reject Tag with non-17 tag value', () => {
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
        expect(zodError.issues[0].message).toBe('Invalid input');
      }
    });

    it('should reject Tag(17) with undefined payload', () => {
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
        expect(zodError.issues[0].message).toBe('Invalid input');
      }
    });

    it('should reject Tag(17) with wrong inner length (too few)', () => {
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
        expect(zodError.issues[0].message).toBe('Invalid input');
      }
    });

    it('should reject Tag(17) with wrong inner length (too many)', () => {
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
        expect(zodError.issues[0].message).toBe('Invalid input');
      }
    });
  });

  describe('object with getContentForEncoding() method', () => {
    it('should accept object with getContentForEncoding() that returns a valid tuple', () => {
      const protectedHeaders = Uint8Array.from([1, 2, 3]);
      const unprotectedHeaders = new Map<number, unknown>([[1, 'test']]);
      const payload = Uint8Array.from([4, 5, 6]);
      const tag = Uint8Array.from([7, 8, 9]);

      // Mock @auth0/cose Mac0 instance
      const mockMac0 = {
        getContentForEncoding(): Mac0Tuple {
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

    it('should accept object with getContentForEncoding() that returns null payload', () => {
      const protectedHeaders = Uint8Array.from([1, 2, 3]);
      const unprotectedHeaders = new Map<number, unknown>([[1, 'test']]);
      const payload = null;
      const tag = Uint8Array.from([7, 8, 9]);

      const mockMac0 = {
        getContentForEncoding(): Mac0Tuple {
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

    it('should reject object with getContentForEncoding() that returns invalid tuple (too few elements)', () => {
      const mockMac0 = {
        getContentForEncoding(): Array<unknown> {
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
        expect(zodError.issues[0].message).toBe(
          fixedTupleLengthTooFewMessage('DeviceMac', 4)
        );
      }
    });

    it('should reject object with getContentForEncoding() that returns invalid tuple (too many elements)', () => {
      const mockMac0 = {
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
        schema.parse(mockMac0);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          fixedTupleLengthTooManyMessage('DeviceMac', 4)
        );
      }
    });

    it('should reject object with getContentForEncoding() that returns invalid tuple (undefined payload)', () => {
      const mockMac0 = {
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
        schema.parse(mockMac0 as never);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          mac0InvalidTypeMessage('DeviceMac')
        );
      }
    });

    it('should reject object with getContentForEncoding() that returns non-array', () => {
      const mockMac0 = {
        getContentForEncoding(): unknown {
          return 'not an array';
        },
      };

      try {
        schema.parse(mockMac0);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          mac0InvalidTypeMessage('DeviceMac')
        );
      }
    });
  });
});
