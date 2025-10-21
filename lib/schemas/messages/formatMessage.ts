/**
 * Extracts and formats the message part after the first colon, trimming whitespace.
 *
 * If the original message does not contain a colon, returns the whole message trimmed.
 * This is useful for cleaning up error messages of the form:
 *   "Path: Error details"
 * and extracting just the "Error details".
 *
 * @param {string} [originalMessage='Invalid value'] - The original error message, possibly including a path prefix and colon.
 * @returns {string} The formatted message, with any leading path and colon removed when appropriate.
 */
export const formatMessage = (
  originalMessage: string = 'Invalid value'
): string => {
  const colonIndex = originalMessage.indexOf(':');

  if (colonIndex === -1) {
    return originalMessage.trim();
  }
  // Only strip the leading path when it looks like a simple object/array path
  // consisting of letters, digits, dots and optional array indices (e.g., "Target.field" or "Aaa[0].key").
  // If the left side contains other characters (e.g., dashes in timestamps
  // like "YYYY-MM-DDTHH:MM:SSZ"), do NOT strip.
  const left = originalMessage.substring(0, colonIndex).trim();
  // Allow object/array path labels (letters, digits, dot, and [] indexing)
  const isPath = /^[A-Za-z0-9._[\]]+$/.test(left);
  if (!isPath) {
    return originalMessage.trim();
  }

  return originalMessage.substring(colonIndex + 1).trim();
};
