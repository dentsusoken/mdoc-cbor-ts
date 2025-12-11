import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { selectIssuerNameSpaces } from '../selectIssuerNameSpaces';
import { DcqlClaim } from '../../schemas/DcqlClaim';
import { DcqlClaimSet } from '../../schemas/DcqlClaimSet';

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

describe('selectIssuerNameSpaces', () => {
  describe('should return empty map when claims is undefined', () => {
    it('returns empty map when both claims and claimSets are undefined', () => {
      const nameSpaces = new Map([['org.iso.18013.5.1', []]]);

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims: undefined,
        claimSets: undefined,
      });

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(0);
    });

    it('returns empty map when claims is undefined even if nameSpaces has data', () => {
      const nameSpaces = new Map([
        ['org.iso.18013.5.1', [makeItemTag(1, 'given_name', 'John')]],
      ]);

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims: undefined,
        claimSets: undefined,
      });

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(0);
    });
  });

  describe('should return undefined when claimSets is provided without claims', () => {
    it('returns undefined when claimSets is provided but claims is undefined', () => {
      const nameSpaces = new Map([['org.iso.18013.5.1', []]]);
      const claimSets: DcqlClaimSet[] = [['claim1']];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims: undefined,
        claimSets,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('should process claims without claim sets', () => {
    it('returns selected tags when claims are satisfied', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'family_name', 'Doe');
      const nameSpaces = new Map([['org.iso.18013.5.1', [tag1, tag2]]]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'given_name'],
          values: undefined,
          intent_to_retain: false,
        },
        {
          path: ['org.iso.18013.5.1', 'family_name'],
          values: undefined,
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims,
        claimSets: undefined,
      });

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1, tag2]);
    });

    it('returns undefined when claims cannot be satisfied', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const nameSpaces = new Map([['org.iso.18013.5.1', [tag1]]]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'non_existent'],
          values: undefined,
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims,
        claimSets: undefined,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined when namespace does not exist', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const nameSpaces = new Map([['org.iso.18013.5.1', [tag1]]]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.2', 'given_name'],
          values: undefined,
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims,
        claimSets: undefined,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('should process claims with claim sets', () => {
    it('returns selected tags when first claim set succeeds', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'family_name', 'Doe');
      const nameSpaces = new Map([['org.iso.18013.5.1', [tag1, tag2]]]);
      const claims: DcqlClaim[] = [
        {
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
        {
          id: 'claim2',
          path: ['org.iso.18013.5.1', 'family_name'],
          intent_to_retain: false,
        },
      ];
      const claimSets: DcqlClaimSet[] = [['claim1', 'claim2']];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims,
        claimSets,
      });

      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1, tag2]);
    });

    it('returns selected tags when second claim set succeeds after first fails', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const nameSpaces = new Map([['org.iso.18013.5.1', [tag1]]]);
      const claims: DcqlClaim[] = [
        {
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'non_existent'],
          intent_to_retain: false,
        },
        {
          id: 'claim2',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
      ];
      const claimSets: DcqlClaimSet[] = [
        ['claim1'], // First claim set fails
        ['claim2'], // Second claim set succeeds
      ];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims,
        claimSets,
      });

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1]);
    });

    it('returns undefined when all claim sets fail', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const nameSpaces = new Map([['org.iso.18013.5.1', [tag1]]]);
      const claims: DcqlClaim[] = [
        {
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'non_existent1'],
          intent_to_retain: false,
        },
        {
          id: 'claim2',
          path: ['org.iso.18013.5.1', 'non_existent2'],
          intent_to_retain: false,
        },
      ];
      const claimSets: DcqlClaimSet[] = [['claim1'], ['claim2']];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims,
        claimSets,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined when claim ID in claim set is not found', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const nameSpaces = new Map([['org.iso.18013.5.1', [tag1]]]);
      const claims: DcqlClaim[] = [
        {
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
      ];
      const claimSets: DcqlClaimSet[] = [['non_existent']];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims,
        claimSets,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('should handle errors', () => {
    it('returns undefined when ErrorCodeError occurs (claimSets without claims)', () => {
      // Test that ErrorCodeError from claimSets without claims is logged and returns undefined
      const nameSpaces = new Map([['org.iso.18013.5.1', []]]);
      const claimSets: DcqlClaimSet[] = [['claim1']];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims: undefined,
        claimSets,
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined when Error occurs (claim ID not found)', () => {
      // Test that when a regular Error occurs (like from extractClaims), it is logged and returns undefined
      const nameSpaces = new Map([
        ['org.iso.18013.5.1', [makeItemTag(1, 'given_name', 'John')]],
      ]);
      const claims: DcqlClaim[] = [
        {
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
      ];
      const claimSets: DcqlClaimSet[] = [['non_existent']];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims,
        claimSets,
      });

      expect(result).toBeUndefined();
    });
  });

  describe('should handle edge cases', () => {
    it('handles empty nameSpaces', () => {
      const nameSpaces = new Map();
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'given_name'],
          values: undefined,
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims,
        claimSets: undefined,
      });

      expect(result).toBeUndefined();
    });

    it('handles claims with age_over_* items', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'age_over_18', true);
      const nameSpaces = new Map([['org.iso.18013.5.1', [tag1, tag2]]]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'given_name'],
          values: undefined,
          intent_to_retain: false,
        },
        {
          path: ['org.iso.18013.5.1', 'age_over_18'],
          values: undefined,
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims,
        claimSets: undefined,
      });

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1, tag2]);
    });

    it('handles multiple namespaces', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'document_number', '123456');
      const nameSpaces = new Map([
        ['org.iso.18013.5.1', [tag1]],
        ['org.iso.18013.5.2', [tag2]],
      ]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'given_name'],
          values: undefined,
          intent_to_retain: false,
        },
        {
          path: ['org.iso.18013.5.2', 'document_number'],
          values: undefined,
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpaces({
        nameSpaces,
        claims,
        claimSets: undefined,
      });

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1]);
      expect(result!.get('org.iso.18013.5.2')).toEqual([tag2]);
    });
  });
});
