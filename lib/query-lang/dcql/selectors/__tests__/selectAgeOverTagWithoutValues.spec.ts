import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { selectAgeOverTagWithoutValues } from '../selectAgeOverTagWithoutValues';
import { EnrichedAgeOverIssuerSignedItem } from '@/query-lang/common/enrichIssuerSignedItems';

describe('selectAgeOverTagWithoutValues', () => {
  describe('should select from ageOverTrueItems when matching item exists', () => {
    it('selects the first matching true item when nn >= requestedNn', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const tag3 = new Tag('value3', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: tag1 },
        { nn: 21, tag: tag2 },
        { nn: 25, tag: tag3 },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectAgeOverTagWithoutValues({
        requestedNn: 20,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag2);
    });

    it('selects the first matching true item when nn === requestedNn', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: tag1 },
        { nn: 20, tag: tag2 },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectAgeOverTagWithoutValues({
        requestedNn: 20,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag2);
    });
  });

  describe('should select from ageOverFalseItems when no matching true item exists', () => {
    it('selects the first matching false item when nn <= requestedNn', () => {
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

      const result = selectAgeOverTagWithoutValues({
        requestedNn: 25,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag3);
    });

    it('selects the first matching false item when nn === requestedNn', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 18, tag: tag1 },
      ];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 20, tag: tag2 },
        { nn: 19, tag: tag1 },
      ];

      const result = selectAgeOverTagWithoutValues({
        requestedNn: 20,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBe(tag2);
    });
  });

  describe('should return undefined when no matching item exists', () => {
    it('returns undefined when ageOverTrueItems is empty and no false item matches', () => {
      const tag1 = new Tag('value1', 24);
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [
        { nn: 24, tag: tag1 },
      ];

      const result = selectAgeOverTagWithoutValues({
        requestedNn: 15,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined when both arrays are empty', () => {
      const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
      const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

      const result = selectAgeOverTagWithoutValues({
        requestedNn: 20,
        ageOverTrueItems,
        ageOverFalseItems,
      });

      expect(result).toBeUndefined();
    });
  });
});
