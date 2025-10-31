import { describe, it, expect } from 'vitest';
import { extractAgeOverArrays } from '../extractAgeOverArrays';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';

describe('extractAgeOverArrays', () => {
  describe('success cases', () => {
    it('extracts and sorts true/false age_over thresholds, ignoring non-age keys', () => {
      const items = [
        createIssuerSignedItem([
          ['digestID', 1],
          ['random', new Uint8Array([1, 2, 3])],
          ['elementIdentifier', 'age_over_21'],
          ['elementValue', false],
        ]),
        createIssuerSignedItem([
          ['digestID', 2],
          ['random', new Uint8Array([4, 5, 6])],
          ['elementIdentifier', 'age_over_18'],
          ['elementValue', false],
        ]),
        createIssuerSignedItem([
          ['digestID', 3],
          ['random', new Uint8Array([7, 8, 9])],
          ['elementIdentifier', 'age_over_20'],
          ['elementValue', true],
        ]),
        createIssuerSignedItem([
          ['digestID', 4],
          ['random', new Uint8Array([10, 11, 12])],
          ['elementIdentifier', 'age_over_16'],
          ['elementValue', true],
        ]),
        // Non-age key should be ignored
        createIssuerSignedItem([
          ['digestID', 5],
          ['random', new Uint8Array([13, 14, 15])],
          ['elementIdentifier', 'given_name'],
          ['elementValue', 'Alice'],
        ]),
      ];

      const result = extractAgeOverArrays(items);

      expect(result).toEqual({
        ageOverTrueArray: [16, 20],
        ageOverFalseArray: [18, 21],
      });
    });

    it('returns empty arrays when no age_over fields are present', () => {
      const items = [
        createIssuerSignedItem([
          ['digestID', 1],
          ['random', new Uint8Array([1])],
          ['elementIdentifier', 'given_name'],
          ['elementValue', 'Bob'],
        ]),
      ];

      const result = extractAgeOverArrays(items);
      expect(result).toEqual({ ageOverTrueArray: [], ageOverFalseArray: [] });
    });
  });

  describe('edge cases', () => {
    it('handles an empty input array', () => {
      const result = extractAgeOverArrays([]);
      expect(result).toEqual({ ageOverTrueArray: [], ageOverFalseArray: [] });
    });
  });
});
