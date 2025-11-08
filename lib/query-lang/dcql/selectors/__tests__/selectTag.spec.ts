import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { selectTag } from '../selectTag';
import {
  EnrichedAgeOverIssuerSignedItem,
  EnrichedIssuerSignedItem,
} from '@/query-lang/common/enrichIssuerSignedItems';

describe('selectTag', () => {
  describe('should delegate to selectNormalTag for normal identifiers', () => {
    it('returns tag when requestedIdentifier does not start with age_over_ and item is found', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        { elementIdentifier: 'given_name', elementValue: 'John', tag: tag1 },
        {
          elementIdentifier: 'family_name',
          elementValue: 'Doe',
          tag: new Tag('value2', 24),
        },
      ];
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'given_name',
        requestedValues: undefined,
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag1);
    });

    it('returns tag when requestedIdentifier matches and elementValue is in requestedValues', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        { elementIdentifier: 'given_name', elementValue: 'John', tag: tag1 },
      ];
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'given_name',
        requestedValues: ['John', 'Jane'],
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag1);
    });

    it('returns undefined when requestedIdentifier does not match', () => {
      const normalItems: EnrichedIssuerSignedItem[] = [
        {
          elementIdentifier: 'given_name',
          elementValue: 'John',
          tag: new Tag('value1', 24),
        },
      ];
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'family_name',
        requestedValues: undefined,
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined when requestedIdentifier matches but elementValue is not in requestedValues', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        {
          elementIdentifier: 'given_name',
          elementValue: 'John',
          tag: tag1,
        },
      ];
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'given_name',
        requestedValues: ['Jane', 'Bob'],
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('should delegate to selectAgeOverTag for age_over_* identifiers', () => {
    it('returns tag from ageOverTrueItems when requestedValues is undefined and nn >= requestedNn', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: tag1 },
        { nn: 21, tag: tag2 },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const normalItems: EnrichedIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'age_over_20',
        requestedValues: undefined,
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag2);
    });

    it('returns tag from ageOverFalseItems when no matching true item exists', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const tag3 = new Tag('value3', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: tag1 },
        { nn: 21, tag: tag2 },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 24, tag: tag3 },
        { nn: 22, tag: tag1 },
      ];
      const normalItems: EnrichedIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'age_over_25',
        requestedValues: undefined,
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag3);
    });

    it('returns tag from ageOverTrueItems when requestedValues is [true] and nn === requestedNn', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: tag1 },
        { nn: 21, tag: tag2 },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const normalItems: EnrichedIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'age_over_18',
        requestedValues: [true],
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag1);
    });

    it('returns tag from ageOverFalseItems when requestedValues is [false] and nn === requestedNn', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 24, tag: tag1 },
        { nn: 22, tag: tag2 },
      ];
      const normalItems: EnrichedIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'age_over_24',
        requestedValues: [false],
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag1);
    });

    it('returns undefined when requestedValues is [true] but no matching item in ageOverTrueItems', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: new Tag('value1', 24) },
        { nn: 21, tag: new Tag('value2', 24) },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const normalItems: EnrichedIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'age_over_20',
        requestedValues: [true],
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined when requestedValues is [false] but no matching item in ageOverFalseItems', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 24, tag: new Tag('value1', 24) },
        { nn: 22, tag: new Tag('value2', 24) },
      ];
      const normalItems: EnrichedIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'age_over_20',
        requestedValues: [false],
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined when no matching item exists for age_over_* identifier', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 10, tag: new Tag('value1', 24) },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 20, tag: new Tag('value2', 24) },
      ];
      const normalItems: EnrichedIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'age_over_15',
        requestedValues: undefined,
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('should handle edge cases', () => {
    it('handles empty normalItems array for normal identifier', () => {
      const normalItems: EnrichedIssuerSignedItem[] = [];
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'given_name',
        requestedValues: undefined,
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });

    it('handles empty ageOverTrueItems and ageOverFalseItems arrays for age_over_* identifier', () => {
      const normalItems: EnrichedIssuerSignedItem[] = [];
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'age_over_18',
        requestedValues: undefined,
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });

    it('handles different value types in requestedValues for normal identifier', () => {
      const tag1 = new Tag('value1', 24);
      const normalItems: EnrichedIssuerSignedItem[] = [
        { elementIdentifier: 'age', elementValue: 25, tag: tag1 },
      ];
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectTag({
        requestedIdentifier: 'age',
        requestedValues: [25, 30, 35],
        normalItems,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag1);
    });

    it('handles identifier that starts with age_over_ but is not a valid format', () => {
      const normalItems: EnrichedIssuerSignedItem[] = [];
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      expect(() => {
        selectTag({
          requestedIdentifier: 'age_over_invalid',
          requestedValues: undefined,
          normalItems,
          ageOverTrueItems,
          ageOverFalseItems,
        });
      }).toThrow('Invalid age_over format');
    });

    it('handles identifier that starts with age_over_ but has single digit', () => {
      const normalItems: EnrichedIssuerSignedItem[] = [];
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      expect(() => {
        selectTag({
          requestedIdentifier: 'age_over_5',
          requestedValues: undefined,
          normalItems,
          ageOverTrueItems,
          ageOverFalseItems,
        });
      }).toThrow('Invalid age_over format');
    });
  });
});

