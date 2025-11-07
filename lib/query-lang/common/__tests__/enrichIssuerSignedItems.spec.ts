import { describe, it, expect } from 'vitest';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { enrichIssuerSignedItems } from '../enrichIssuerSignedItems';
import { Tag } from 'cbor-x';

/**
 * Helper to build a Tag(24) containing an IssuerSignedItem map.
 */
const makeItemTag = (
  digestID: number,
  elementIdentifier: string,
  elementValue: unknown
): Tag =>
  createTag24(
    createIssuerSignedItem([
      ['digestID', digestID],
      ['random', new Uint8Array([digestID])],
      ['elementIdentifier', elementIdentifier],
      ['elementValue', elementValue],
    ])
  );

describe('enrichIssuerSignedItems', () => {
  it('groups normal items (preserving order) and age_over flags (sorted by NN: true ascending, false descending)', () => {
    const tag1 = makeItemTag(1, 'given_name', 'Alice');
    const tag2 = makeItemTag(2, 'age_over_18', true);
    const tag3 = makeItemTag(3, 'age_over_21', false);
    const tag4 = makeItemTag(4, 'family_name', 'Smith');
    const tag5 = makeItemTag(5, 'age_over_23', false);
    const tag6 = makeItemTag(6, 'age_over_16', true);

    const result = enrichIssuerSignedItems([
      tag1,
      tag2,
      tag3,
      tag4,
      tag5,
      tag6,
    ]);

    expect(result.normalItems).toEqual([
      { elementIdentifier: 'given_name', elementValue: 'Alice', tag: tag1 },
      { elementIdentifier: 'family_name', elementValue: 'Smith', tag: tag4 },
    ]);

    expect(result.ageOverTrueItems).toEqual([
      { nn: 16, tag: tag6 },
      { nn: 18, tag: tag2 },
    ]);

    // ageOverFalseItems should be sorted in descending order (23, 21)
    expect(result.ageOverFalseItems).toEqual([
      { nn: 23, tag: tag5 },
      { nn: 21, tag: tag3 },
    ]);
  });

  it('returns empty groups for empty input', () => {
    const result = enrichIssuerSignedItems([]);
    expect(result).toEqual({
      normalItems: [],
      ageOverTrueItems: [],
      ageOverFalseItems: [],
    });
  });

  describe('should throw error for missing elementIdentifier', () => {
    it('throws error when elementIdentifier is missing', () => {
      const itemWithoutElementIdentifier = new Map<string, unknown>([
        ['digestID', 1],
        ['random', new Uint8Array([1])],
        ['elementValue', 'test'],
      ]);
      const tag = createTag24(itemWithoutElementIdentifier);

      expect(() => {
        enrichIssuerSignedItems([tag]);
      }).toThrow('IssuerSignedItem missing elementIdentifier');
    });

    it('throws error when elementIdentifier is undefined', () => {
      const itemWithUndefinedElementIdentifier = new Map<string, unknown>([
        ['digestID', 1],
        ['random', new Uint8Array([1])],
        ['elementIdentifier', undefined],
        ['elementValue', 'test'],
      ]);
      const tag = createTag24(itemWithUndefinedElementIdentifier);

      expect(() => {
        enrichIssuerSignedItems([tag]);
      }).toThrow('IssuerSignedItem missing elementIdentifier');
    });
  });

  describe('should throw error for invalid age_over format', () => {
    it('throws error for age_over_abc (non-numeric suffix)', () => {
      const tag = makeItemTag(1, 'age_over_abc', true);

      expect(() => {
        enrichIssuerSignedItems([tag]);
      }).toThrow(
        'Invalid age_over format: age_over_abc. Expected format: age_over_NN where NN is a two-digit number'
      );
    });

    it('throws error for age_over_ (missing number)', () => {
      const tag = makeItemTag(1, 'age_over_', true);

      expect(() => {
        enrichIssuerSignedItems([tag]);
      }).toThrow(
        'Invalid age_over format: age_over_. Expected format: age_over_NN where NN is a two-digit number'
      );
    });

    it('throws error for age_over_18_extra (extra characters)', () => {
      const tag = makeItemTag(1, 'age_over_18_extra', true);

      expect(() => {
        enrichIssuerSignedItems([tag]);
      }).toThrow(
        'Invalid age_over format: age_over_18_extra. Expected format: age_over_NN where NN is a two-digit number'
      );
    });

    it('throws error for age_over_5 (single digit)', () => {
      const tag = makeItemTag(1, 'age_over_5', true);

      expect(() => {
        enrichIssuerSignedItems([tag]);
      }).toThrow(
        'Invalid age_over format: age_over_5. Expected format: age_over_NN where NN is a two-digit number'
      );
    });

    it('throws error for age_over_100 (three digits)', () => {
      const tag = makeItemTag(1, 'age_over_100', true);

      expect(() => {
        enrichIssuerSignedItems([tag]);
      }).toThrow(
        'Invalid age_over format: age_over_100. Expected format: age_over_NN where NN is a two-digit number'
      );
    });
  });

  describe('should throw error for non-boolean elementValue in age_over_*', () => {
    it('throws error for age_over_18 with string elementValue', () => {
      const tag = makeItemTag(1, 'age_over_18', 'not a boolean');

      expect(() => {
        enrichIssuerSignedItems([tag]);
      }).toThrow(
        'Invalid elementValue type for age_over_18. Expected boolean, got string'
      );
    });

    it('throws error for age_over_21 with number elementValue', () => {
      const tag = makeItemTag(1, 'age_over_21', 123);

      expect(() => {
        enrichIssuerSignedItems([tag]);
      }).toThrow(
        'Invalid elementValue type for age_over_21. Expected boolean, got number'
      );
    });

    it('throws error for age_over_25 with object elementValue', () => {
      const tag = makeItemTag(1, 'age_over_25', { some: 'object' });

      expect(() => {
        enrichIssuerSignedItems([tag]);
      }).toThrow(
        'Invalid elementValue type for age_over_25. Expected boolean, got Map'
      );
    });

    it('throws error for age_over_30 with null elementValue', () => {
      const tag = makeItemTag(1, 'age_over_30', null);

      expect(() => {
        enrichIssuerSignedItems([tag]);
      }).toThrow(
        'Invalid elementValue type for age_over_30. Expected boolean, got null'
      );
    });

    it('throws error for age_over_35 with array elementValue', () => {
      const tag = makeItemTag(1, 'age_over_35', [1, 2, 3]);

      expect(() => {
        enrichIssuerSignedItems([tag]);
      }).toThrow(
        'Invalid elementValue type for age_over_35. Expected boolean, got Array'
      );
    });
  });
});
