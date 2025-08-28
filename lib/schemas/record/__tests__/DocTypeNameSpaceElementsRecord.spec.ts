import { describe, it, expect } from 'vitest';
import { docTypeNameSpaceElementsRecordSchema } from '../DocTypeNameSpaceElementsRecord';
import {
  recordEmptyMessage,
  recordInvalidTypeMessage,
} from '@/schemas/common/Record';
import { requiredMessage } from '@/schemas/common/Required';
import { nonEmptyTextEmptyMessage } from '@/schemas/common/NonEmptyText';

describe('DocTypeNameSpaceElementsRecord', () => {
  describe('valid cases', () => {
    it('should parse a record with a single document type containing namespace elements', () => {
      const input = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': {
            given_name: 'John',
            family_name: 'Doe',
          },
        },
      } as const;

      const result = docTypeNameSpaceElementsRecordSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('should parse a record with multiple document types', () => {
      const input = {
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
      } as const;

      const result = docTypeNameSpaceElementsRecordSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('should parse a record with multiple namespaces in a single document type', () => {
      const input = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': {
            given_name: 'John',
            family_name: 'Doe',
          },
          'org.iso.18013.5.1.aamva': {
            license_number: '123456789',
          },
        },
      } as const;

      const result = docTypeNameSpaceElementsRecordSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('should parse a record with various data element value types', () => {
      const input = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': {
            string_value: 'text',
            number_value: 42,
            boolean_value: true,
            null_value: null,
            array_value: [1, 2, 3],
            object_value: { nested: 'value' },
          },
        },
      } as const;

      const result = docTypeNameSpaceElementsRecordSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('should parse a record with document type containing special characters', () => {
      const input = {
        'org.example.test-with-dashes.and_dots': {
          'org.example.test': {
            field_name: 'field_value',
          },
        },
      } as const;

      const result = docTypeNameSpaceElementsRecordSchema.parse(input);
      expect(result).toEqual(input);
    });
  });

  describe('invalid cases', () => {
    it('should throw when the outer record is empty', () => {
      expect(() => docTypeNameSpaceElementsRecordSchema.parse({})).toThrow(
        recordEmptyMessage('DocTypeNameSpaceElementsRecord')
      );
    });

    it('should throw when input is null', () => {
      expect(() =>
        docTypeNameSpaceElementsRecordSchema.parse(
          null as unknown as Record<
            string,
            Record<string, Record<string, unknown>>
          >
        )
      ).toThrow(requiredMessage('DocTypeNameSpaceElementsRecord'));
    });

    it('should throw when input is undefined', () => {
      expect(() =>
        docTypeNameSpaceElementsRecordSchema.parse(
          undefined as unknown as Record<
            string,
            Record<string, Record<string, unknown>>
          >
        )
      ).toThrow(requiredMessage('DocTypeNameSpaceElementsRecord'));
    });

    it('should throw when input is a string', () => {
      expect(() =>
        docTypeNameSpaceElementsRecordSchema.parse(
          'not-an-object' as unknown as Record<
            string,
            Record<string, Record<string, unknown>>
          >
        )
      ).toThrow(recordInvalidTypeMessage('DocTypeNameSpaceElementsRecord'));
    });

    it('should throw when input is an array', () => {
      expect(() =>
        docTypeNameSpaceElementsRecordSchema.parse(
          [] as unknown as Record<
            string,
            Record<string, Record<string, unknown>>
          >
        )
      ).toThrow(recordInvalidTypeMessage('DocTypeNameSpaceElementsRecord'));
    });

    it('should throw when input is a number', () => {
      expect(() =>
        docTypeNameSpaceElementsRecordSchema.parse(
          123 as unknown as Record<
            string,
            Record<string, Record<string, unknown>>
          >
        )
      ).toThrow(recordInvalidTypeMessage('DocTypeNameSpaceElementsRecord'));
    });

    it('should throw when input is a boolean', () => {
      expect(() =>
        docTypeNameSpaceElementsRecordSchema.parse(
          true as unknown as Record<
            string,
            Record<string, Record<string, unknown>>
          >
        )
      ).toThrow(recordInvalidTypeMessage('DocTypeNameSpaceElementsRecord'));
    });

    it('should throw when doc type key is empty', () => {
      const input = {
        '': {
          'org.iso.18013.5.1': {
            given_name: 'John',
          },
        },
      } as Record<string, Record<string, Record<string, unknown>>>;

      expect(() => docTypeNameSpaceElementsRecordSchema.parse(input)).toThrow(
        nonEmptyTextEmptyMessage('DocType')
      );
    });

    it('should throw when name spaces record value is empty', () => {
      const input = {
        'org.iso.18013.5.1.mDL': {},
      } as Record<string, Record<string, Record<string, unknown>>>;

      expect(() => docTypeNameSpaceElementsRecordSchema.parse(input)).toThrow(
        recordEmptyMessage('NameSpaceElementsRecord')
      );
    });

    it('should throw when data element identifier is empty', () => {
      const input = {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': {
            '': 'John', // Empty key is invalid
          },
        },
      } as Record<string, Record<string, Record<string, unknown>>>;

      expect(() => docTypeNameSpaceElementsRecordSchema.parse(input)).toThrow(
        nonEmptyTextEmptyMessage('DataElementIdentifier')
      );
    });
  });
});
