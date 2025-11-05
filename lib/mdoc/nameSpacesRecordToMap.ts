/**
 * Converts a Record of namespace strings to device-signed items
 * into a Map structure suitable for mdoc data structures.
 *
 * @param nameSpaces - An object where each key is a namespace string and each value
 *   is an object mapping element identifiers to their corresponding values.
 * @returns A Map<string, Map<string, unknown>> mapping each namespace string to
 *   a Map of element identifiers and their values.
 *
 * @example
 * const record = {
 *   "org.iso.18013.5.1": {
 *     "given_name": "John",
 *     "family_name": "Doe"
 *   }
 * };
 * const map = nameSpacesRecordToMap(record);
 * // map is a Map with a single entry:
 * //   key: "org.iso.18013.5.1", value: Map { "given_name" => "John", "family_name" => "Doe" }
 */
export const nameSpacesRecordToMap = (
  nameSpaces: Record<string, Record<string, unknown>>
): Map<string, Map<string, unknown>> => {
  return new Map(
    Object.entries(nameSpaces).map(([ns, items]) => [
      ns,
      new Map(Object.entries(items)),
    ])
  );
};
