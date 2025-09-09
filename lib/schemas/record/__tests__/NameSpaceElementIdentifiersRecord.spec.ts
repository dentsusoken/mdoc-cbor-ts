import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { nameSpaceElementIdentifiersRecordSchema } from '../NameSpaceElementIdentifiersRecord';
import {
  recordEmptyMessage,
  recordInvalidTypeMessage,
} from '@/schemas/common/Record';
import { requiredMessage } from '@/schemas/common/Required';
import {
  nonEmptyTextEmptyMessage,
  nonEmptyTextInvalidTypeMessage,
} from '@/schemas/common/NonEmptyText';
import { arrayEmptyMessage } from '@/schemas/common/Array';

describe('NameSpaceElementIdentifiersRecord', () => {
  describe('valid cases', () => {
    it('should parse a record with a single namespace containing element identifiers', () => {
      const input = {
        'org.iso.18013.5.1': ['given_name', 'family_name', 'age'],
      } as const;

      const result = nameSpaceElementIdentifiersRecordSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('should accept readonly arrays in input and return mutable arrays in output', () => {
      const input: Record<string, readonly string[]> = {
        'org.iso.18013.5.1': ['given_name', 'family_name'] as const,
      } as const;

      const result = nameSpaceElementIdentifiersRecordSchema.parse(input);

      expect(Array.isArray(result['org.iso.18013.5.1'])).toBe(true);
      // Mutation should be allowed on the output type (string[])
      result['org.iso.18013.5.1'].push('age');
      expect(result['org.iso.18013.5.1']).toEqual([
        'given_name',
        'family_name',
        'age',
      ]);
    });

    it('should parse a record with multiple namespaces', () => {
      const input = {
        'org.iso.18013.5.1': ['given_name', 'family_name'],
        'org.iso.18013.5.2': ['document_number', 'expiry_date'],
      } as const;

      const result = nameSpaceElementIdentifiersRecordSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('should accept as const record and preserve values', () => {
      const input = {
        'org.iso.18013.5.1': ['a', 'b'] as const,
        'org.iso.18013.5.2': ['c'] as const,
      } as const;

      const result = nameSpaceElementIdentifiersRecordSchema.parse(input);
      expect(result['org.iso.18013.5.1']).toEqual(['a', 'b']);
      expect(result['org.iso.18013.5.2']).toEqual(['c']);
    });

    it('should parse a record with namespace containing special characters', () => {
      const input = {
        'org.example.test-with-dashes.and_dots': [
          'field_name',
          'another_field',
        ],
      } as const;

      const result = nameSpaceElementIdentifiersRecordSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('should parse a record with various element identifier types', () => {
      const input = {
        'org.iso.18013.5.1': [
          'string_identifier',
          'number_identifier',
          'boolean_identifier',
          'mixed_case_Identifier',
        ],
      } as const;

      const result = nameSpaceElementIdentifiersRecordSchema.parse(input);
      expect(result).toEqual(input);
    });
  });

  describe('invalid cases', () => {
    const TARGET = 'NameSpaceElementIdentifiersRecord';

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
        name: 'empty namespace key',
        input: {
          '': ['given_name'],
        },
        expected: nonEmptyTextEmptyMessage('NameSpace'),
      },
      {
        name: 'empty data elements array',
        input: {
          'org.iso.18013.5.1': [],
        },
        expected: arrayEmptyMessage('DataElementsArray'),
      },
      {
        name: 'invalid element type in array',
        input: {
          'org.iso.18013.5.1': [123, 'given_name'],
        },
        expected: nonEmptyTextInvalidTypeMessage('DataElementIdentifier'),
      },
      {
        name: 'empty string element identifier',
        input: {
          'org.iso.18013.5.1': ['given_name', '', 'family_name'],
        },
        expected: nonEmptyTextEmptyMessage('DataElementIdentifier'),
      },
    ];

    cases.forEach(({ name, input, expected }) => {
      it(`should reject ${name}`, () => {
        try {
          nameSpaceElementIdentifiersRecordSchema.parse(input as never);
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
