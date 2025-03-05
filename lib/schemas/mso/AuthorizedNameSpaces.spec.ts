import { describe, expect, it } from 'vitest';
import { authorizedNameSpacesSchema } from './AuthorizedNameSpaces';

describe('AuthorizedNameSpaces', () => {
  it('should accept valid authorized namespaces array', () => {
    const validArrays = [
      ['org.iso.18013.5.1'],
      ['org.iso.18013.5.1', 'com.example.namespace'],
      ['test.namespace'],
      ['a.b.c'],
    ];

    validArrays.forEach((array) => {
      expect(() => authorizedNameSpacesSchema.parse(array)).not.toThrow();
      const result = authorizedNameSpacesSchema.parse(array);
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
      expect(() => authorizedNameSpacesSchema.parse(input)).toThrow();
    });
  });
});
