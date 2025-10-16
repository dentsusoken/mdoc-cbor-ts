import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { digestIDsSchema } from '../DigestIDs';
import { mapEmptyMessage } from '@/schemas/common/container/Map';
import { uintInvalidTypeMessage } from '@/schemas/common/Uint';
import { bytesInvalidTypeMessage } from '@/schemas/common/Bytes';

describe('DigestIDs', () => {
  describe('valid inputs', () => {
    it('should accept a Map with valid DigestID keys and Digest values', () => {
      const input = new Map<number, Uint8Array>([
        [1, new Uint8Array([1, 2, 3])],
      ]);
      const result = digestIDsSchema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result).toEqual(input);
    });
  });

  describe('error messages', () => {
    it('should throw for empty map with specific message', () => {
      try {
        const empty = new Map();
        digestIDsSchema.parse(empty);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(mapEmptyMessage('DigestIDs'));
      }
    });

    it('should throw for invalid key with number invalid type message', () => {
      try {
        const input = new Map<unknown, Uint8Array>([
          ['invalid', new Uint8Array([1])],
        ]);
        digestIDsSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          uintInvalidTypeMessage('DigestID')
        );
      }
    });

    it('should throw for invalid value with Bytes schema message', () => {
      try {
        const input = new Map<number, unknown>([[1, 'not-bytes']]);
        digestIDsSchema.parse(input);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          bytesInvalidTypeMessage('Digest')
        );
      }
    });
  });
});
