import { describe, it, expect } from 'vitest';
import { extractAgeOverNn } from '../extractAgeOverNn';

describe('extractAgeOverNn', () => {
  describe('should extract valid age_over_NN values', () => {
    it('extracts nn from age_over_00', () => {
      const result = extractAgeOverNn('age_over_00');
      expect(result).toBe(0);
    });

    it('extracts nn from age_over_18', () => {
      const result = extractAgeOverNn('age_over_18');
      expect(result).toBe(18);
    });

    it('extracts nn from age_over_21', () => {
      const result = extractAgeOverNn('age_over_21');
      expect(result).toBe(21);
    });

    it('extracts nn from age_over_99', () => {
      const result = extractAgeOverNn('age_over_99');
      expect(result).toBe(99);
    });
  });

  describe('should throw error for invalid format', () => {
    it('throws error for age_over_abc (non-numeric suffix)', () => {
      expect(() => {
        extractAgeOverNn('age_over_abc');
      }).toThrow(
        'Invalid age_over format: age_over_abc. Expected format: age_over_NN where NN is a two-digit number'
      );
    });

    it('throws error for age_over_ (missing number)', () => {
      expect(() => {
        extractAgeOverNn('age_over_');
      }).toThrow(
        'Invalid age_over format: age_over_. Expected format: age_over_NN where NN is a two-digit number'
      );
    });

    it('throws error for age_over_18_extra (extra characters)', () => {
      expect(() => {
        extractAgeOverNn('age_over_18_extra');
      }).toThrow(
        'Invalid age_over format: age_over_18_extra. Expected format: age_over_NN where NN is a two-digit number'
      );
    });

    it('throws error for age_over_5 (single digit)', () => {
      expect(() => {
        extractAgeOverNn('age_over_5');
      }).toThrow(
        'Invalid age_over format: age_over_5. Expected format: age_over_NN where NN is a two-digit number'
      );
    });

    it('throws error for age_over_100 (three digits)', () => {
      expect(() => {
        extractAgeOverNn('age_over_100');
      }).toThrow(
        'Invalid age_over format: age_over_100. Expected format: age_over_NN where NN is a two-digit number'
      );
    });

    it('throws error for non-age_over prefix', () => {
      expect(() => {
        extractAgeOverNn('given_name');
      }).toThrow(
        'Invalid age_over format: given_name. Expected format: age_over_NN where NN is a two-digit number'
      );
    });
  });
});
