import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { docTypeNameSpaceElementIdentitiesRecordSchema } from '../DocTypeNameSpaceElementIdentities';
import {
  recordEmptyMessage,
  recordInvalidTypeMessage,
} from '@/schemas/common/Record';
import { requiredMessage } from '@/schemas/common/Required';
import {
  nonEmptyTextEmptyMessage,
  nonEmptyTextInvalidTypeMessage,
} from '@/schemas/common/NonEmptyText';

describe('DocTypeNamespaceElementIdentitiesRecord', () => {
  describe('valid cases', () => {
    it('should parse a record with a single document type containing namespace element identities', () => {
      const input = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': ['given_name', 'family_name', 'age'],
        },
      } as const;

      const result = docTypeNameSpaceElementIdentitiesRecordSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('should parse a record with multiple document types', () => {
      const input = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': ['given_name', 'family_name'],
        },
        'org.example.other.document': {
          'org.example.other': ['custom_field'],
        },
      } as const;

      const result = docTypeNameSpaceElementIdentitiesRecordSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('should parse a record with multiple namespaces in a single document type', () => {
      const input = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': ['given_name', 'family_name'],
          'org.iso.18013.5.1.aamva': ['license_number'],
        },
      } as const;

      const result = docTypeNameSpaceElementIdentitiesRecordSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('should parse a record with document type containing special characters', () => {
      const input = {
        'org.example.test-with-dashes.and_dots': {
          'org.example.test': ['field_name', 'another_field'],
        },
      } as const;

      const result = docTypeNameSpaceElementIdentitiesRecordSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('should parse a record with various data element identifier types', () => {
      const input = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': [
            'string_identifier',
            'number_identifier',
            'boolean_identifier',
            'mixed_case_Identifier',
          ],
        },
      } as const;

      const result = docTypeNameSpaceElementIdentitiesRecordSchema.parse(input);
      expect(result).toEqual(input);
    });
  });

  describe('invalid cases', () => {
    const TARGET = 'DocTypeNamespaceElementIdentitiesRecord';

    const cases: Array<{ name: string; input: unknown; expected: string }> = [
      {
        name: 'empty record',
        input: {},
        expected: recordEmptyMessage(TARGET),
      },
      {
        name: 'null input',
        input: null,
        expected: requiredMessage(TARGET),
      },
      {
        name: 'undefined input',
        input: undefined,
        expected: requiredMessage(TARGET),
      },
      {
        name: 'string input',
        input: 'not-an-object',
        expected: recordInvalidTypeMessage(TARGET),
      },
      {
        name: 'array input',
        input: [],
        expected: recordInvalidTypeMessage(TARGET),
      },
      {
        name: 'number input',
        input: 123,
        expected: recordInvalidTypeMessage(TARGET),
      },
      {
        name: 'boolean input',
        input: true,
        expected: recordInvalidTypeMessage(TARGET),
      },
      {
        name: 'empty doc type key',
        input: {
          '': {
            'org.iso.18013.5.1': ['given_name'],
          },
        },
        expected: nonEmptyTextEmptyMessage('DocType'),
      },
      {
        name: 'empty namespace record value',
        input: {
          'org.iso.18013.5.1.mDL': {},
        },
        expected: recordEmptyMessage(
          'DocTypeNamespaceElementIdentitiesRecord.Value'
        ),
      },
      {
        name: 'empty namespace key',
        input: {
          'org.iso.18013.5.1.mDL': {
            '': ['given_name'],
          },
        },
        expected: nonEmptyTextEmptyMessage('NameSpace'),
      },
      {
        name: 'empty string in data elements array',
        input: {
          'org.iso.18013.5.1.mDL': {
            'org.iso.18013.5.1': ['given_name', '', 'family_name'],
          },
        },
        expected: nonEmptyTextEmptyMessage('DataElementIdentifier'),
      },
      {
        name: 'non-string values in data elements array',
        input: {
          'org.iso.18013.5.1.mDL': {
            'org.iso.18013.5.1': ['given_name', 123, 'family_name'],
          },
        },
        expected: nonEmptyTextInvalidTypeMessage('DataElementIdentifier'),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          docTypeNameSpaceElementIdentitiesRecordSchema.parse(input as never);
          expect.unreachable('Expected parsing to throw');
        } catch (error) {
          expect(error).toBeInstanceOf(z.ZodError);
          const zodError = error as z.ZodError;
          expect(zodError.issues[0].message).toBe(expected);
        }
      });
    });
  });
});
