import { DcqlClaim } from '../schemas';

/**
 * Converts an array of DCQL claims into a Map keyed by claim ID.
 *
 * This function creates a lookup map from an array of claims, where each claim's
 * optional `id` property is used as the key. Only claims that have an `id` property
 * are included in the resulting map. Claims without an `id` are silently skipped.
 *
 * This is useful for efficient lookup of claims by their ID, especially when
 * working with claim references or when you need to quickly find a specific claim
 * from a list of claim IDs.
 *
 * @param claims - Array of DCQL claims to convert. Each claim may optionally have an `id` property.
 * @returns A Map from claim ID (string) to the corresponding DcqlClaim object.
 *   Only claims with an `id` property are included in the map.
 *
 * @example
 * ```typescript
 * const claims: DcqlClaim[] = [
 *   { id: 'claim1', path: ['org.iso.18013.5.1', 'given_name'], intent_to_retain: false },
 *   { id: 'claim2', path: ['org.iso.18013.5.1', 'family_name'], intent_to_retain: false },
 *   { path: ['org.iso.18013.5.1', 'age'], intent_to_retain: false }, // No id, will be skipped
 * ];
 *
 * const claimMap = toClaimMap(claims);
 * // Returns: Map([
 * //   ['claim1', { id: 'claim1', path: ['org.iso.18013.5.1', 'given_name'], ... }],
 * //   ['claim2', { id: 'claim2', path: ['org.iso.18013.5.1', 'family_name'], ... }]
 * // ])
 * ```
 *
 * @example
 * ```typescript
 * // Using the map for lookup
 * const claimMap = toClaimMap(claims);
 * const claim = claimMap.get('claim1');
 * // Returns the claim with id 'claim1', or undefined if not found
 * ```
 */
export const toClaimMap = (claims: DcqlClaim[]): Map<string, DcqlClaim> => {
  const claimMap = new Map<string, DcqlClaim>();

  claims.forEach((claim) => {
    if (claim.id) {
      claimMap.set(claim.id, claim);
    }
  });

  return claimMap;
};
