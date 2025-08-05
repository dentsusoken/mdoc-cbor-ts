import { describe, expect, it } from 'vitest';
import { errorCodeSchema } from '../ErrorCode';

describe('ErrorCode', () => {
  it('should accept valid error codes', () => {
    const validCodes = [0, 1, 2, 100, -1, -2, -100];

    validCodes.forEach((code) => {
      const result = errorCodeSchema.parse(code);
      expect(result).toBe(code);
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [null, undefined, true, 'string', [], {}, 1.5];

    invalidInputs.forEach((input) => {
      expect(() => errorCodeSchema.parse(input)).toThrow();
    });
  });
});
