/**
 * Extracts a string error message from an unknown error value.
 *
 * @param error - The error value to extract a message from
 * @returns The error message as a string
 *
 * @example
 * ```typescript
 * try {
 *   throw new Error('Something went wrong');
 * } catch (error) {
 *   const message = getErrorMessage(error); // "Something went wrong"
 * }
 *
 * const message = getErrorMessage('String error'); // "String error"
 * const message = getErrorMessage(404); // "404"
 * ```
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
};
