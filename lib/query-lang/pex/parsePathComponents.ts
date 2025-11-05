import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MDocErrorCode } from '@/mdoc/types';

/**
 * The result of parsing the path components from a mdoc input descriptor field path.
 */
interface ParsedPathComponentsResult {
  /** The extracted namespace, e.g. "org.iso.18013.5.1" */
  nameSpace: string;
  /** The extracted elementIdentifier, e.g. "family_name" */
  elementIdentifier: string;
}

/**
 * Parses a field path string of the form `['nameSpace']['elementIdentifier']`
 * into its constituent namespace and elementIdentifier components.
 *
 * @description
 * This function is designed to be used with mdoc or OID4VP input descriptor field
 * path syntax, which is typically of the form:
 *   "$['org.iso.18013.5.1']['given_name']"
 * It extracts both the namespace and elementIdentifier substrings.
 * If parsing fails, it will throw an {@link ErrorCodeError} with {@link MDocErrorCode.InvalidInputDescriptorFieldPath}.
 *
 * @param path - The input field path string to parse.
 * @returns An object containing the parsed `nameSpace` and `elementIdentifier`.
 * @throws {ErrorCodeError} If the path cannot be parsed or is malformed.
 *
 * @example
 * ```
 * const result = parsePathComponents("['org.iso.18013.5.1']['given_name']");
 * // result = { nameSpace: "org.iso.18013.5.1", elementIdentifier: "given_name" }
 * ```
 */
export const parsePathComponents = (
  path: string
): ParsedPathComponentsResult => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [[_1, nameSpace], [_2, elementIdentifier]] = [
    ...path.matchAll(/\['(.*?)'\]/g),
  ];

  if (!nameSpace) {
    throw new ErrorCodeError(
      `Failed to parse nameSpace from path "${path}"`,
      MDocErrorCode.InvalidInputDescriptorFieldPath
    );
  }

  if (!elementIdentifier) {
    throw new ErrorCodeError(
      `Failed to parse elementIdentifier from path "${path}"`,
      MDocErrorCode.InvalidInputDescriptorFieldPath
    );
  }

  return { nameSpace, elementIdentifier };
};
