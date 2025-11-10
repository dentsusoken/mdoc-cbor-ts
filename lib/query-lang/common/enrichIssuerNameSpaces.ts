import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import {
  enrichIssuerSignedItems,
  EnrichIssuerSignedItemsResult,
} from './enrichIssuerSignedItems';

/**
 * Enriches issuer name spaces by processing each namespace's issuer-signed items.
 *
 * This function takes a Map of issuer name spaces (where each entry maps a namespace
 * to an array of Tag(24) values containing IssuerSignedItem maps) and enriches each
 * namespace's items using {@link enrichIssuerSignedItems}. The enrichment process:
 * 1. Separates normal IssuerSignedItems from "age_over_*" items
 * 2. Further categorizes "age_over_*" items by their boolean value (true/false)
 * 3. Extracts and enriches the numeric suffix (NN) from "age_over_NN" identifiers
 * 4. Sorts age_over_* items for efficient selection
 *
 * This is useful as a preprocessing step before selecting issuer-signed items based on
 * DCQL claims, as it organizes the data in a format that allows efficient lookup and
 * matching of element identifiers and values.
 *
 * @param issuerNameSpaces - Map from namespace string to array of Tag(24) values.
 *   Each Tag(24) contains an IssuerSignedItem map with elementIdentifier and elementValue.
 * @returns A Map from namespace string to {@link EnrichIssuerSignedItemsResult}.
 *   Each result contains:
 *   - `normalItems`: All non-age_over_* items with their elementIdentifier, elementValue, and tag
 *   - `ageOverTrueItems`: All age_over_NN items with value=true, sorted by NN in ascending order
 *   - `ageOverFalseItems`: All age_over_NN items with value≠true, sorted by NN in descending order
 *
 * @example
 * ```typescript
 * const issuerNameSpaces: IssuerNameSpaces = new Map([
 *   ['org.iso.18013.5.1', [tag1, tag2, tag3]],
 *   ['org.iso.18013.5.2', [tag4, tag5]],
 * ]);
 *
 * const enriched = enrichIssuerNameSpaces(issuerNameSpaces);
 * // Returns: Map([
 * //   ['org.iso.18013.5.1', {
 * //     normalItems: [
 * //       { elementIdentifier: 'given_name', elementValue: 'John', tag: tag1 },
 * //       { elementIdentifier: 'family_name', elementValue: 'Doe', tag: tag2 },
 * //     ],
 * //     ageOverTrueItems: [{ nn: 18, tag: tag3 }],
 * //     ageOverFalseItems: [],
 * //   }],
 * //   ['org.iso.18013.5.2', { ... }]
 * // ])
 * ```
 */
export const enrichIssuerNameSpaces = (
  issuerNameSpaces: IssuerNameSpaces
): Map<string, EnrichIssuerSignedItemsResult> => {
  const result = new Map<string, EnrichIssuerSignedItemsResult>();
  issuerNameSpaces.forEach((issuerSignedItemTags, nameSpace) => {
    result.set(nameSpace, enrichIssuerSignedItems(issuerSignedItemTags));
  });

  return result;
};
