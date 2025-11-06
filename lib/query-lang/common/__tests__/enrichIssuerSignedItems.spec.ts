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
});
