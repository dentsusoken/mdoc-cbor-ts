/**
 * Extracts and formats the message part after the first colon, trimming whitespace.
 *
 * If the original message does not contain a colon, returns the whole message trimmed.
 * This is useful for cleaning up error messages of the form:
 *   "Label: Error details"
 * and extracting just the "Error details".
 *
 * @param {string} [originalMessage='Invalid value'] - The original error message, possibly including a label and colon.
 * @returns {string} The formatted message, with any leading label and colon removed.
 */
export const formatMessage = (
  originalMessage: string = 'Invalid value'
): string => {
  const colonIndex = originalMessage.indexOf(':');

  if (colonIndex === -1) {
    return originalMessage.trim();
  }

  return originalMessage.substring(colonIndex + 1).trim();
};
