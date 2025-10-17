import { valueInvalidTypeMessage } from './valueInvalidTypeMessage';

type ContainerInvalidTypeMessageParams = {
  target: string;
  expected: string;
  received: string;
};

/**
 * Creates a standardized error message for invalid type errors within containers (e.g., arrays, maps).
 *
 * @description
 * Constructs an error message indicating that the value received does not match the expected type,
 * prefixing the message with the target container or schema name.
 *
 * @param params - The parameters for generating the error message.
 * @param params.target - The name of the container or schema being validated (e.g., "User", "Addresses").
 * @param params.expected - The expected type (e.g., "array", "map", "string").
 * @param params.received - The type that was actually received (e.g., "object", "number").
 * @returns A formatted error message string describing the type mismatch.
 *
 * @example
 * containerInvalidTypeMessage({ target: "Tags", expected: "array", received: "Object" });
 * // Returns: "Tags: Expected array, received Object"
 */
export const containerInvalidTypeMessage = ({
  target,
  expected,
  received,
}: ContainerInvalidTypeMessageParams): string =>
  `${target}: ${valueInvalidTypeMessage({ expected, received })}`;
