import { IssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';

/**
 * The result object returned by {@link extractAgeOverArrays}.
 * Separates integer age thresholds for 'age_over_' attributes into
 * arrays depending on their boolean value.
 */
interface ExtractAgeOverArraysResult {
  /** Array of numeric thresholds for which the elementValue is true (e.g. [16, 18] for age_over_16=true, age_over_18=true). */
  ageOverTrueArray: number[];
  /** Array of numeric thresholds for which the elementValue is false (e.g. [21] for age_over_21=false). */
  ageOverFalseArray: number[];
}

/**
 * Extracts arrays of "age_over_NN" integer values from an array of IssuerSignedItem objects,
 * partitioned into arrays for which the value is true or not true, both returned in ascending order.
 *
 * @param items - An array of IssuerSignedItem objects, typically from a namespace of issuer-signed claims.
 * @returns An object with two arrays: one for integer suffixes (NN) with value === true, and one for value !== true.
 *          Both arrays are sorted in ascending order before returning.
 *
 * @example
 * ```typescript
 * const items = [
 *   new Map([['elementIdentifier', 'age_over_21'], ['elementValue', false]]),
 *   new Map([['elementIdentifier', 'age_over_18'], ['elementValue', false]]),
 *   new Map([['elementIdentifier', 'age_over_20'], ['elementValue', true]]),
 *   new Map([['elementIdentifier', 'age_over_16'], ['elementValue', true]]),
 *   new Map([['elementIdentifier', 'given_name'], ['elementValue', 'Alice']]),
 * ];
 * // extractAgeOverArrays(items) yields:
 * // { ageOverTrueArray: [16, 20], ageOverFalseArray: [18, 21] }
 * //                        ^ sorted                 ^ sorted
 * ```
 */
export const extractAgeOverArrays = (
  items: IssuerSignedItem[]
): ExtractAgeOverArraysResult => {
  const ageOverTrueArray: number[] = [];
  const ageOverFalseArray: number[] = [];

  items.forEach((item) => {
    const key = item.get('elementIdentifier')!;

    if (!key.startsWith('age_over_')) {
      return;
    }
    const nn = parseInt(key.replace('age_over_', ''), 10);
    const value = item.get('elementValue')!;

    if (value === true) {
      ageOverTrueArray.push(nn);
    } else {
      ageOverFalseArray.push(nn);
    }
  });

  return {
    ageOverTrueArray: ageOverTrueArray.sort(),
    ageOverFalseArray: ageOverFalseArray.sort(),
  };
};
