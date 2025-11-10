import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { selectIssuerNameSpacesWithoutClaimSets } from '../selectIssuerNameSpacesWithoutClaimSets';
import { EnrichIssuerSignedItemsResult } from '@/query-lang/common/enrichIssuerSignedItems';
import { DcqlClaim } from '../../schemas';

describe('selectIssuerNameSpacesWithoutClaimSets', () => {
  describe('should return selected tags for normal items', () => {
    it('returns tags for single claim in single namespace', () => {
      const tag1 = new Tag('value1', 24);
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [
              {
                elementIdentifier: 'given_name',
                elementValue: 'John',
                tag: tag1,
              },
            ],
            ageOverTrueItems: [],
            ageOverFalseItems: [],
          },
        ],
      ]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'given_name'],
          values: undefined,
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1]);
    });

    it('returns tags for multiple claims in same namespace', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [
              {
                elementIdentifier: 'given_name',
                elementValue: 'John',
                tag: tag1,
              },
              {
                elementIdentifier: 'family_name',
                elementValue: 'Doe',
                tag: tag2,
              },
            ],
            ageOverTrueItems: [],
            ageOverFalseItems: [],
          },
        ],
      ]);
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

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1, tag2]);
    });

    it('returns tags for claims in different namespaces', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [
              {
                elementIdentifier: 'given_name',
                elementValue: 'John',
                tag: tag1,
              },
            ],
            ageOverTrueItems: [],
            ageOverFalseItems: [],
          },
        ],
        [
          'org.iso.18013.5.2',
          {
            normalItems: [
              {
                elementIdentifier: 'document_number',
                elementValue: '123456',
                tag: tag2,
              },
            ],
            ageOverTrueItems: [],
            ageOverFalseItems: [],
          },
        ],
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

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1]);
      expect(result!.get('org.iso.18013.5.2')).toEqual([tag2]);
    });

    it('returns tag when elementValue matches requestedValues', () => {
      const tag1 = new Tag('value1', 24);
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [
              {
                elementIdentifier: 'given_name',
                elementValue: 'John',
                tag: tag1,
              },
            ],
            ageOverTrueItems: [],
            ageOverFalseItems: [],
          },
        ],
      ]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'given_name'],
          values: ['John', 'Jane'],
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1]);
    });
  });

  describe('should return selected tags for age_over_* items', () => {
    it('returns tag from ageOverTrueItems when requestedValues is undefined', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [],
            ageOverTrueItems: [
              { nn: 18, tag: tag1 },
              { nn: 21, tag: tag2 },
            ],
            ageOverFalseItems: [],
          },
        ],
      ]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'age_over_20'],
          values: undefined,
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag2]);
    });

    it('returns tag from ageOverTrueItems when requestedValues is [true]', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [],
            ageOverTrueItems: [
              { nn: 18, tag: tag1 },
              { nn: 21, tag: tag2 },
            ],
            ageOverFalseItems: [],
          },
        ],
      ]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'age_over_18'],
          values: [true],
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1]);
    });

    it('returns tag from ageOverFalseItems when requestedValues is [false]', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [],
            ageOverTrueItems: [],
            ageOverFalseItems: [
              { nn: 24, tag: tag1 },
              { nn: 22, tag: tag2 },
            ],
          },
        ],
      ]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'age_over_24'],
          values: [false],
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1]);
    });
  });

  describe('should return undefined when namespace does not exist', () => {
    it('returns undefined when claim references non-existent namespace', () => {
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [
              {
                elementIdentifier: 'given_name',
                elementValue: 'John',
                tag: new Tag('value1', 24),
              },
            ],
            ageOverTrueItems: [],
            ageOverFalseItems: [],
          },
        ],
      ]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.2', 'given_name'],
          values: undefined,
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).toBeUndefined();
    });
  });

  describe('should return undefined when element identifier does not match', () => {
    it('returns undefined when requestedIdentifier does not exist', () => {
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [
              {
                elementIdentifier: 'given_name',
                elementValue: 'John',
                tag: new Tag('value1', 24),
              },
            ],
            ageOverTrueItems: [],
            ageOverFalseItems: [],
          },
        ],
      ]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'family_name'],
          values: undefined,
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).toBeUndefined();
    });

    it('returns undefined when elementValue is not in requestedValues', () => {
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [
              {
                elementIdentifier: 'given_name',
                elementValue: 'John',
                tag: new Tag('value1', 24),
              },
            ],
            ageOverTrueItems: [],
            ageOverFalseItems: [],
          },
        ],
      ]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'given_name'],
          values: ['Jane', 'Bob'],
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).toBeUndefined();
    });
  });

  describe('should handle edge cases', () => {
    it('returns empty map when claims array is empty', () => {
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [
              {
                elementIdentifier: 'given_name',
                elementValue: 'John',
                tag: new Tag('value1', 24),
              },
            ],
            ageOverTrueItems: [],
            ageOverFalseItems: [],
          },
        ],
      ]);
      const claims: DcqlClaim[] = [];

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(0);
    });

    it('handles multiple claims with mixed normal and age_over_* items', () => {
      const tag1 = new Tag('value1', 24);
      const tag2 = new Tag('value2', 24);
      const tag3 = new Tag('value3', 24);
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [
              {
                elementIdentifier: 'given_name',
                elementValue: 'John',
                tag: tag1,
              },
            ],
            ageOverTrueItems: [
              { nn: 18, tag: tag2 },
              { nn: 21, tag: tag3 },
            ],
            ageOverFalseItems: [],
          },
        ],
      ]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'given_name'],
          values: undefined,
          intent_to_retain: false,
        },
        {
          path: ['org.iso.18013.5.1', 'age_over_20'],
          values: undefined,
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1, tag3]);
    });

    it('returns undefined when first claim fails but second would succeed', () => {
      const tag1 = new Tag('value1', 24);
      const enrichedIssuerNameSpaces = new Map<
        string,
        EnrichIssuerSignedItemsResult
      >([
        [
          'org.iso.18013.5.1',
          {
            normalItems: [
              {
                elementIdentifier: 'given_name',
                elementValue: 'John',
                tag: tag1,
              },
            ],
            ageOverTrueItems: [],
            ageOverFalseItems: [],
          },
        ],
      ]);
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'non_existent'],
          values: undefined,
          intent_to_retain: false,
        },
        {
          path: ['org.iso.18013.5.1', 'given_name'],
          values: undefined,
          intent_to_retain: false,
        },
      ];

      const result = selectIssuerNameSpacesWithoutClaimSets(
        enrichedIssuerNameSpaces,
        claims
      );

      expect(result).toBeUndefined();
    });
  });
});
