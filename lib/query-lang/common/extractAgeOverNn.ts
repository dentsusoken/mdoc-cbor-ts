/**
 * Extracts the numeric value (NN) from an age_over_NN element identifier.
 *
 * This function parses an element identifier string in the format `age_over_NN` where
 * NN is a two-digit number (00-99), and returns the numeric value.
 *
 * @param elementIdentifier - The element identifier string to parse (e.g., "age_over_18", "age_over_21").
 * @returns The numeric value extracted from the element identifier (0-99).
 * @throws {Error} If the element identifier does not match the expected format `age_over_NN` where NN is a two-digit number.
 * @throws {Error} If the extracted numeric value exceeds 99.
 *
 * @example
 * ```typescript
 * const nn = extractAgeOverNn('age_over_18');
 * // Returns: 18
 * ```
 *
 * @example
 * ```typescript
 * const nn = extractAgeOverNn('age_over_00');
 * // Returns: 0
 * ```
 *
 * @example
 * ```typescript
 * const nn = extractAgeOverNn('age_over_99');
 * // Returns: 99
 * ```
 */
export const extractAgeOverNn = (elementIdentifier: string): number => {
  const match = elementIdentifier.match(/^age_over_(\d\d)$/);

  if (!match) {
    throw new Error(
      `Invalid age_over format: ${elementIdentifier}. Expected format: age_over_NN where NN is a two-digit number`
    );
  }

  return parseInt(match[1], 10);
};
