import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { overAgeSchema } from '../overAgeSchema';

describe('overAgeSchema', () => {
  describe('valid cases', () => {
    it('should accept empty object (all properties optional)', () => {
      const result = overAgeSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.data).length).toBe(0);
      }
    });

    it('should accept a subset of age_over flags with booleans', () => {
      const input = { age_over_18: true, age_over_21: false };
      const result = overAgeSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(input);
      }
    });
  });

  describe('invalid cases', () => {
    it('should reject non-boolean for a single flag with exact message and path', () => {
      const input = { age_over_18: 'true' as unknown as boolean };
      try {
        overAgeSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        const issue = zerr.issues[0];
        expect(issue.path).toEqual(['age_over_18']);
        expect(issue.message).toBe('Expected boolean, received string');
      }
    });

    it('should report multiple non-boolean fields with correct paths and messages', () => {
      const input = {
        age_over_00: 1 as unknown as boolean,
        age_over_99: 'no' as unknown as boolean,
      };
      try {
        overAgeSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        const actual = zerr.issues
          .map((i) => ({ path: i.path, message: i.message }))
          .sort((a, b) => a.path.join('.').localeCompare(b.path.join('.')));
        const expected = [
          { path: ['age_over_00'], message: 'Expected boolean, received number' },
          { path: ['age_over_99'], message: 'Expected boolean, received string' },
        ];
        expect(actual).toEqual(expected);
      }
    });
  });
});


