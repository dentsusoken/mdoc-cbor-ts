import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { countryCodeSchema } from '../countryCodeSchema';

describe('countryCodeSchema', () => {
  describe('valid cases', () => {
    it('should accept valid 2-letter uppercase country codes', () => {
      const allowed = ['US', 'GB', 'JP', 'DE'];
      for (const value of allowed) {
        const result = countryCodeSchema.safeParse(value);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(value);
        }
      }
    });
  });

  describe('invalid cases', () => {
    it('should reject lowercase letters with exact message', () => {
      const input = 'gb';
      try {
        countryCodeSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].message).toBe(
          'Must contain only uppercase letters'
        );
      }
    });

    it('should reject codes longer than 2 letters with exact message', () => {
      const input = 'USA';
      try {
        countryCodeSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].message).toBe('Must be a 2-letter country code');
      }
    });

    it('should reject codes shorter than 2 letters with exact message', () => {
      const input = 'U';
      try {
        countryCodeSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].message).toBe('Must be a 2-letter country code');
      }
    });

    it('should reject non-alphabetic characters with exact message', () => {
      const input = 'U1';
      try {
        countryCodeSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].message).toBe(
          'Must contain only uppercase letters'
        );
      }
    });

    it('should reject non-string with exact message', () => {
      const input = 123 as unknown as string;
      try {
        countryCodeSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].message).toBe('Expected string, received number');
      }
    });
  });
});
