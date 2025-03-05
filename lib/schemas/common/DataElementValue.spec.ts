import { describe, expect, it } from 'vitest';
import { dataElementValueSchema } from './DataElementValue';

describe('DataElementValue', () => {
  it('should accept any value type', () => {
    const validValues = [
      'string',
      123,
      true,
      null,
      undefined,
      { key: 'value' },
      [1, 2, 3],
      new Date(),
    ];

    validValues.forEach((value) => {
      expect(() => dataElementValueSchema.parse(value)).not.toThrow();
      expect(dataElementValueSchema.parse(value)).toBe(value);
    });
  });
});
