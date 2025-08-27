import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { docTypesRecordSchema } from '../DocTypesRecord';
import {
  recordEmptyMessage,
  recordInvalidTypeMessage,
} from '../../common/Record';
import { requiredMessage } from '@/schemas/common/Required';
import { nonEmptyTextEmptyMessage } from '@/schemas/common/NonEmptyText';

describe('DocTypesRecord', () => {
  describe('valid cases', () => {
    it('should validate a valid doc types record with single document type', () => {
      const validDocTypesRecord = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': {
            given_name: 'John',
            family_name: 'Doe',
          },
        },
      };

      const result = docTypesRecordSchema.parse(validDocTypesRecord);
      expect(result).toEqual(validDocTypesRecord);
    });

    it('should validate a valid doc types record with multiple document types', () => {
      const validDocTypesRecord = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': {
            given_name: 'John',
            family_name: 'Doe',
          },
        },
        'org.example.other.document': {
          'org.example.other': {
            custom_field: 'custom_value',
          },
        },
      };

      const result = docTypesRecordSchema.parse(validDocTypesRecord);
      expect(result).toEqual(validDocTypesRecord);
    });

    it('should validate a valid doc types record with multiple name spaces', () => {
      const validDocTypesRecord = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': {
            given_name: 'John',
            family_name: 'Doe',
          },
          'org.iso.18013.5.1.aamva': {
            license_number: '123456789',
          },
        },
      };

      const result = docTypesRecordSchema.parse(validDocTypesRecord);
      expect(result).toEqual(validDocTypesRecord);
    });
  });

  describe('invalid cases', () => {
    const invalidCases = [
      {
        name: 'empty record',
        input: {},
        expectedError: recordEmptyMessage('DocTypesRecord'),
      },
      {
        name: 'non-object input',
        input: 'not an object',
        expectedError: recordInvalidTypeMessage('DocTypesRecord'),
      },
      {
        name: 'null input',
        input: null,
        expectedError: requiredMessage('DocTypesRecord'),
      },
      {
        name: 'undefined input',
        input: undefined,
        expectedError: requiredMessage('DocTypesRecord'),
      },
      {
        name: 'invalid doc type key',
        input: {
          '': {
            'org.iso.18013.5.1': {
              given_name: 'John',
            },
          },
        },
        expectedError: nonEmptyTextEmptyMessage('DocType'),
      },
      {
        name: 'invalid name spaces record value',
        input: {
          'org.iso.18013.5.1.mDL': {},
        },
        expectedError: recordEmptyMessage('NameSpacesRecord'),
      },
      {
        name: 'invalid data element identifier in nested structure',
        input: {
          'org.iso.18013.5.1.mDL': {
            'org.iso.18013.5.1': {
              '': 'John', // Empty key is invalid
            },
          },
        },
        expectedError: nonEmptyTextEmptyMessage('DataElementIdentifier'),
      },
    ];

    invalidCases.forEach(({ name, input, expectedError }) => {
      it(`should reject ${name}`, () => {
        try {
          docTypesRecordSchema.parse(input);
          throw new Error('Should have thrown');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expectedError);
        }
      });
    });

    it('should accept null data element value in nested structure', () => {
      const docTypesRecord = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': {
            given_name: null, // null is valid for DataElementValue
          },
        },
      };

      const result = docTypesRecordSchema.parse(docTypesRecord);
      expect(result).toEqual(docTypesRecord);
    });
  });

  describe('edge cases', () => {
    it('should handle doc type with special characters', () => {
      const docTypesRecord = {
        'org.example.test-with-dashes.and_dots': {
          'org.example.test': {
            field_name: 'field_value',
          },
        },
      };

      const result = docTypesRecordSchema.parse(docTypesRecord);
      expect(result).toEqual(docTypesRecord);
    });

    it('should handle data element values of different types', () => {
      const docTypesRecord = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': {
            string_value: 'text',
            number_value: 42,
            boolean_value: true,
            array_value: [1, 2, 3],
            object_value: { nested: 'value' },
          },
        },
      };

      const result = docTypesRecordSchema.parse(docTypesRecord);
      expect(result).toEqual(docTypesRecord);
    });
  });
});
