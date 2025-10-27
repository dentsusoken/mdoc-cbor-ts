import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { hairColorSchema } from '../hairColorSchema';

describe('hairColorSchema', () => {
  describe('valid cases', () => {
    it('should accept all allowed values', () => {
      const allowed = [
        'bald',
        'black',
        'blond',
        'brown',
        'grey',
        'red',
        'auburn',
        'sandy',
        'white',
        'unknown',
      ] as const;

      for (const value of allowed) {
        const result = hairColorSchema.safeParse(value);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(value);
        }
      }
    });
  });

  describe('invalid cases', () => {
    it('should reject an unknown value with exact message', () => {
      const input = 'purple';
      try {
        hairColorSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].message).toBe(
          "Invalid enum value. Expected 'bald' | 'black' | 'blond' | 'brown' | 'grey' | 'red' | 'auburn' | 'sandy' | 'white' | 'unknown', received 'purple'"
        );
      }
    });

    it('should reject non-string with exact message', () => {
      const input = 123 as unknown as string;
      try {
        hairColorSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].message).toBe(
          "Expected 'bald' | 'black' | 'blond' | 'brown' | 'grey' | 'red' | 'auburn' | 'sandy' | 'white' | 'unknown', received number"
        );
      }
    });
  });
});
