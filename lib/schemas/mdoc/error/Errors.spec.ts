import { describe, expect, it } from 'vitest';
import { errorsSchema } from './Errors';

describe('Errors', () => {
  it('should accept valid errors', () => {
    const validErrors = [
      {
        'org.iso.18013.5.1': {
          given_name: 0,
        },
      },
      {
        'com.example.namespace': {
          item1: 1,
          item2: -1,
        },
        'test.namespace': {
          item3: 2,
        },
      },
    ];

    validErrors.forEach((errors) => {
      expect(() => errorsSchema.parse(errors)).not.toThrow();
      const result = errorsSchema.parse(errors);
      expect(result).toEqual(errors);
    });
  });

  it('should throw error for empty record', () => {
    const emptyRecord = {};
    expect(() => errorsSchema.parse(emptyRecord)).toThrow();
  });

  it('should throw error for invalid input', () => {
    const invalidInputs = [
      null,
      undefined,
      true,
      123,
      'string',
      [],
      {
        'org.iso.18013.5.1': null,
      },
      {
        'org.iso.18013.5.1': {
          valid_identifier: null,
        },
      },
      {
        'org.iso.18013.5.1': {
          valid_identifier: 1.5,
        },
      },
    ];

    invalidInputs.forEach((input) => {
      expect(() => errorsSchema.parse(input)).toThrow();
    });
  });
});
