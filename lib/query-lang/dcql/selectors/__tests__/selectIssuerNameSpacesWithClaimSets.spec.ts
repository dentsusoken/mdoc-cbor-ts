import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { selectIssuerNameSpacesWithClaimSets } from '../selectIssuerNameSpacesWithClaimSets';
import { EnrichIssuerSignedItemsResult } from '@/query-lang/common/enrichIssuerSignedItems';
import { DcqlClaim } from '../../schemas/DcqlClaim';

describe('selectIssuerNameSpacesWithClaimSets', () => {
  describe('should return selected tags for first successful claim set', () => {
    it('returns tags when first claim set succeeds', () => {
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
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
        {
          id: 'claim2',
          path: ['org.iso.18013.5.1', 'family_name'],
          intent_to_retain: false,
        },
        {
          id: 'claim3',
          path: ['org.iso.18013.5.1', 'age'],
          intent_to_retain: false,
        },
      ];
      const claimSets = [['claim1', 'claim2'], ['claim3']];

      const result = selectIssuerNameSpacesWithClaimSets(
        enrichedIssuerNameSpaces,
        claims,
        claimSets
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1, tag2]);
    });

    it('returns tags when second claim set succeeds after first fails', () => {
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
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
        {
          id: 'claim2',
          path: ['org.iso.18013.5.1', 'family_name'],
          intent_to_retain: false,
        },
        {
          id: 'claim3',
          path: ['org.iso.18013.5.1', 'non_existent'],
          intent_to_retain: false,
        },
      ];
      const claimSets = [
        ['claim3'], // First claim set fails (non_existent element)
        ['claim1', 'claim2'], // Second claim set succeeds
      ];

      const result = selectIssuerNameSpacesWithClaimSets(
        enrichedIssuerNameSpaces,
        claims,
        claimSets
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1, tag2]);
    });

    it('returns tags for claim set with single claim', () => {
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
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
      ];
      const claimSets = [['claim1']];

      const result = selectIssuerNameSpacesWithClaimSets(
        enrichedIssuerNameSpaces,
        claims,
        claimSets
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1]);
    });

    it('returns tags for claim set with multiple namespaces', () => {
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
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
        {
          id: 'claim2',
          path: ['org.iso.18013.5.2', 'document_number'],
          intent_to_retain: false,
        },
      ];
      const claimSets = [['claim1', 'claim2']];

      const result = selectIssuerNameSpacesWithClaimSets(
        enrichedIssuerNameSpaces,
        claims,
        claimSets
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1]);
      expect(result!.get('org.iso.18013.5.2')).toEqual([tag2]);
    });
  });

  describe('should return undefined when all claim sets fail', () => {
    it('returns undefined when all claim sets reference non-existent namespaces', () => {
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
          id: 'claim1',
          path: ['org.iso.18013.5.2', 'given_name'],
          intent_to_retain: false,
        },
        {
          id: 'claim2',
          path: ['org.iso.18013.5.3', 'family_name'],
          intent_to_retain: false,
        },
      ];
      const claimSets = [['claim1'], ['claim2']];

      const result = selectIssuerNameSpacesWithClaimSets(
        enrichedIssuerNameSpaces,
        claims,
        claimSets
      );

      expect(result).toBeUndefined();
    });

    it('returns undefined when all claim sets reference non-existent element identifiers', () => {
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
      const claimSets = [['claim1'], ['claim2']];

      const result = selectIssuerNameSpacesWithClaimSets(
        enrichedIssuerNameSpaces,
        claims,
        claimSets
      );

      expect(result).toBeUndefined();
    });

    it('returns undefined when all claim sets have elementValue not in requestedValues', () => {
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
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          values: ['Jane', 'Bob'],
          intent_to_retain: false,
        },
        {
          id: 'claim2',
          path: ['org.iso.18013.5.1', 'given_name'],
          values: ['Alice'],
          intent_to_retain: false,
        },
      ];
      const claimSets = [['claim1'], ['claim2']];

      const result = selectIssuerNameSpacesWithClaimSets(
        enrichedIssuerNameSpaces,
        claims,
        claimSets
      );

      expect(result).toBeUndefined();
    });
  });

  describe('should throw error when claim ID is not found', () => {
    it('throws error when claim ID in first claim set is not found', () => {
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
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
      ];
      const claimSets = [['non_existent']];

      expect(() => {
        selectIssuerNameSpacesWithClaimSets(
          enrichedIssuerNameSpaces,
          claims,
          claimSets
        );
      }).toThrow('Claim with id non_existent not found');
    });

    it('throws error when claim ID in second claim set is not found', () => {
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
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'non_existent'],
          intent_to_retain: false,
        },
      ];
      const claimSets = [
        ['claim1'], // First claim set fails (non_existent element)
        ['non_existent'], // Second claim set throws error
      ];

      expect(() => {
        selectIssuerNameSpacesWithClaimSets(
          enrichedIssuerNameSpaces,
          claims,
          claimSets
        );
      }).toThrow('Claim with id non_existent not found');
    });

    it('throws error when one of multiple claim IDs in claim set is not found', () => {
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
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
      ];
      const claimSets = [['claim1', 'non_existent']];

      expect(() => {
        selectIssuerNameSpacesWithClaimSets(
          enrichedIssuerNameSpaces,
          claims,
          claimSets
        );
      }).toThrow('Claim with id non_existent not found');
    });
  });

  describe('should handle edge cases', () => {
    it('returns undefined when claimSets array is empty', () => {
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
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
      ];
      const claimSets: string[][] = [];

      const result = selectIssuerNameSpacesWithClaimSets(
        enrichedIssuerNameSpaces,
        claims,
        claimSets
      );

      expect(result).toBeUndefined();
    });

    it('ignores claims without id property', () => {
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
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
        {
          // No id property, will be ignored
          path: ['org.iso.18013.5.1', 'family_name'],
          intent_to_retain: false,
        },
      ];
      const claimSets = [['claim1']];

      const result = selectIssuerNameSpacesWithClaimSets(
        enrichedIssuerNameSpaces,
        claims,
        claimSets
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1]);
    });

    it('handles claim sets with age_over_* claims', () => {
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
            ageOverTrueItems: [{ nn: 18, tag: tag2 }],
            ageOverFalseItems: [],
          },
        ],
      ]);
      const claims: DcqlClaim[] = [
        {
          id: 'claim1',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
        {
          id: 'claim2',
          path: ['org.iso.18013.5.1', 'age_over_18'],
          intent_to_retain: false,
        },
      ];
      const claimSets = [['claim1', 'claim2']];

      const result = selectIssuerNameSpacesWithClaimSets(
        enrichedIssuerNameSpaces,
        claims,
        claimSets
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1, tag2]);
    });

    it('tries next claim set when first fails due to missing namespace', () => {
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
          id: 'claim1',
          path: ['org.iso.18013.5.2', 'given_name'], // Non-existent namespace
          intent_to_retain: false,
        },
        {
          id: 'claim2',
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
      ];
      const claimSets = [
        ['claim1'], // First claim set fails (non-existent namespace)
        ['claim2'], // Second claim set succeeds
      ];

      const result = selectIssuerNameSpacesWithClaimSets(
        enrichedIssuerNameSpaces,
        claims,
        claimSets
      );

      expect(result).not.toBeUndefined();
      expect(result!.get('org.iso.18013.5.1')).toEqual([tag1]);
    });
  });
});
