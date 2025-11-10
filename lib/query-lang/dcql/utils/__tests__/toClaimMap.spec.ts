import { describe, it, expect } from 'vitest';
import { toClaimMap } from '../toClaimMap';
import { DcqlClaim } from '../../schemas';

describe('toClaimMap', () => {
  describe('should return empty map for empty array', () => {
    it('returns empty map when claims array is empty', () => {
      const claims: DcqlClaim[] = [];

      const result = toClaimMap(claims);

      expect(result.size).toBe(0);
    });
  });

  describe('should include claims with id property', () => {
    it('returns map with single claim when array contains one claim with id', () => {
      const claim: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claims: DcqlClaim[] = [claim];

      const result = toClaimMap(claims);

      expect(result.size).toBe(1);
      expect(result.get('claim1')).toBe(claim);
    });

    it('returns map with multiple claims when array contains multiple claims with ids', () => {
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
      const claims: DcqlClaim[] = [claim1, claim2];

      const result = toClaimMap(claims);

      expect(result.size).toBe(2);
      expect(result.get('claim1')).toBe(claim1);
      expect(result.get('claim2')).toBe(claim2);
    });

    it('includes claims with values property', () => {
      const claim: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        values: ['John', 'Jane'],
        intent_to_retain: false,
      };
      const claims: DcqlClaim[] = [claim];

      const result = toClaimMap(claims);

      expect(result.size).toBe(1);
      expect(result.get('claim1')).toBe(claim);
    });

    it('includes claims with intent_to_retain set to true', () => {
      const claim: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: true,
      };
      const claims: DcqlClaim[] = [claim];

      const result = toClaimMap(claims);

      expect(result.size).toBe(1);
      expect(result.get('claim1')).toBe(claim);
    });
  });

  describe('should skip claims without id property', () => {
    it('returns empty map when all claims lack id property', () => {
      const claims: DcqlClaim[] = [
        {
          path: ['org.iso.18013.5.1', 'given_name'],
          intent_to_retain: false,
        },
        {
          path: ['org.iso.18013.5.1', 'family_name'],
          intent_to_retain: false,
        },
      ];

      const result = toClaimMap(claims);

      expect(result.size).toBe(0);
    });

    it('skips claims without id and includes claims with id', () => {
      const claim1: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claim2: DcqlClaim = {
        path: ['org.iso.18013.5.1', 'family_name'],
        intent_to_retain: false,
      };
      const claim3: DcqlClaim = {
        id: 'claim3',
        path: ['org.iso.18013.5.1', 'age'],
        intent_to_retain: false,
      };
      const claims: DcqlClaim[] = [claim1, claim2, claim3];

      const result = toClaimMap(claims);

      expect(result.size).toBe(2);
      expect(result.get('claim1')).toBe(claim1);
      expect(result.get('claim3')).toBe(claim3);
      expect(result.has('claim2')).toBe(false);
    });
  });

  describe('should handle duplicate ids', () => {
    it('overwrites previous claim when multiple claims have the same id', () => {
      const claim1: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claim2: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'family_name'],
        intent_to_retain: false,
      };
      const claims: DcqlClaim[] = [claim1, claim2];

      const result = toClaimMap(claims);

      expect(result.size).toBe(1);
      expect(result.get('claim1')).toBe(claim2); // Last one wins
    });
  });

  describe('should handle edge cases', () => {
    it('handles claims with empty string id', () => {
      const claim: DcqlClaim = {
        id: '',
        path: ['org.iso.18013.5.1', 'given_name'],
        intent_to_retain: false,
      };
      const claims: DcqlClaim[] = [claim];

      const result = toClaimMap(claims);

      // Empty string is falsy, so it should be skipped
      expect(result.size).toBe(0);
    });

    it('handles claims with various value types in values array', () => {
      const claim: DcqlClaim = {
        id: 'claim1',
        path: ['org.iso.18013.5.1', 'mixed'],
        values: ['string', 123, true, null],
        intent_to_retain: false,
      };
      const claims: DcqlClaim[] = [claim];

      const result = toClaimMap(claims);

      expect(result.size).toBe(1);
      expect(result.get('claim1')).toBe(claim);
    });

    it('handles large number of claims', () => {
      const claims: DcqlClaim[] = Array.from({ length: 100 }, (_, i) => ({
        id: `claim${i}`,
        path: ['org.iso.18013.5.1', `field${i}`],
        intent_to_retain: false,
      }));

      const result = toClaimMap(claims);

      expect(result.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(result.get(`claim${i}`)).toBe(claims[i]);
      }
    });
  });
});
