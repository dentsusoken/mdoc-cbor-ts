import { EnrichedIssuerSignedItem } from '@/query-lang/common/enrichIssuerSignedItems';
import { Tag } from 'cbor-x';

/**
 * Parameters for {@link selectNormalTag}.
 */
interface SelectNormalTagParams {
  /**
   * The requested element identifier to match against.
   */
  requestedIdentifier: string;
  /**
   * Optional array of requested values to match against the element value.
   * If undefined, the tag is returned if the identifier matches.
   * If provided, the tag is returned only if the element value is included in this array.
   */
  requestedValues: unknown[] | undefined;
  /**
   * Array of enriched normal IssuerSignedItems to search through.
   */
  normalItems: EnrichedIssuerSignedItem[];
}

/**
 * Selects the appropriate Tag for a normal (non-age_over_*) element identifier.
 *
 * This function searches for an item in `normalItems` that matches the `requestedIdentifier`.
 * If `requestedValues` is provided, it also checks that the element value is included in the array.
 *
 * @param params - Selection parameters including the requested identifier, optional values, and items array.
 * @returns The Tag for the matching item, or `undefined` if no match is found.
 *
 * @example
 * ```typescript
 * const tag = selectNormalTag({
 *   requestedIdentifier: 'given_name',
 *   requestedValues: undefined,
 *   normalItems: [{ elementIdentifier: 'given_name', elementValue: 'John', tag: tag1 }],
 * });
 * // Returns tag1
 * ```
 *
 * @example
 * ```typescript
 * const tag = selectNormalTag({
 *   requestedIdentifier: 'given_name',
 *   requestedValues: ['John', 'Jane'],
 *   normalItems: [{ elementIdentifier: 'given_name', elementValue: 'John', tag: tag1 }],
 * });
 * // Returns tag1 (elementValue 'John' is in requestedValues)
 * ```
 */
export const selectNormalTag = ({
  requestedIdentifier,
  requestedValues,
  normalItems,
}: SelectNormalTagParams): Tag | undefined => {
  const item = normalItems.find(
    (item) => item.elementIdentifier === requestedIdentifier
  );

  if (!item) {
    return undefined;
  }

  if (!requestedValues) {
    return item.tag;
  }

  return requestedValues.includes(item.elementValue) ? item.tag : undefined;
};
