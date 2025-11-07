import { decodeTag24 } from '@/cbor/decodeTag24';
import { IssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { getTypeName } from '@/utils/getTypeName';
import { Tag } from 'cbor-x';

/**
 * Enriched view of a standard IssuerSignedItem (non age_over_*).
 */
export interface EnrichedIssuerSignedItem {
  elementIdentifier: string;
  elementValue: unknown;
  tag: Tag;
}

/**
 * Enriched view for age_over_* entries where the value is true/false.
 */
export interface EnrichedAgeOverIssuerSignedItem {
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
 * Sorts EnrichedAgeOverIssuerSignedItem objects in ascending order by their NN value.
 * @param a - First EnrichedAgeOverIssuerSignedItem
 * @param b - Second EnrichedAgeOverIssuerSignedItem
 * @returns Negative if a.nn < b.nn, positive if a.nn > b.nn, zero if equal
 */
const nnAscendingSort = (
  a: EnrichedAgeOverIssuerSignedItem,
  b: EnrichedAgeOverIssuerSignedItem
): number => a.nn - b.nn;

/**
 * Sorts EnrichedAgeOverIssuerSignedItem objects in descending order by their NN value.
 * @param a - First EnrichedAgeOverIssuerSignedItem
 * @param b - Second EnrichedAgeOverIssuerSignedItem
 * @returns Negative if a.nn > b.nn, positive if a.nn < b.nn, zero if equal
 */
const nnDescendingSort = (
  a: EnrichedAgeOverIssuerSignedItem,
  b: EnrichedAgeOverIssuerSignedItem
): number => b.nn - a.nn;

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

    if (!elementIdentifier) {
      throw new Error('IssuerSignedItem missing elementIdentifier');
    }

    if (!elementIdentifier.startsWith('age_over_')) {
      normalItems.push({ elementIdentifier, elementValue, tag });
      return;
    }

    const ageOverMatch = elementIdentifier.match(/^age_over_(\d\d)$/);

    if (!ageOverMatch) {
      throw new Error(
        `Invalid age_over format: ${elementIdentifier}. ` +
          `Expected format: age_over_NN where NN is a two-digit number`
      );
    }

    const nn = parseInt(ageOverMatch[1], 10);

    if (nn > 99) {
      throw new Error(
        `Invalid age threshold in ${elementIdentifier}: ${nn}. ` +
          `Expected value between 00 and 99`
      );
    }

    if (typeof elementValue !== 'boolean') {
      throw new Error(
        `Invalid elementValue type for ${elementIdentifier}. ` +
          `Expected boolean, got ${getTypeName(elementValue)}`
      );
    }

    if (elementValue === true) {
      ageOverTrueItems.push({ nn, tag });
    } else {
      ageOverFalseItems.push({ nn, tag });
    }
  });

  return {
    normalItems,
    ageOverTrueItems: ageOverTrueItems.sort(nnAscendingSort),
    ageOverFalseItems: ageOverFalseItems.sort(nnDescendingSort),
  };
};
