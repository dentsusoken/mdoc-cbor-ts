import { describe, expect, it } from 'vitest';
import { validateSchemaType } from '../validateSchemaType';

describe('validateSchemaType', () => {
  describe('success cases', () => {
    it('validates string, number, boolean, and integer correctly', () => {
      expect(validateSchemaType('string', 'foo')).toBe(true);
      expect(validateSchemaType('number', 4.2)).toBe(true);
      expect(validateSchemaType('boolean', false)).toBe(true);
      expect(validateSchemaType('integer', 42)).toBe(true);
      expect(validateSchemaType('integer', -7)).toBe(true);
    });

    it('returns false when value does not match the schema type', () => {
      expect(validateSchemaType('string', 123)).toBe(false);
      expect(validateSchemaType('number', '123')).toBe(false);
      expect(validateSchemaType('boolean', 0)).toBe(false);
      expect(validateSchemaType('integer', 4.2)).toBe(false);
      expect(validateSchemaType('integer', '7')).toBe(false);
      expect(validateSchemaType('integer', null)).toBe(false);
    });
  });

  describe('error cases', () => {
    it('throws on invalid schema type name', () => {
      expect(() => validateSchemaType('unknown', 'x')).toThrow(
        'Invalid schema type: unknown'
      );
    });
  });
});
