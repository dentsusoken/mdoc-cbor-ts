import { describe, expect, it } from 'vitest';
import { statusSchema } from './Status';

describe('Status', () => {
  it('should accept valid status codes', () => {
    const validStatusCodes = [0, 10, 11, 12];

    validStatusCodes.forEach((code) => {
      expect(() => statusSchema.parse(code)).not.toThrow();
      expect(statusSchema.parse(code)).toBe(code);
    });
  });

  it('should throw error for invalid status codes', () => {
    const invalidStatusCodes = [
      -1,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      13,
      100,
      '0',
      '10',
      '11',
      '12',
      true,
      null,
      undefined,
    ];

    invalidStatusCodes.forEach((code) => {
      expect(() => statusSchema.parse(code)).toThrow();
    });
  });
});
