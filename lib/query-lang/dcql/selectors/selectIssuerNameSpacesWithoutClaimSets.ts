import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { DcqlClaim } from '../schemas';
import { Tag } from 'cbor-x';
import { EnrichIssuerSignedItemsResult } from '@/query-lang/common/enrichIssuerSignedItems';
import { selectTag } from './selectTag';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';

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
 * @param enrichedIssuerNameSpaces - Map from namespace string to enriched issuer signed items.
 *   Each entry contains normal items, age_over_* true items, and age_over_* false items
 *   that have been pre-processed and sorted for efficient selection.
 * @param claims - Array of DCQL claims to process. Each claim contains a path (namespace, elementIdentifier)
 *   and optional requested values to match against.
 * @returns A Map from namespace string to array of selected Tag(24) objects.
 * @throws {ErrorCodeError} If any claim's path does not have exactly two elements (namespace and element identifier).
 *   Error code: {@link MdocErrorCode.ClaimPathInvalid}
 * @throws {ErrorCodeError} If any claim references a namespace that doesn't exist in `enrichedIssuerNameSpaces`.
 *   Error code: {@link MdocErrorCode.ClaimNameSpaceMissing}
 * @throws {ErrorCodeError} If any claim's element identifier cannot be matched (no corresponding tag found).
 *   Error code: {@link MdocErrorCode.ClaimDataElementMissing}
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
 * const result = selectIssuerNameSpacesWithoutClaimSets(
 *   enrichedIssuerNameSpaces,
 *   claims
 * );
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
 * const result = selectIssuerNameSpacesWithoutClaimSets(
 *   enrichedIssuerNameSpaces,
 *   claims
 * );
 * // Returns: Map([['org.iso.18013.5.1', [tag2]]]) // tag2 is age_over_21 (21 >= 20)
 * ```
 */
export const selectIssuerNameSpacesWithoutClaimSets = (
  enrichedIssuerNameSpaces: Map<string, EnrichIssuerSignedItemsResult>,
  claims: DcqlClaim[]
): IssuerNameSpaces => {
  const result = new Map<string, Tag[]>();

  for (const claim of claims) {
    if (claim.path.length !== 2) {
      throw new ErrorCodeError(
        'Claim path must have exactly two elements.',
        MdocErrorCode.ClaimPathInvalid
      );
    }

    const [nameSpace, elementIdentifier] = claim.path;
    const enriched = enrichedIssuerNameSpaces.get(nameSpace);

    if (!enriched) {
      throw new ErrorCodeError(
        'Claim name space is missing.',
        MdocErrorCode.ClaimNameSpaceMissing
      );
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
      throw new ErrorCodeError(
        'Claim data element is missing.',
        MdocErrorCode.ClaimDataElementMissing
      );
    }

    const selectedTags = result.get(nameSpace) || [];
    selectedTags.push(tag);
    result.set(nameSpace, selectedTags);
  }

  return result;
};
