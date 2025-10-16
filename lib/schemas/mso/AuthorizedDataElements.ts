import { z } from 'zod';
import { nameSpaceSchema } from '@/schemas/common/NameSpace';
import { createMapSchema } from '@/schemas/common/container/Map';
import { dataElementIdentifiersSchema } from '@/schemas/mso/DataElementIdentifiers';

/**
 * Schema for authorized data elements in MSO
 * @description
 * Validates a required non-empty mapping from `NameSpace` to `DataElementsArray`.
 * Error messages are prefixed with `AuthorizedNameSpaces: ...` and follow
 * the standardized validations provided by `nameSpaceSchema` and
 * `dataElementsArraySchema`.
 *
 * Validation rules:
 * - Requires a Map-like object (record) type
 * - Requires at least one entry (non-empty)
 * - Each key must satisfy `nameSpaceSchema` (text)
 * - Each value must satisfy `dataElementsArraySchema` (non-empty array of identifiers)
 *
 * ```cddl
 * AuthorizedDataElements = {+ NameSpace => DataElementsArray}
 * ```
 *
 * @example
 * ```typescript
 * const elements = {
 *   "org.iso.18013.5.1": ["given_name", "family_name"],
 * };
 * const result = authorizedDataElementsSchema.parse(elements); // AuthorizedDataElements
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (empty record is not allowed)
 * // authorizedDataElementsSchema.parse({});
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid key or value types)
 * // authorizedDataElementsSchema.parse({ 123: ["given_name"] });
 * // authorizedDataElementsSchema.parse({ "org.iso.18013.5.1": [123] });
 * ```
 *
 * @see nameSpaceSchema
 * @see dataElementIdentifiersSchema
 */
export const authorizedDataElementsSchema = createMapSchema({
  target: 'AuthorizedDataElements',
  keySchema: nameSpaceSchema,
  valueSchema: dataElementIdentifiersSchema,
});

/**
 * Type definition for authorized data elements
 * @description
 * Represents a validated record of namespaces and their authorized data elements.
 *
 * @see {@link DataElementsArray}
 */
export type AuthorizedDataElements = z.output<
  typeof authorizedDataElementsSchema
>;
