import { EnrichedAgeOverIssuerSignedItem } from '@/query-lang/common/enrichIssuerSignedItems';
import { Tag } from 'cbor-x';

/**
 * Parameters for {@link selectAgeOverTagWithValues}.
 */
interface SelectAgeOverTagWithValuesParams {
  /**
   * The requested age threshold (NN) to match against.
   */
  requestedNn: number;
  /**
   * Array containing exactly one boolean value indicating whether to select
   * from `ageOverTrueItems` (true) or `ageOverFalseItems` (false).
   */
  requestedValues: unknown[];
  /**
   * Array of age_over_* items where the value is true.
   * Must be sorted in ascending order by nn value.
   */
  ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[];
  /**
   * Array of age_over_* items where the value is false.
   * Must be sorted in descending order by nn value.
   */
  ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[];
}

/**
 * Selects the appropriate age_over_* Tag based on the requested age threshold and boolean value.
 *
 * This function searches for an age_over_* item where `nn === requestedNn` in either
 * `ageOverTrueItems` or `ageOverFalseItems` depending on the boolean value in `requestedValues`.
 *
 * @param params - Selection parameters including the requested age threshold, boolean value, and sorted item arrays.
 * @returns The Tag for the matching age_over_* item, or `undefined` if no match is found.
 * @throws {Error} If `requestedValues` is not an array of length 1.
 * @throws {Error} If `requestedValues[0]` is not a boolean.
 *
 * @example
 * ```typescript
 * // Example 1: Selecting from ageOverTrueItems with value true
 * const tag1 = selectAgeOverTagWithValues({
 *   requestedNn: 18,
 *   requestedValues: [true],
 *   ageOverTrueItems: [{ nn: 18, tag: tag1 }, { nn: 21, tag: tag2 }],
 *   ageOverFalseItems: [{ nn: 24, tag: tag3 }],
 * });
 * // Returns tag1 (age_over_18 with value true, as nn === 18)
 * ```
 *
 * @example
 * ```typescript
 * // Example 2: Selecting from ageOverFalseItems with value false
 * const tag2 = selectAgeOverTagWithValues({
 *   requestedNn: 24,
 *   requestedValues: [false],
 *   ageOverTrueItems: [{ nn: 18, tag: tag1 }],
 *   ageOverFalseItems: [{ nn: 24, tag: tag3 }, { nn: 22, tag: tag4 }],
 * });
 * // Returns tag3 (age_over_24 with value false, as nn === 24)
 * ```
 */
export const selectAgeOverTagWithValues = ({
  requestedNn,
  requestedValues,
  ageOverTrueItems,
  ageOverFalseItems,
}: SelectAgeOverTagWithValuesParams): Tag | undefined => {
  if (requestedValues.length !== 1) {
    throw new Error('requestedValues must be an array of length 1');
  }

  if (typeof requestedValues[0] !== 'boolean') {
    throw new Error('requestedValues must be an array of booleans');
  }

  if (requestedValues[0] === true) {
    return ageOverTrueItems.find((item) => item.nn === requestedNn)?.tag;
  }

  return ageOverFalseItems.find((item) => item.nn === requestedNn)?.tag;
};
