import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { digestIDSchema } from '../DigestID';
import {
  uintInvalidTypeMessage,
  uintRequiredMessage,
  uintIntegerMessage,
  uintPositiveMessage,
} from '../../common/Uint';

// Expected messages built from common uint message suffixes
const DIGEST_ID_NUMBER_INVALID_TYPE_MESSAGE = uintInvalidTypeMessage('DigestID');
const DIGEST_ID_NUMBER_REQUIRED_MESSAGE = uintRequiredMessage('DigestID');
const DIGEST_ID_INTEGER_MESSAGE = uintIntegerMessage('DigestID');
const DIGEST_ID_POSITIVE_MESSAGE = uintPositiveMessage('DigestID');

describe('DigestID', () => {
  describe('valid inputs', () => {
    it('should accept positive integer number', () => {
      const input = 42;
      const result = digestIDSchema.parse(input);
      expect(typeof result).toBe('number');
      expect(result).toBe(42);
    });
  });

  describe('should throw error for invalid type inputs', () => {
    it('should throw for boolean', () => {
      try {
        digestIDSchema.parse(true);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          DIGEST_ID_NUMBER_INVALID_TYPE_MESSAGE
        );
      }
    });

    it('should throw for null', () => {
      try {
        digestIDSchema.parse(null);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          DIGEST_ID_NUMBER_INVALID_TYPE_MESSAGE
        );
      }
    });

    it('should throw for object', () => {
      try {
        digestIDSchema.parse({ a: 1 });
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          DIGEST_ID_NUMBER_INVALID_TYPE_MESSAGE
        );
      }
    });

    it('should throw for array', () => {
      try {
        digestIDSchema.parse([1, 2] as unknown);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          DIGEST_ID_NUMBER_INVALID_TYPE_MESSAGE
        );
      }
    });

    it('should throw for undefined (required)', () => {
      try {
        digestIDSchema.parse(undefined);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(
          DIGEST_ID_NUMBER_REQUIRED_MESSAGE
        );
      }
    });
  });

  describe('number branch validations', () => {
    it('should throw for zero (not positive)', () => {
      try {
        digestIDSchema.parse(0);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(DIGEST_ID_POSITIVE_MESSAGE);
      }
    });

    it('should throw for negative number', () => {
      try {
        digestIDSchema.parse(-5);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(DIGEST_ID_POSITIVE_MESSAGE);
      }
    });

    it('should throw for non-integer number', () => {
      try {
        digestIDSchema.parse(1.5);
        throw new Error('Should have thrown');
      } catch (error) {
        const zodError = error as z.ZodError;
        expect(zodError.issues[0].message).toBe(DIGEST_ID_INTEGER_MESSAGE);
      }
    });
  });
});
