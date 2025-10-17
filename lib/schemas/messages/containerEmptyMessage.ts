/**
 * Generates an error message indicating that at least one entry must be provided for the specified target.
 *
 * @param {string} target - The name of the container or field that must not be empty.
 * @returns {string} The formatted error message.
 */
export const containerEmptyMessage = (target: string): string =>
  `${target}: At least one entry must be provided.`;
