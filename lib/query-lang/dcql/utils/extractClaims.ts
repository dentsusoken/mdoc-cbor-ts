import { DcqlClaim } from '../schemas/DcqlClaim';

/**
 * Extracts claims from a claim map by their IDs.
 *
 * This function takes a Map of claims (typically created by {@link toClaimMap}) and
 * an array of claim IDs, and returns an array of the corresponding claim objects.
 * The order of the returned claims matches the order of the provided IDs.
 *
 * This is useful for efficiently retrieving multiple claims from a pre-built lookup map,
 * especially when working with claim references or when you have a list of claim IDs
 * and need to retrieve the full claim objects.
 *
 * @param claimMap - Map from claim ID (string) to DcqlClaim object. Typically created
 *   using {@link toClaimMap} for efficient lookup.
 * @param ids - Array of claim IDs to extract. The order of IDs determines the order
 *   of claims in the returned array.
 * @returns An array of DcqlClaim objects corresponding to the provided IDs, in the
 *   same order as the IDs array.
 * @throws {Error} If any ID in the `ids` array is not found in the `claimMap`.
 *   The error message includes the missing ID: `"Claim with id {id} not found"`.
 *
 * @example
 * ```typescript
 * const claims: DcqlClaim[] = [
 *   { id: 'claim1', path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *   { id: 'claim2', path: ['org.iso.18013.5.1', 'family_name'], intent_to_retain: false },
 *   { id: 'claim3', path: ['org.iso.18013.5.1', 'age'], intent_to_retain: false },
 * ];
 *
 * const claimMap = toClaimMap(claims);
 * const extracted = extractClaims(claimMap, ['claim1', 'claim3']);
 * // Returns: [
 * //   { id: 'claim1', path: ['org.iso.18013.5.1', 'given_name'], ... },
 * //   { id: 'claim3', path: ['org.iso.18013.5.1', 'age'], ... }
 * // ]
 * ```
 *
 * @example
 * ```typescript
 * // Throws error when ID is not found
 * const claimMap = toClaimMap(claims);
 * extractClaims(claimMap, ['claim1', 'non_existent']);
 * // Throws: Error("Claim with id non_existent not found")
 * ```
 */
export const extractClaims = (
  claimMap: Map<string, DcqlClaim>,
  ids: string[]
): DcqlClaim[] => {
  return ids.map((id) => {
    const claim = claimMap.get(id);

    if (!claim) {
      throw new Error(`Claim with id ${id} not found`);
    }

    return claim;
  });
};
