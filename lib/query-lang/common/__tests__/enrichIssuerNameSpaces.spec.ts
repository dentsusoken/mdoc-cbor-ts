import { describe, it, expect } from 'vitest';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { enrichIssuerNameSpaces } from '../enrichIssuerNameSpaces';
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

describe('enrichIssuerNameSpaces', () => {
  describe('should enrich single namespace', () => {
    it('enriches namespace with normal items only', () => {
      const tag1 = makeItemTag(1, 'given_name', 'Alice');
      const tag2 = makeItemTag(2, 'family_name', 'Smith');
      const issuerNameSpaces = new Map([['org.iso.18013.5.1', [tag1, tag2]]]);

      const result = enrichIssuerNameSpaces(issuerNameSpaces);

      expect(result.size).toBe(1);
      const enriched = result.get('org.iso.18013.5.1');
      expect(enriched).toBeDefined();
      expect(enriched!.normalItems).toEqual([
        { elementIdentifier: 'given_name', elementValue: 'Alice', tag: tag1 },
        { elementIdentifier: 'family_name', elementValue: 'Smith', tag: tag2 },
      ]);
      expect(enriched!.ageOverTrueItems).toEqual([]);
      expect(enriched!.ageOverFalseItems).toEqual([]);
    });

    it('enriches namespace with age_over_* items only', () => {
      const tag1 = makeItemTag(1, 'age_over_18', true);
      const tag2 = makeItemTag(2, 'age_over_21', false);
      const tag3 = makeItemTag(3, 'age_over_16', true);
      const issuerNameSpaces = new Map([
        ['org.iso.18013.5.1', [tag1, tag2, tag3]],
      ]);

      const result = enrichIssuerNameSpaces(issuerNameSpaces);

      expect(result.size).toBe(1);
      const enriched = result.get('org.iso.18013.5.1');
      expect(enriched).toBeDefined();
      expect(enriched!.normalItems).toEqual([]);
      // ageOverTrueItems should be sorted in ascending order (16, 18)
      expect(enriched!.ageOverTrueItems).toEqual([
        { nn: 16, tag: tag3 },
        { nn: 18, tag: tag1 },
      ]);
      // ageOverFalseItems should be sorted in descending order (21)
      expect(enriched!.ageOverFalseItems).toEqual([{ nn: 21, tag: tag2 }]);
    });

    it('enriches namespace with mixed normal and age_over_* items', () => {
      const tag1 = makeItemTag(1, 'given_name', 'Alice');
      const tag2 = makeItemTag(2, 'age_over_18', true);
      const tag3 = makeItemTag(3, 'family_name', 'Smith');
      const tag4 = makeItemTag(4, 'age_over_21', false);
      const issuerNameSpaces = new Map([
        ['org.iso.18013.5.1', [tag1, tag2, tag3, tag4]],
      ]);

      const result = enrichIssuerNameSpaces(issuerNameSpaces);

      expect(result.size).toBe(1);
      const enriched = result.get('org.iso.18013.5.1');
      expect(enriched).toBeDefined();
      expect(enriched!.normalItems).toEqual([
        { elementIdentifier: 'given_name', elementValue: 'Alice', tag: tag1 },
        { elementIdentifier: 'family_name', elementValue: 'Smith', tag: tag3 },
      ]);
      expect(enriched!.ageOverTrueItems).toEqual([{ nn: 18, tag: tag2 }]);
      expect(enriched!.ageOverFalseItems).toEqual([{ nn: 21, tag: tag4 }]);
    });
  });

  describe('should enrich multiple namespaces', () => {
    it('enriches multiple namespaces independently', () => {
      const tag1 = makeItemTag(1, 'given_name', 'Alice');
      const tag2 = makeItemTag(2, 'age_over_18', true);
      const tag3 = makeItemTag(3, 'document_number', '123456');
      const tag4 = makeItemTag(4, 'age_over_21', false);
      const issuerNameSpaces = new Map([
        ['org.iso.18013.5.1', [tag1, tag2]],
        ['org.iso.18013.5.2', [tag3, tag4]],
      ]);

      const result = enrichIssuerNameSpaces(issuerNameSpaces);

      expect(result.size).toBe(2);

      const enriched1 = result.get('org.iso.18013.5.1');
      expect(enriched1).toBeDefined();
      expect(enriched1!.normalItems).toEqual([
        { elementIdentifier: 'given_name', elementValue: 'Alice', tag: tag1 },
      ]);
      expect(enriched1!.ageOverTrueItems).toEqual([{ nn: 18, tag: tag2 }]);
      expect(enriched1!.ageOverFalseItems).toEqual([]);

      const enriched2 = result.get('org.iso.18013.5.2');
      expect(enriched2).toBeDefined();
      expect(enriched2!.normalItems).toEqual([
        {
          elementIdentifier: 'document_number',
          elementValue: '123456',
          tag: tag3,
        },
      ]);
      expect(enriched2!.ageOverTrueItems).toEqual([]);
      expect(enriched2!.ageOverFalseItems).toEqual([{ nn: 21, tag: tag4 }]);
    });

    it('enriches multiple namespaces with different item types', () => {
      const tag1 = makeItemTag(1, 'given_name', 'Alice');
      const tag2 = makeItemTag(2, 'family_name', 'Smith');
      const tag3 = makeItemTag(3, 'age_over_18', true);
      const tag4 = makeItemTag(4, 'age_over_21', false);
      const tag5 = makeItemTag(5, 'age_over_16', true);
      const issuerNameSpaces = new Map([
        ['org.iso.18013.5.1', [tag1, tag2]], // Only normal items
        ['org.iso.18013.5.2', [tag3, tag4, tag5]], // Only age_over_* items
      ]);

      const result = enrichIssuerNameSpaces(issuerNameSpaces);

      expect(result.size).toBe(2);

      const enriched1 = result.get('org.iso.18013.5.1');
      expect(enriched1).toBeDefined();
      expect(enriched1!.normalItems).toHaveLength(2);
      expect(enriched1!.ageOverTrueItems).toEqual([]);
      expect(enriched1!.ageOverFalseItems).toEqual([]);

      const enriched2 = result.get('org.iso.18013.5.2');
      expect(enriched2).toBeDefined();
      expect(enriched2!.normalItems).toEqual([]);
      expect(enriched2!.ageOverTrueItems).toEqual([
        { nn: 16, tag: tag5 },
        { nn: 18, tag: tag3 },
      ]);
      expect(enriched2!.ageOverFalseItems).toEqual([{ nn: 21, tag: tag4 }]);
    });
  });

  describe('should handle edge cases', () => {
    it('returns empty map for empty IssuerNameSpaces', () => {
      const issuerNameSpaces = new Map();

      const result = enrichIssuerNameSpaces(issuerNameSpaces);

      expect(result.size).toBe(0);
    });

    it('handles namespace with empty tag array', () => {
      const issuerNameSpaces = new Map([['org.iso.18013.5.1', []]]);

      const result = enrichIssuerNameSpaces(issuerNameSpaces);

      expect(result.size).toBe(1);
      const enriched = result.get('org.iso.18013.5.1');
      expect(enriched).toBeDefined();
      expect(enriched!.normalItems).toEqual([]);
      expect(enriched!.ageOverTrueItems).toEqual([]);
      expect(enriched!.ageOverFalseItems).toEqual([]);
    });

    it('preserves order of normal items', () => {
      const tag1 = makeItemTag(1, 'given_name', 'Alice');
      const tag2 = makeItemTag(2, 'family_name', 'Smith');
      const tag3 = makeItemTag(3, 'birth_date', '1990-01-01');
      const issuerNameSpaces = new Map([
        ['org.iso.18013.5.1', [tag1, tag2, tag3]],
      ]);

      const result = enrichIssuerNameSpaces(issuerNameSpaces);

      const enriched = result.get('org.iso.18013.5.1');
      expect(enriched!.normalItems).toEqual([
        { elementIdentifier: 'given_name', elementValue: 'Alice', tag: tag1 },
        { elementIdentifier: 'family_name', elementValue: 'Smith', tag: tag2 },
        {
          elementIdentifier: 'birth_date',
          elementValue: '1990-01-01',
          tag: tag3,
        },
      ]);
    });

    it('sorts ageOverTrueItems in ascending order by NN', () => {
      const tag1 = makeItemTag(1, 'age_over_25', true);
      const tag2 = makeItemTag(2, 'age_over_18', true);
      const tag3 = makeItemTag(3, 'age_over_30', true);
      const tag4 = makeItemTag(4, 'age_over_21', true);
      const issuerNameSpaces = new Map([
        ['org.iso.18013.5.1', [tag1, tag2, tag3, tag4]],
      ]);

      const result = enrichIssuerNameSpaces(issuerNameSpaces);

      const enriched = result.get('org.iso.18013.5.1');
      expect(enriched!.ageOverTrueItems).toEqual([
        { nn: 18, tag: tag2 },
        { nn: 21, tag: tag4 },
        { nn: 25, tag: tag1 },
        { nn: 30, tag: tag3 },
      ]);
    });

    it('sorts ageOverFalseItems in descending order by NN', () => {
      const tag1 = makeItemTag(1, 'age_over_25', false);
      const tag2 = makeItemTag(2, 'age_over_18', false);
      const tag3 = makeItemTag(3, 'age_over_30', false);
      const tag4 = makeItemTag(4, 'age_over_21', false);
      const issuerNameSpaces = new Map([
        ['org.iso.18013.5.1', [tag1, tag2, tag3, tag4]],
      ]);

      const result = enrichIssuerNameSpaces(issuerNameSpaces);

      const enriched = result.get('org.iso.18013.5.1');
      expect(enriched!.ageOverFalseItems).toEqual([
        { nn: 30, tag: tag3 },
        { nn: 25, tag: tag1 },
        { nn: 21, tag: tag4 },
        { nn: 18, tag: tag2 },
      ]);
    });
  });
});

