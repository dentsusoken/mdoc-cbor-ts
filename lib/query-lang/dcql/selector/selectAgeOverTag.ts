import { EnrichedAgeOverIssuerSignedItem } from '@/query-lang/common/enrichIssuerSignedItems';
import { Tag } from 'cbor-x';
import { selectAgeOverTagWithoutValues } from './selectAgeOverTagWithoutValues';
import { selectAgeOverTagWithValues } from './selectAgeOverTagWithValues';

/**
 * Parameters for {@link selectAgeOverTag}.
 */
interface SelectAgeOverTagParams {
  /**
   * The requested age threshold (NN) to match against.
   */
  requestedNn: number;
  /**
   * Optional array containing exactly one boolean value indicating whether to select
   * from `ageOverTrueItems` (true) or `ageOverFalseItems` (false).
   * If undefined, uses a two-step selection strategy to find the best matching item.
   */
  requestedValues: unknown[] | undefined;
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
 * This function delegates to either {@link selectAgeOverTagWithValues} or
 * {@link selectAgeOverTagWithoutValues} depending on whether `requestedValues` is provided.
 *
 * - If `requestedValues` is provided: searches for an exact match where `nn === requestedNn`
 *   in the appropriate array (`ageOverTrueItems` or `ageOverFalseItems`) based on the boolean value.
 * - If `requestedValues` is undefined: uses a two-step selection strategy to find the best matching item
 *   (first from `ageOverTrueItems` where `nn >= requestedNn`, then from `ageOverFalseItems` where `nn <= requestedNn`).
 *
 * @param params - Selection parameters including the requested age threshold, optional boolean value, and sorted item arrays.
 * @returns The Tag for the selected age_over_* item, or `undefined` if no match is found.
 * @throws {Error} If `requestedValues` is provided but is not an array of length 1.
 * @throws {Error} If `requestedValues` is provided but `requestedValues[0]` is not a boolean.
 *
 * @example
 * ```typescript
 * // Example 1: Without requestedValues (uses two-step selection strategy)
 * const tag1 = selectAgeOverTag({
 *   requestedNn: 20,
 *   requestedValues: undefined,
 *   ageOverTrueItems: [{ nn: 18, tag: tag1 }, { nn: 21, tag: tag2 }], // sorted ascending
 *   ageOverFalseItems: [{ nn: 23, tag: tag3 }, { nn: 22, tag: tag4 }], // sorted descending
 * });
 * // Returns tag2 (age_over_21 with value true, as 21 >= 20)
 * ```
 *
 * @example
 * ```typescript
 * // Example 2: With requestedValues (exact match)
 * const tag2 = selectAgeOverTag({
 *   requestedNn: 18,
 *   requestedValues: [true],
 *   ageOverTrueItems: [{ nn: 18, tag: tag1 }, { nn: 21, tag: tag2 }],
 *   ageOverFalseItems: [{ nn: 24, tag: tag3 }],
 * });
 * // Returns tag1 (age_over_18 with value true, as nn === 18)
 * ```
 */
export const selectAgeOverTag = ({
  requestedNn,
  requestedValues,
  ageOverTrueItems,
  ageOverFalseItems,
}: SelectAgeOverTagParams): Tag | undefined => {
  if (requestedValues) {
    return selectAgeOverTagWithValues({
      requestedNn,
      requestedValues,
      ageOverTrueItems,
      ageOverFalseItems,
    });
  }

  return selectAgeOverTagWithoutValues({
    requestedNn,
    ageOverTrueItems,
    ageOverFalseItems,
  });
};
