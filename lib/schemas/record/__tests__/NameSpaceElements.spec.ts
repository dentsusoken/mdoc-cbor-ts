import { describe, it, expect } from 'vitest';
import { nameSpaceElementsSchema } from '../NameSpaceElements';
import {
  recordEmptyMessage,
  recordInvalidTypeMessage,
} from '@/schemas/common/Record';
import { requiredMessage } from '@/schemas/common/Required';

describe('NameSpaceElements', () => {
  describe('valid cases', () => {
    it('should parse a record with multiple namespaces containing data elements', () => {
      const input = {
        'org.iso.18013.5.1': {
          given_name: 'John',
          family_name: 'Doe',
          age: 30,
        },
        'org.iso.18013.5.2': {
          document_number: '1234567890',
        },
      } as const;

      const parsed = nameSpaceElementsSchema.parse(input);
      expect(parsed).toEqual(input);
    });

    it('should parse a record with a single namespace containing multiple data elements', () => {
      const input = {
        'org.iso.18013.5.1': {
          given_name: 'Jane',
          family_name: 'Smith',
          birth_date: '1990-01-01',
          document_number: 'ABC123456',
        },
      } as const;

      const parsed = nameSpaceElementsSchema.parse(input);
      expect(parsed).toEqual(input);
    });

    it('should parse a record with various data element value types', () => {
      const input = {
        'org.iso.18013.5.1': {
          string_value: 'test string',
          number_value: 42,
          boolean_value: true,
          null_value: null,
          array_value: [1, 2, 3],
          object_value: { nested: 'value' },
        },
      } as const;

      const parsed = nameSpaceElementsSchema.parse(input);
      expect(parsed).toEqual(input);
    });

    it('should parse a record with namespace containing special characters', () => {
      const input = {
        'org.example.test-with-dashes.and_dots': {
          field_name: 'field_value',
          another_field: 123,
        },
      } as const;

      const parsed = nameSpaceElementsSchema.parse(input);
      expect(parsed).toEqual(input);
    });
  });

  describe('invalid cases', () => {
    it('should throw when the outer record is empty', () => {
      expect(() => nameSpaceElementsSchema.parse({})).toThrow(
        recordEmptyMessage('NameSpaceElements')
      );
    });

    it('should throw when an inner record is empty', () => {
      const input = {
        'org.iso.18013.5.1': {},
      } as Record<string, Record<string, unknown>>;

      expect(() => nameSpaceElementsSchema.parse(input)).toThrow(
        recordEmptyMessage('NameSpaceElements.Value')
      );
    });

    it('should throw when input is null', () => {
      expect(() =>
        nameSpaceElementsSchema.parse(
          null as unknown as Record<string, Record<string, unknown>>
        )
      ).toThrow(requiredMessage('NameSpaceElements'));
    });

    it('should throw when input is undefined', () => {
      expect(() =>
        nameSpaceElementsSchema.parse(
          undefined as unknown as Record<string, Record<string, unknown>>
        )
      ).toThrow(requiredMessage('NameSpaceElements'));
    });

    it('should throw when input is a Map', () => {
      expect(() =>
        nameSpaceElementsSchema.parse(
          new Map() as unknown as Record<string, Record<string, unknown>>
        )
      ).toThrow(recordInvalidTypeMessage('NameSpaceElements'));
    });

    it('should throw when input is a string', () => {
      expect(() =>
        nameSpaceElementsSchema.parse(
          'not-a-record' as unknown as Record<string, Record<string, unknown>>
        )
      ).toThrow(recordInvalidTypeMessage('NameSpaceElements'));
    });

    it('should throw when input is an array', () => {
      expect(() =>
        nameSpaceElementsSchema.parse(
          [] as unknown as Record<string, Record<string, unknown>>
        )
      ).toThrow(recordInvalidTypeMessage('NameSpaceElements'));
    });

    it('should throw when input is a number', () => {
      expect(() =>
        nameSpaceElementsSchema.parse(
          123 as unknown as Record<string, Record<string, unknown>>
        )
      ).toThrow(recordInvalidTypeMessage('NameSpaceElements'));
    });

    it('should throw when input is a boolean', () => {
      expect(() =>
        nameSpaceElementsSchema.parse(
          true as unknown as Record<string, Record<string, unknown>>
        )
      ).toThrow(recordInvalidTypeMessage('NameSpaceElements'));
    });
  });
});
