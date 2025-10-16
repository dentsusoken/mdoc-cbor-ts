/**
 * Parameters for generating an invalid type error message for values.
 * @typedef {Object} ValueInvalidTypeMessageParams
 * @property {string} expected - Description of the expected type.
 * @property {string} received - Description of the actually received type.
 */
type ValueInvalidTypeMessageParams = {
  expected: string;
  received: string;
};

/**
 * Creates a standardized error message indicating a value type mismatch.
 *
 * @param {ValueInvalidTypeMessageParams} params - Parameters used in the error message.
 * @param {string} params.expected - The expected type of the value.
 * @param {string} params.received - The actual received type.
 * @returns {string} A formatted error message describing the type mismatch.
 *
 * @example
 * valueInvalidTypeMessage({ target: "Age", expected: "number", received: "string" });
 * // Returns: "Expected number, received string"
 */
export const valueInvalidTypeMessage = ({
  expected,
  received,
}: ValueInvalidTypeMessageParams): string =>
  `Expected ${expected}, received ${received}`;
