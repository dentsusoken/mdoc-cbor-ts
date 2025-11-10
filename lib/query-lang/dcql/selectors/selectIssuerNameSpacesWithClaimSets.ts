import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { DcqlClaim } from '../schemas';
import { EnrichIssuerSignedItemsResult } from '@/query-lang/common/enrichIssuerSignedItems';
import { DcqlClaimSet } from '../schemas/DcqlClaimSet';
import { toClaimMap } from '../utils/toClaimMap';
import { extractClaims } from '../utils/extractClaims';
import { selectIssuerNameSpacesWithoutClaimSets } from './selectIssuerNameSpacesWithoutClaimSets';

/**
 * Selects issuer-signed name spaces based on DCQL claim sets.
 *
 * This function processes multiple claim sets and attempts to select issuer-signed
 * name spaces for each claim set in order. It returns the first successful result,
 * or `undefined` if none of the claim sets can be satisfied.
 *
 * For each claim set:
 * 1. Extracts the claim objects corresponding to the claim IDs in the claim set
 *    using {@link extractClaims}
 * 2. Attempts to select issuer-signed name spaces for those claims using
 *    {@link selectIssuerNameSpacesWithoutClaimSets}
 * 3. If successful, returns the result immediately
 * 4. If unsuccessful, continues to the next claim set
 *
 * This is useful when you have multiple alternative claim sets and want to find
 * the first one that can be satisfied with the available issuer-signed data.
 *
 * The function returns `undefined` if:
 * - All claim sets fail to be satisfied (e.g., any claim in a claim set references
 *   a namespace that doesn't exist, or any claim's element identifier cannot be matched)
 *
 * @param enrichedIssuerNameSpaces - Map from namespace string to enriched issuer signed items.
 *   Each entry contains normal items, age_over_* true items, and age_over_* false items
 *   that have been pre-processed and sorted for efficient selection.
 * @param claims - Array of DCQL claims. Each claim must have an `id` property to be
 *   referenced by claim sets. Claims without an `id` are ignored.
 * @param claimSets - Array of claim sets to process in order. Each claim set is an array
 *   of claim IDs that should be satisfied together.
 * @returns A Map from namespace string to array of selected Tag(24) objects for the first
 *   successfully satisfied claim set, or `undefined` if no claim set can be satisfied.
 * @throws {Error} If any claim ID in a claim set is not found in the claims array.
 *   The error is thrown by {@link extractClaims} with the message:
 *   `"Claim with id {id} not found"`.
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
 *   { id: 'claim1', path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *   { id: 'claim2', path: ['org.iso.18013.5.1', 'family_name'], intent_to_retain: false },
 *   { id: 'claim3', path: ['org.iso.18013.5.1', 'age'], intent_to_retain: false },
 * ];
 *
 * const claimSets = [
 *   ['claim1', 'claim2'], // First claim set: given_name and family_name
 *   ['claim3'],          // Second claim set: age (fallback)
 * ];
 *
 * const result = selectIssuerNameSpacesWithClaimSets(
 *   enrichedIssuerNameSpaces,
 *   claims,
 *   claimSets
 * );
 * // Returns: Map([['org.iso.18013.5.1', [tag1, tag2]]])
 * // (First claim set is satisfied, so it returns immediately)
 * ```
 *
 * @example
 * ```typescript
 * // If first claim set fails, tries the next one
 * const claimSets = [
 *   ['claim3'],          // First claim set: age (might fail if age not available)
 *   ['claim1', 'claim2'], // Second claim set: given_name and family_name (fallback)
 * ];
 *
 * const result = selectIssuerNameSpacesWithClaimSets(
 *   enrichedIssuerNameSpaces,
 *   claims,
 *   claimSets
 * );
 * // Returns: Map([['org.iso.18013.5.1', [tag1, tag2]]])
 * // (First claim set fails, so tries second one and succeeds)
 * ```
 */
export const selectIssuerNameSpacesWithClaimSets = (
  enrichedIssuerNameSpaces: Map<string, EnrichIssuerSignedItemsResult>,
  claims: DcqlClaim[],
  claimSets: DcqlClaimSet[]
): IssuerNameSpaces | undefined => {
  const claimMap = toClaimMap(claims);

  for (const claimSet of claimSets) {
    const innerClaims = extractClaims(claimMap, claimSet);
    const nameSpaces = selectIssuerNameSpacesWithoutClaimSets(
      enrichedIssuerNameSpaces,
      innerClaims
    );

    if (nameSpaces) {
      return nameSpaces;
    }
  }

  return undefined;
};
