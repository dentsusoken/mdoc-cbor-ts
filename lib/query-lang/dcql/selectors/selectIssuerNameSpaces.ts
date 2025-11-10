import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { DcqlClaim } from '../schemas';
import { Tag } from 'cbor-x';
import { EnrichIssuerSignedItemsResult } from '@/query-lang/common/enrichIssuerSignedItems';
import { selectTag } from './selectTag';

/**
 * Selects issuer-signed name spaces based on DCQL claims.
 *
 * This function processes an array of DCQL claims and selects the corresponding
 * issuer-signed item tags from the enriched issuer name spaces. For each claim:
 * 1. Extracts the namespace and element identifier from the claim's path
 * 2. Looks up the enriched issuer signed items for that namespace
 * 3. Uses {@link selectTag} to find the matching tag based on the element identifier
 *    and optional requested values
 * 4. Groups all selected tags by namespace
 *
 * The function returns `undefined` if:
 * - Any claim references a namespace that doesn't exist in `enrichedIssuerNameSpaces`
 * - Any claim's element identifier cannot be matched (no corresponding tag found)
 *
 * @param enrichedIssuerNameSpaces - Map from namespace string to enriched issuer signed items.
 *   Each entry contains normal items, age_over_* true items, and age_over_* false items
 *   that have been pre-processed and sorted for efficient selection.
 * @param claims - Array of DCQL claims to process. Each claim contains a path (namespace, elementIdentifier)
 *   and optional requested values to match against.
 * @returns A Map from namespace string to array of selected Tag(24) objects, or `undefined`
 *   if any claim cannot be satisfied.
 *
 * @example
 * ```typescript
 * const enrichedIssuerNameSpaces = new Map([
 *   ['org.iso.18013.5.1', {
 *     normalItems: [
 *       { elementIdentifier: 'given_name', elementValue: 'John', tag: tag1 },
 *       { elementIdentifier: 'family_name', elementValue: 'Doe', tag: tag2 },
 *     ],
 *     ageOverTrueItems: [],
 *     ageOverFalseItems: [],
 *   }],
 * ]);
 *
 * const claims = [
 *   { path: ['org.iso.18013.5.1', 'given_name'], values: undefined },
 *   { path: ['org.iso.18013.5.1', 'family_name'], values: ['Doe'] },
 * ];
 *
 * const result = selectIssuerNameSpaces(enrichedIssuerNameSpaces, claims);
 * // Returns: Map([['org.iso.18013.5.1', [tag1, tag2]]])
 * ```
 *
 * @example
 * ```typescript
 * // Example with age_over_* claim
 * const enrichedIssuerNameSpaces = new Map([
 *   ['org.iso.18013.5.1', {
 *     normalItems: [],
 *     ageOverTrueItems: [{ nn: 18, tag: tag1 }, { nn: 21, tag: tag2 }],
 *     ageOverFalseItems: [],
 *   }],
 * ]);
 *
 * const claims = [
 *   { path: ['org.iso.18013.5.1', 'age_over_20'], values: undefined },
 * ];
 *
 * const result = selectIssuerNameSpaces(enrichedIssuerNameSpaces, claims);
 * // Returns: Map([['org.iso.18013.5.1', [tag2]]]) // tag2 is age_over_21 (21 >= 20)
 * ```
 */
export const selectIssuerNameSpaces = (
  enrichedIssuerNameSpaces: Map<string, EnrichIssuerSignedItemsResult>,
  claims: DcqlClaim[]
): IssuerNameSpaces | undefined => {
  const result = new Map<string, Tag[]>();

  for (const claim of claims) {
    const [nameSpace, elementIdentifier] = claim.path;
    const enriched = enrichedIssuerNameSpaces.get(nameSpace);

    if (!enriched) {
      return undefined;
    }

    const { normalItems, ageOverTrueItems, ageOverFalseItems } = enriched;

    const tag = selectTag({
      requestedIdentifier: elementIdentifier,
      requestedValues: claim.values,
      normalItems,
      ageOverTrueItems,
      ageOverFalseItems,
    });

    if (!tag) {
      return undefined;
    }

    const selectedTags = result.get(nameSpace) || [];
    selectedTags.push(tag);
    result.set(nameSpace, selectedTags);
  }

  return result;
};
