import {
  EnrichedAgeOverIssuerSignedItem,
  EnrichedIssuerSignedItem,
} from '@/query-lang/common/enrichIssuerSignedItems';
import { extractAgeOverNn } from '@/query-lang/common/extractAgeOverNn';
import { Tag } from 'cbor-x';
import { selectAgeOverTag } from './selectAgeOverTag';
import { selectNormalTag } from './selectNormalTag';

/**
 * Parameters for {@link selectTag}.
 */
interface SelectTagParams {
  /**
   * The requested element identifier to match against.
   * If it starts with "age_over_", the function will delegate to age_over_* selection logic.
   */
  requestedIdentifier: string;
  /**
   * Optional array of requested values to match against the element value.
   * For normal items: the tag is returned only if the element value is included in this array.
   * For age_over_* items: must contain exactly one boolean value indicating whether to select
   * from `ageOverTrueItems` (true) or `ageOverFalseItems` (false).
   * If undefined, uses different selection strategies depending on the identifier type.
   */
  requestedValues: unknown[] | undefined;
  /**
   * Array of enriched normal IssuerSignedItems to search through.
   * Used when `requestedIdentifier` does not start with "age_over_".
   */
  normalItems: EnrichedIssuerSignedItem[];
  /**
   * Array of age_over_* items where the value is true.
   * Must be sorted in ascending order by nn value.
   * Used when `requestedIdentifier` starts with "age_over_".
   */
  ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[];
  /**
   * Array of age_over_* items where the value is false.
   * Must be sorted in descending order by nn value.
   * Used when `requestedIdentifier` starts with "age_over_".
   */
  ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[];
}

/**
 * Selects the appropriate Tag based on the requested element identifier.
 *
 * This function acts as a dispatcher that routes to either {@link selectAgeOverTag} or
 * {@link selectNormalTag} depending on whether the `requestedIdentifier` starts with "age_over_".
 *
 * - If `requestedIdentifier` starts with "age_over_": delegates to {@link selectAgeOverTag}
 *   to handle age threshold selection logic.
 * - Otherwise: delegates to {@link selectNormalTag} to handle normal element identifier matching.
 *
 * @param params - Selection parameters including the requested identifier, optional values, and item arrays.
 * @returns The Tag for the selected item, or `undefined` if no match is found.
 *
 * @example
 * ```typescript
 * // Example 1: Normal element identifier
 * const tag = selectTag({
 *   requestedIdentifier: 'given_name',
 *   requestedValues: ['John'],
 *   normalItems: [{ elementIdentifier: 'given_name', elementValue: 'John', tag: tag1 }],
 *   ageOverTrueItems: [],
 *   ageOverFalseItems: [],
 * });
 * // Returns tag1
 * ```
 *
 * @example
 * ```typescript
 * // Example 2: Age_over_* identifier
 * const tag = selectTag({
 *   requestedIdentifier: 'age_over_18',
 *   requestedValues: undefined,
 *   normalItems: [],
 *   ageOverTrueItems: [{ nn: 18, tag: tag1 }, { nn: 21, tag: tag2 }],
 *   ageOverFalseItems: [{ nn: 17, tag: tag3 }],
 * });
 * // Returns tag1 (age_over_18 with value true, as 18 >= 18)
 * ```
 */
export const selectTag = ({
  requestedIdentifier,
  requestedValues,
  normalItems,
  ageOverTrueItems,
  ageOverFalseItems,
}: SelectTagParams): Tag | undefined => {
  if (requestedIdentifier.startsWith('age_over_')) {
    return selectAgeOverTag({
      requestedNn: extractAgeOverNn(requestedIdentifier),
      requestedValues,
      ageOverTrueItems,
      ageOverFalseItems,
    });
  }

  return selectNormalTag({
    requestedIdentifier,
    requestedValues,
    normalItems,
  });
};
