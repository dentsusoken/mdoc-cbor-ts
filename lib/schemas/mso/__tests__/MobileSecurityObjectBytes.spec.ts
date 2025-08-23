import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { mobileSecurityObjectBytesSchema } from '../MobileSecurityObjectBytes';
import { Tag } from 'cbor-x';
import { createTag24 } from '@/cbor/createTag24';
import { tag24InvalidTypeMessage } from '@/schemas/common/Tag24';
import { requiredMessage } from '@/schemas/common/Required';

describe('MobileSecurityObjectBytes', () => {
  describe('success', () => {
    it('should accept valid tag', () => {
      const tag = createTag24(new Map([['version', '1.0']]));

      const result = mobileSecurityObjectBytesSchema.parse(tag);
      expect(result).toEqual(tag);
    });
  });

  describe('rejects', () => {
    const target = 'MobileSecurityObjectBytes';

    [
      { name: 'boolean', input: true },
      { name: 'number', input: 123 },
      { name: 'string', input: 'string' },
      { name: 'plain object', input: { key: 'value' } },
      { name: 'array', input: [1, 2, 3] },
    ].forEach(({ name, input }) => {
      it(`should throw invalid type error for ${name}`, () => {
        try {
          mobileSecurityObjectBytesSchema.parse(input as unknown as Tag);
          throw new Error('Expected error');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          if (error instanceof z.ZodError) {
            expect(error.errors[0].message).toBe(
              tag24InvalidTypeMessage(target)
            );
          }
        }
      });
    });

    [
      { name: 'null', input: null },
      { name: 'undefined', input: undefined },
    ].forEach(({ name, input }) => {
      it(`should throw required error for ${name}`, () => {
        try {
          mobileSecurityObjectBytesSchema.parse(input as unknown as Tag);
          throw new Error('Expected error');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          if (error instanceof z.ZodError) {
            expect(error.errors[0].message).toBe(requiredMessage(target));
          }
        }
      });
    });

    it('should throw error when tag number is not 24', () => {
      const invalidTag = new Tag(new Uint8Array([1, 2, 3]), 25);

      try {
        mobileSecurityObjectBytesSchema.parse(invalidTag);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            tag24InvalidTypeMessage('MobileSecurityObjectBytes')
          );
        }
      }
    });

    it('should throw error when tag value is not a Uint8Array', () => {
      const invalidTag = new Tag(
        'not-a-uint8array' as unknown as Uint8Array,
        24
      );

      try {
        mobileSecurityObjectBytesSchema.parse(invalidTag);
        throw new Error('Expected error');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe(
            tag24InvalidTypeMessage('MobileSecurityObjectBytes')
          );
        }
      }
    });
  });
});
