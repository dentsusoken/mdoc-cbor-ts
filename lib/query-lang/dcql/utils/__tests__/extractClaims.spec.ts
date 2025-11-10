import { describe, it, expect } from 'vitest';
import { extractClaims } from '../extractClaims';
import { DcqlClaim } from '../../schemas';

describe('extractClaims', () => {
  describe('should extract claims successfully', () => {
    it('returns single claim when ids array contains one id', () => {
      const claim: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claimMap = new Map<string, DcqlClaim>([['claim1', claim]]);

      const result = extractClaims(claimMap, ['claim1']);

      expect(result).toEqual([claim]);
    });

    it('returns multiple claims when ids array contains multiple ids', () => {
      const claim1: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claim2: DcqlClaim = {
        id: 'claim2',
        path: ['org.iso.18013.5.1', 'family_name'],
        intent_to_retain: false,
      };
      const claimMap = new Map<string, DcqlClaim>([
        ['claim1', claim1],
        ['claim2', claim2],
      ]);

      const result = extractClaims(claimMap, ['claim1', 'claim2']);

      expect(result).toEqual([claim1, claim2]);
    });

    it('preserves order of ids in returned array', () => {
      const claim1: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claim2: DcqlClaim = {
        id: 'claim2',
        path: ['org.iso.18013.5.1', 'family_name'],
        intent_to_retain: false,
      };
      const claim3: DcqlClaim = {
        id: 'claim3',
        path: ['org.iso.18013.5.1', 'age'],
        intent_to_retain: false,
      };
      const claimMap = new Map<string, DcqlClaim>([
        ['claim1', claim1],
        ['claim2', claim2],
        ['claim3', claim3],
      ]);

      const result = extractClaims(claimMap, ['claim3', 'claim1', 'claim2']);

      expect(result).toEqual([claim3, claim1, claim2]);
    });

    it('extracts claims with values property', () => {
      const claim: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        values: ['John', 'Jane'],
        intent_to_retain: false,
      };
      const claimMap = new Map<string, DcqlClaim>([['claim1', claim]]);

      const result = extractClaims(claimMap, ['claim1']);

      expect(result).toEqual([claim]);
    });

    it('extracts claims with intent_to_retain set to true', () => {
      const claim: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: true,
      };
      const claimMap = new Map<string, DcqlClaim>([['claim1', claim]]);

      const result = extractClaims(claimMap, ['claim1']);

      expect(result).toEqual([claim]);
    });

    it('extracts subset of claims from larger map', () => {
      const claim1: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claim2: DcqlClaim = {
        id: 'claim2',
        path: ['org.iso.18013.5.1', 'family_name'],
        intent_to_retain: false,
      };
      const claim3: DcqlClaim = {
        id: 'claim3',
        path: ['org.iso.18013.5.1', 'age'],
        intent_to_retain: false,
      };
      const claimMap = new Map<string, DcqlClaim>([
        ['claim1', claim1],
        ['claim2', claim2],
        ['claim3', claim3],
      ]);

      const result = extractClaims(claimMap, ['claim1', 'claim3']);

      expect(result).toEqual([claim1, claim3]);
      expect(result.length).toBe(2);
    });
  });

  describe('should throw error when id is not found', () => {
    it('throws error when single id is not found', () => {
      const claimMap = new Map<string, DcqlClaim>();

      expect(() => {
        extractClaims(claimMap, ['non_existent']);
      }).toThrow('Claim with id non_existent not found');
    });

    it('throws error when first id in array is not found', () => {
      const claim: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claimMap = new Map<string, DcqlClaim>([['claim1', claim]]);

      expect(() => {
        extractClaims(claimMap, ['non_existent', 'claim1']);
      }).toThrow('Claim with id non_existent not found');
    });

    it('throws error when middle id in array is not found', () => {
      const claim1: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claim2: DcqlClaim = {
        id: 'claim2',
        path: ['org.iso.18013.5.1', 'family_name'],
        intent_to_retain: false,
      };
      const claimMap = new Map<string, DcqlClaim>([
        ['claim1', claim1],
        ['claim2', claim2],
      ]);

      expect(() => {
        extractClaims(claimMap, ['claim1', 'non_existent', 'claim2']);
      }).toThrow('Claim with id non_existent not found');
    });

    it('throws error when last id in array is not found', () => {
      const claim: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claimMap = new Map<string, DcqlClaim>([['claim1', claim]]);

      expect(() => {
        extractClaims(claimMap, ['claim1', 'non_existent']);
      }).toThrow('Claim with id non_existent not found');
    });

    it('throws error with correct id in error message', () => {
      const claimMap = new Map<string, DcqlClaim>();

      expect(() => {
        extractClaims(claimMap, ['missing_id']);
      }).toThrow('Claim with id missing_id not found');
    });
  });

  describe('should handle edge cases', () => {
    it('returns empty array when ids array is empty', () => {
      const claim: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claimMap = new Map<string, DcqlClaim>([['claim1', claim]]);

      const result = extractClaims(claimMap, []);

      expect(result).toEqual([]);
    });

    it('handles claims with various value types in values array', () => {
      const claim: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'mixed'],
        values: ['string', 123, true, null],
        intent_to_retain: false,
      };
      const claimMap = new Map<string, DcqlClaim>([['claim1', claim]]);

      const result = extractClaims(claimMap, ['claim1']);

      expect(result).toEqual([claim]);
    });

    it('handles duplicate ids in ids array', () => {
      const claim: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claimMap = new Map<string, DcqlClaim>([['claim1', claim]]);

      const result = extractClaims(claimMap, ['claim1', 'claim1']);

      expect(result).toEqual([claim, claim]);
      expect(result.length).toBe(2);
    });

    it('handles large number of ids', () => {
      const claims: DcqlClaim[] = Array.from({ length: 100 }, (_, i) => ({
        id: `claim${i}`,
        path: ['org.iso.18013.5.1', `field${i}`],
        intent_to_retain: false,
      }));
      const claimMap = new Map<string, DcqlClaim>(
        claims.map((claim) => [claim.id!, claim])
      );
      const ids = Array.from({ length: 100 }, (_, i) => `claim${i}`);

      const result = extractClaims(claimMap, ids);

      expect(result.length).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(result[i]).toBe(claims[i]);
      }
    });
  });
});
