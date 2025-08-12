import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { digestIDsSchema, DIGEST_IDS_NON_EMPTY_MESSAGE } from '../DigestIDs';
import { DIGEST_ID_UNION_MESSAGE } from '../DigestID';
import { typedMap } from '@/utils/typedMap';

describe('DigestIDs', () => {
  describe('valid inputs', () => {
    it('should accept a Map with valid DigestID keys and Digest values', () => {
      const input = typedMap({ 1: new Uint8Array([1, 2, 3]) });
      const result = digestIDsSchema.parse(input);
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(1);
      expect(result.has(1)).toBe(true);
    });
  });

  describe('error messages', () => {
    it('should throw for empty map with specific message', () => {
      try {
        const empty = typedMap<Record<string, never>>({});
        const mapInput = new Map(empty.entries());
        digestIDsSchema.parse(mapInput);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(DIGEST_IDS_NON_EMPTY_MESSAGE);
      }
    });

    it('should throw for invalid key with DigestID union message', () => {
      try {
        const input = typedMap({ invalid: new Uint8Array([1]) });
        const mapInput = new Map(input.entries());
        digestIDsSchema.parse(mapInput);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(DIGEST_ID_UNION_MESSAGE);
      }
    });

    it('should throw for invalid value with Bytes schema message', () => {
      try {
        const input = typedMap({ '1': 'not-bytes' });
        const mapInput = new Map(input.entries());
        digestIDsSchema.parse(mapInput);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          'Bytes: Please provide a Buffer or Uint8Array object. Strings and numbers are not valid.'
        );
      }
    });
  });
});
