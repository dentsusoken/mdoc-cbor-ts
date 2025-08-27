import { describe, it, expect } from 'vitest';
import { nameSpacesRecordSchema } from '../NameSpacesRecord';
import {
  recordEmptyMessage,
  recordInvalidTypeMessage,
} from '@/schemas/common/Record';
import { requiredMessage } from '@/schemas/common/Required';

/**
 * Tests for NameSpacesRecord schema
 */

describe('NameSpacesRecord', () => {
  describe('valid cases', () => {
    it('should parse a non-empty record of namespaces to data elements', () => {
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

      const parsed = nameSpacesRecordSchema.parse(input);
      expect(parsed).toEqual(input);
    });
  });

  describe('invalid cases', () => {
    it('should throw when the outer record is empty', () => {
      expect(() => nameSpacesRecordSchema.parse({})).toThrow(
        recordEmptyMessage('NameSpacesRecord')
      );
    });

    it('should throw when an inner record is empty', () => {
      const input = {
        'org.iso.18013.5.1': {},
      } as Record<string, Record<string, unknown>>;

      expect(() => nameSpacesRecordSchema.parse(input)).toThrow(
        recordEmptyMessage('NameSpacesRecord.Value')
      );
    });

    it('should enforce required (reject null/undefined)', () => {
      expect(() =>
        nameSpacesRecordSchema.parse(
          null as unknown as Record<string, Record<string, unknown>>
        )
      ).toThrow(requiredMessage('NameSpacesRecord'));
      expect(() =>
        nameSpacesRecordSchema.parse(
          undefined as unknown as Record<string, Record<string, unknown>>
        )
      ).toThrow(requiredMessage('NameSpacesRecord'));
    });

    it('should reject non-record types with invalid type message', () => {
      expect(() =>
        nameSpacesRecordSchema.parse(
          new Map() as unknown as Record<string, Record<string, unknown>>
        )
      ).toThrow(recordInvalidTypeMessage('NameSpacesRecord'));
      expect(() =>
        nameSpacesRecordSchema.parse(
          'not-a-record' as unknown as Record<string, Record<string, unknown>>
        )
      ).toThrow(recordInvalidTypeMessage('NameSpacesRecord'));
    });
  });
});
