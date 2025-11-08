import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { selectAgeOverTagWithValues } from '../selectAgeOverTagWithValues';
import { EnrichedAgeOverIssuerSignedItem } from '@/query-lang/common/enrichIssuerSignedItems';

describe('selectAgeOverTagWithValues', () => {
  describe('should return tag when item is found in ageOverTrueItems', () => {
    it('returns tag when requestedValues is [true] and nn === requestedNn', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: tag1 },
        { nn: 21, tag: tag2 },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectAgeOverTagWithValues({
        requestedNn: 18,
        requestedValues: [true],
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag1);
    });

    it('returns tag when requestedValues is [true] and nn === requestedNn (different nn)', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: tag1 },
        { nn: 21, tag: tag2 },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectAgeOverTagWithValues({
        requestedNn: 21,
        requestedValues: [true],
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag2);
    });
  });

  describe('should return tag when item is found in ageOverFalseItems', () => {
    it('returns tag when requestedValues is [false] and nn === requestedNn', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 24, tag: tag1 },
        { nn: 22, tag: tag2 },
      ];

      const result = selectAgeOverTagWithValues({
        requestedNn: 24,
        requestedValues: [false],
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag1);
    });

    it('returns tag when requestedValues is [false] and nn === requestedNn (different nn)', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 24, tag: tag1 },
        { nn: 22, tag: tag2 },
      ];

      const result = selectAgeOverTagWithValues({
        requestedNn: 22,
        requestedValues: [false],
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag2);
    });
  });

  describe('should return undefined when item is not found', () => {
    it('returns undefined when requestedValues is [true] but no matching item in ageOverTrueItems', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: new Tag('value1', 24) },
        { nn: 21, tag: new Tag('value2', 24) },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectAgeOverTagWithValues({
        requestedNn: 20,
        requestedValues: [true],
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

      const result = selectAgeOverTagWithValues({
        requestedNn: 20,
        requestedValues: [false],
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined when ageOverTrueItems is empty and requestedValues is [true]', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 24, tag: new Tag('value1', 24) },
      ];

      const result = selectAgeOverTagWithValues({
        requestedNn: 18,
        requestedValues: [true],
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined when ageOverFalseItems is empty and requestedValues is [false]', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: new Tag('value1', 24) },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectAgeOverTagWithValues({
        requestedNn: 24,
        requestedValues: [false],
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('should throw error for invalid requestedValues', () => {
    it('throws error when requestedValues length is 0', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      expect(() => {
        selectAgeOverTagWithValues({
          requestedNn: 18,
          requestedValues: [],
          ageOverTrueItems,
          ageOverFalseItems,
        });
      }).toThrow('requestedValues must be an array of length 1');
    });

    it('throws error when requestedValues length is 2', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      expect(() => {
        selectAgeOverTagWithValues({
          requestedNn: 18,
          requestedValues: [true, false],
          ageOverTrueItems,
          ageOverFalseItems,
        });
      }).toThrow('requestedValues must be an array of length 1');
    });

    it('throws error when requestedValues[0] is not a boolean (string)', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      expect(() => {
        selectAgeOverTagWithValues({
          requestedNn: 18,
          requestedValues: ['true'],
          ageOverTrueItems,
          ageOverFalseItems,
        });
      }).toThrow('requestedValues must be an array of booleans');
    });

    it('throws error when requestedValues[0] is not a boolean (number)', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      expect(() => {
        selectAgeOverTagWithValues({
          requestedNn: 18,
          requestedValues: [1],
          ageOverTrueItems,
          ageOverFalseItems,
        });
      }).toThrow('requestedValues must be an array of booleans');
    });

    it('throws error when requestedValues[0] is not a boolean (null)', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      expect(() => {
        selectAgeOverTagWithValues({
          requestedNn: 18,
          requestedValues: [null],
          ageOverTrueItems,
          ageOverFalseItems,
        });
      }).toThrow('requestedValues must be an array of booleans');
    });

    it('throws error when requestedValues[0] is not a boolean (object)', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      expect(() => {
        selectAgeOverTagWithValues({
          requestedNn: 18,
          requestedValues: [{}],
          ageOverTrueItems,
          ageOverFalseItems,
        });
      }).toThrow('requestedValues must be an array of booleans');
    });
  });
});

