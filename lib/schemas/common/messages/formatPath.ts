/**
 * Formats a property path string by combining a target string and an array of path segments,
 * where string segments are concatenated with dot notation and number segments are represented as array indices.
 *
 * @param {string} target - The root or base of the path.
 * @param {(string | number)[]} path - An array of keys or indices representing the property path.
 * @returns {string} The formatted path string (e.g., "foo.bar[0].baz").
 */
export const formatPath = (
  target: string,
  path: (string | number)[]
): string => {
  return [target, ...path]
    .map((p, index) => {
      if (typeof p === 'number') {
        return `[${p}]`;
      }
      if (index === 0) {
        return p;
      }
      return `.${p}`;
    })
    .join('');
};
