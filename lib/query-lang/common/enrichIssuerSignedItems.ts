import { decodeTag24 } from '@/cbor/decodeTag24';
import { IssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { Tag } from 'cbor-x';

/**
 * Enriched view of a standard IssuerSignedItem (non age_over_*).
 */
interface EnrichedIssuerSignedItem {
  elementIdentifier: string;
  elementValue: unknown;
  tag: Tag;
}

/**
 * Enriched view for age_over_* entries where the value is true/false.
 */
interface EnrichedAgeOverIssuerSignedItem {
  nn: number;
  tag: Tag;
}

/**
 * The result object returned by {@link enrichIssuerSignedItems}.
 * Separates normal IssuerSignedItems from "age_over_*" items (which are further
 * split and enriched according to their boolean value and "NN" numeric suffix).
 */
interface EnrichIssuerSignedItemsResult {
  /**
   * All IssuerSignedItem entries whose elementIdentifier does NOT start with "age_over_".
   */
  normalItems: EnrichedIssuerSignedItem[];
  /**
   * All "age_over_NN" entries where the value is true, enriched with the integer NN.
   */
  ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[];
  /**
   * All "age_over_NN" entries where the value is not true, enriched with the integer NN.
   */
  ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[];
}

/**
 * Helper comparator for sorting an array of EnrichedAgeOverIssuerSignedItem objects
 * in ascending order according to their nn property.
 *
 * @param a - The first EnrichedAgeOverIssuerSignedItem to compare.
 * @param b - The second EnrichedAgeOverIssuerSignedItem to compare.
 * @returns A negative number if a.nn < b.nn, positive if a.nn > b.nn, or 0 if equal.
 */
const nnSort = (
  a: EnrichedAgeOverIssuerSignedItem,
  b: EnrichedAgeOverIssuerSignedItem
): number => a.nn - b.nn;

/**
 * Enrich IssuerSignedItem Tag(24) values by separating normal items and age_over_* flags.
 * @param issuerSignedItemTags - Array of Tag(24) values containing IssuerSignedItem maps
 * @returns Grouped items for convenient consumption
 */
export const enrichIssuerSignedItems = (
  issuerSignedItemTags: Tag[]
): EnrichIssuerSignedItemsResult => {
  const normalItems: EnrichedIssuerSignedItem[] = [];
  const ageOverTrueItems: EnrichedAgeOverIssuerSignedItem[] = [];
  const ageOverFalseItems: EnrichedAgeOverIssuerSignedItem[] = [];

  issuerSignedItemTags.forEach((tag) => {
    const issuerSignedItem = decodeTag24<IssuerSignedItem>(tag);
    const elementIdentifier = issuerSignedItem.get('elementIdentifier')!;
    const elementValue = issuerSignedItem.get('elementValue');

    if (!elementIdentifier.startsWith('age_over_')) {
      normalItems.push({ elementIdentifier, elementValue, tag });
      return;
    }

    const nn = parseInt(elementIdentifier.replace('age_over_', ''), 10);

    if (elementValue === true) {
      ageOverTrueItems.push({ nn, tag });
    } else {
      ageOverFalseItems.push({ nn, tag });
    }
  });

  return {
    normalItems,
    ageOverTrueItems: ageOverTrueItems.sort(nnSort),
    ageOverFalseItems: ageOverFalseItems.sort(nnSort),
  };
};
