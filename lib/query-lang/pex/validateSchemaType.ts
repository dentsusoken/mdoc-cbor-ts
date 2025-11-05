/**
 * Validates a value against a given JSON Schema-like type name.
 *
 * @param schemaType - The schema type name to validate against (e.g., "string", "number", "boolean", "integer").
 * @param value - The value to validate.
 * @returns True if the value matches the given schema type, otherwise false.
 * @throws {Error} If the schema type is not recognized.
 *
 * @example
 * validateSchemaType('string', 'foo'); // true
 * validateSchemaType('integer', 42);   // true
 * validateSchemaType('number', 4.2);   // true
 * validateSchemaType('integer', 4.2);  // false
 */
export const validateSchemaType = (
  schemaType: string,
  value: unknown
): boolean => {
  switch (schemaType) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    default:
      throw new Error(`Invalid schema type: ${schemaType}`);
  }
};
