import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { digestIDsSchema } from '../DigestIDs';
import { MAP_EMPTY_MESSAGE_SUFFIX } from '../../common/Map';
import { UINT_INVALID_TYPE_MESSAGE_SUFFIX } from '../../common/Uint';
import { BYTES_INVALID_TYPE_MESSAGE_SUFFIX } from '../../common/Bytes';

const DIGEST_ID_NUMBER_INVALID_TYPE_MESSAGE = `DigestID: ${UINT_INVALID_TYPE_MESSAGE_SUFFIX}`;
const DIGEST_IDS_EMPTY_MESSAGE = `DigestIDs: ${MAP_EMPTY_MESSAGE_SUFFIX}`;

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
        expect(zodError.issues[0].message).toBe(DIGEST_IDS_EMPTY_MESSAGE);
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
          DIGEST_ID_NUMBER_INVALID_TYPE_MESSAGE
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
          `Digest: ${BYTES_INVALID_TYPE_MESSAGE_SUFFIX}`
        );
      }
    });
  });
});
