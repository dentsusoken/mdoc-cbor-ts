import { EnrichedAgeOverIssuerSignedItem } from '@/query-lang/common/enrichIssuerSignedItems';
import { Tag } from 'cbor-x';

/**
 * Parameters for {@link selectAgeOverTagWithoutValues}.
 */
interface SelectAgeOverTagWithoutValuesParams {
  /**
   * The requested age threshold to match against.
   */
  requestedNn: number;
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
 * Selects the appropriate age_over_* Tag based on the requested age threshold.
 *
 * This function implements a two-step selection strategy:
 * 1. First, searches for an age_over_* item with value `true` where `nn >= requestedNn`.
 *    Since `ageOverTrueItems` is sorted in ascending order by `nn`, the first matching item
 *    will be the smallest age threshold that satisfies the requirement.
 * 2. If no matching true item is found, searches for an age_over_* item with value `false`
 *    where `nn <= requestedNn`. Since `ageOverFalseItems` is sorted in descending order
 *    by `nn`, the first matching item will be the largest age threshold that satisfies the requirement.
 *
 * @param params - Selection parameters including the requested age and sorted item arrays.
 * @returns The Tag for the selected age_over_* item, or `undefined` if no match is found.
 *
 * @example
 * ```typescript
 * // Example 1: Selecting from ageOverTrueItems
 * const tag1 = selectAgeOverTag({
 *   requestedNn: 20,
 *   ageOverTrueItems: [{ nn: 18, tag: tag1 }, { nn: 21, tag: tag2 }], // sorted ascending
 *   ageOverFalseItems: [{ nn: 23, tag: tag3 }, { nn: 22, tag: tag4 }], // sorted descending
 * });
 * // Returns tag2 (age_over_21 with value true, as 21 >= 20)
 * ```
 *
 * @example
 * ```typescript
 * // Example 2: Selecting from ageOverFalseItems when no matching true item exists
 * const tag2 = selectAgeOverTag({
 *   requestedNn: 25,
 *   ageOverTrueItems: [{ nn: 18, tag: tag1 }, { nn: 21, tag: tag2 }], // sorted ascending
 *   ageOverFalseItems: [{ nn: 24, tag: tag3 }, { nn: 22, tag: tag4 }], // sorted descending
 * });
 * // Returns tag3 (age_over_24 with value false, as 24 <= 25 and no true item >= 25 exists)
 * ```
 */
export const selectAgeOverTagWithoutValues = ({
  requestedNn,
  ageOverTrueItems,
  ageOverFalseItems,
}: SelectAgeOverTagWithoutValuesParams): Tag | undefined => {
  const ageOverTrueItem = ageOverTrueItems.find(
    (item) => item.nn >= requestedNn
  );

  if (ageOverTrueItem) {
    return ageOverTrueItem.tag;
  }

  return ageOverFalseItems.find((item) => item.nn <= requestedNn)?.tag;
};
