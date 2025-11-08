import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { selectAgeOverTag } from '../selectAgeOverTag';
import { EnrichedAgeOverIssuerSignedItem } from '@/query-lang/common/enrichIssuerSignedItems';

describe('selectAgeOverTag', () => {
  describe('should delegate to selectAgeOverTagWithoutValues when requestedValues is undefined', () => {
    it('returns tag from ageOverTrueItems when nn >= requestedNn', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: tag1 },
        { nn: 21, tag: tag2 },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectAgeOverTag({
        requestedNn: 20,
        requestedValues: undefined,
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

      const result = selectAgeOverTag({
        requestedNn: 25,
        requestedValues: undefined,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag3);
    });

    it('returns undefined when no matching item exists', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 10, tag: new Tag('value1', 24) },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 20, tag: new Tag('value2', 24) },
      ];

      const result = selectAgeOverTag({
        requestedNn: 15,
        requestedValues: undefined,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('should delegate to selectAgeOverTagWithValues when requestedValues is provided', () => {
    it('returns tag from ageOverTrueItems when requestedValues is [true] and nn === requestedNn', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: tag1 },
        { nn: 21, tag: tag2 },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectAgeOverTag({
        requestedNn: 18,
        requestedValues: [true],
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

      const result = selectAgeOverTag({
        requestedNn: 24,
        requestedValues: [false],
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

      const result = selectAgeOverTag({
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

      const result = selectAgeOverTag({
        requestedNn: 20,
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
        selectAgeOverTag({
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
        selectAgeOverTag({
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
        selectAgeOverTag({
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
        selectAgeOverTag({
          requestedNn: 18,
          requestedValues: [1],
          ageOverTrueItems,
          ageOverFalseItems,
        });
      }).toThrow('requestedValues must be an array of booleans');
    });
  });
});
