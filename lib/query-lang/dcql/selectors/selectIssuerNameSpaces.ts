import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { DcqlClaim } from '../schemas/DcqlClaim';
import { DcqlClaimSet } from '../schemas/DcqlClaimSet';
import { MdocErrorCode } from '@/mdoc/types';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { enrichIssuerNameSpaces } from '@/query-lang/common/enrichIssuerNameSpaces';
import { selectIssuerNameSpacesWithoutClaimSets } from './selectIssuerNameSpacesWithoutClaimSets';
import { selectIssuerNameSpacesWithClaimSets } from './selectIssuerNameSpacesWithClaimSets';
import { getErrorMessage } from '@/utils/getErrorMessage';

/**
 * Parameters for {@link selectIssuerNameSpaces}.
 */
interface SelectIssuerNameSpacesParams {
  /**
   * Map from namespace string to array of Tag(24) values containing IssuerSignedItem maps.
   */
  nameSpaces: IssuerNameSpaces;
  /**
   * Optional array of DCQL claims. If provided, must contain at least one claim.
   * Each claim must have an `id` property if `claimSets` is also provided.
   */
  claims: DcqlClaim[] | undefined;
  /**
   * Optional array of claim sets. If provided, `claims` must also be provided.
   * Each claim set is an array of claim IDs that should be satisfied together.
   */
  claimSets: DcqlClaimSet[] | undefined;
}

/**
 * Selects issuer-signed name spaces based on DCQL claims and claim sets.
 *
 * This function acts as an orchestrator that routes to the appropriate selection function
 * based on whether `claims` and `claimSets` are provided:
 *
 * - If `claims` is `undefined`: returns an empty Map (no claims to process)
 * - If `claimSets` is provided: uses {@link selectIssuerNameSpacesWithClaimSets} to process
 *   multiple claim sets and return the first successful result
 * - Otherwise: uses {@link selectIssuerNameSpacesWithoutClaimSets} to process all claims directly
 *
 * The function enriches the issuer name spaces using {@link enrichIssuerNameSpaces} before
 * processing, which organizes the data for efficient selection.
 *
 * The function returns `undefined` if:
 * - All claims cannot be satisfied (when `claimSets` is not provided)
 * - All claim sets fail to be satisfied (when `claimSets` is provided)
 * - An error occurs during selection (e.g., `claimSets` is provided but `claims` is `undefined`,
 *   or any claim ID in a claim set is not found). In such cases, the error is logged and
 *   the function returns `undefined` instead of throwing.
 *
 * @param params - Selection parameters including name spaces, claims, and optional claim sets.
 * @returns A Map from namespace string to array of selected Tag(24) objects, or `undefined`
 *   if no claims/claim sets can be satisfied, or an empty Map if `claims` is `undefined`.
 *
 * @example
 * ```typescript
 * // Example 1: Process claims without claim sets
 * const nameSpaces: IssuerNameSpaces = new Map([
 *   ['org.iso.18013.5.1', [tag1, tag2]],
 * ]);
 *
 * const claims: DcqlClaim[] = [
 *   { path: ['org.iso.18013.5.1', 'given_name'], values: undefined, intent_to_retain: false },
 *   { path: ['org.iso.18013.5.1', 'family_name'], values: ['Doe'], intent_to_retain: false },
 * ];
 *
 * const result = selectIssuerNameSpaces({
 *   nameSpaces,
 *   claims,
 *   claimSets: undefined,
 * });
 * // Returns: Map([['org.iso.18013.5.1', [tag1, tag2]]])
 * ```
 *
 * @example
 * ```typescript
 * // Example 2: Process claim sets (tries each claim set until one succeeds)
 * const nameSpaces: IssuerNameSpaces = new Map([
 *   ['org.iso.18013.5.1', [tag1, tag2]],
 * ]);
 *
 * const claims: DcqlClaim[] = [
 *   { id: 'claim1', path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *   { id: 'claim2', path: ['org.iso.18013.5.1', 'family_name'], intent_to_retain: false },
 * ];
 *
 * const claimSets: DcqlClaimSet[] = [
 *   ['claim1', 'claim2'], // First claim set
 *   ['claim1'],          // Fallback claim set
 * ];
 *
 * const result = selectIssuerNameSpaces({
 *   nameSpaces,
 *   claims,
 *   claimSets,
 * });
 * // Returns: Map([['org.iso.18013.5.1', [tag1, tag2]]]) if first claim set succeeds
 * ```
 *
 * @example
 * ```typescript
 * // Example 3: No claims provided
 * const result = selectIssuerNameSpaces({
 *   nameSpaces: new Map(),
 *   claims: undefined,
 *   claimSets: undefined,
 * });
 * // Returns: Map() (empty map)
 * ```
 */
export const selectIssuerNameSpaces = ({
  nameSpaces,
  claims,
  claimSets,
}: SelectIssuerNameSpacesParams): IssuerNameSpaces | undefined => {
  try {
    if (!claims) {
      if (claimSets) {
        throw new ErrorCodeError(
          'Claim sets are present when claims are absent.',
          MdocErrorCode.ClaimSetsPresentWhenClaimsAbsent
        );
      }

      return new Map();
    }

    const enrichedIssuerNameSpaces = enrichIssuerNameSpaces(nameSpaces);

    if (claimSets) {
      return selectIssuerNameSpacesWithClaimSets(
        enrichedIssuerNameSpaces,
        claims,
        claimSets
      );
    }

    return selectIssuerNameSpacesWithoutClaimSets(
      enrichedIssuerNameSpaces,
      claims
    );
  } catch (error) {
    console.log(getErrorMessage(error));
    return undefined;
  }
};
