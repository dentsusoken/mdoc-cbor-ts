import { describe, expect, it } from 'vitest';
import { dataElementsArraySchema } from './DataElementsArray';

describe('DataElementsArray', () => {
  it('should accept valid data elements array', () => {
    const validArrays = [
      ['given_name'],
      ['given_name', 'family_name'],
      ['org.iso.18013.5.1.name'],
      ['com.example.identifier'],
    ];

    validArrays.forEach((array) => {
      expect(() => dataElementsArraySchema.parse(array)).not.toThrow();
      const result = dataElementsArraySchema.parse(array);
      expect(result).toEqual(array);
    });
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      {},
      [],
      [123],
      [true],
      [{ key: 'value' }],
      [''],
    ];

    invalidInputs.forEach((input) => {
      expect(() => dataElementsArraySchema.parse(input)).toThrow();
    });
  });
});
