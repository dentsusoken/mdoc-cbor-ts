import { z } from 'zod';
import { createRecordSchema } from '../common/Record';
import { nameSpaceSchema } from '../common/NameSpace';
import { dataElementIdentifiersSchema } from '../mso/DataElementIdentifiers';

/**
 * Creates a schema for namespaces containing data element identifiers
 * @description
 * Returns a Zod schema that validates a required, non-empty record of `NameSpace` to `DataElementIdentifiers`.
 * This represents a structure where each namespace contains an array of data element identifiers.
 *
 * Validation rules:
 * - Requires input to be a record
 * - Disallows empty records (at least one namespace is required)
 * - Keys must satisfy {@link NameSpace}
 * - Values must satisfy {@link DataElementIdentifiers}
 *
 * Error messages are prefixed with the provided `target` name.
 *
 * ```cddl
 * NameSpaceElementIdentifiers = {
 *   + NameSpace => DataElementIdentifiers
 * }
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "NameSpaceElementIdentifiers")
 * @returns A Zod schema that validates Record<NameSpace, DataElementIdentifiers>
 *
 * @example
 * ```typescript
 * const nameSpaceElementIdentifiersSchema = createNameSpaceElementIdentifiersSchema('NameSpaceElementIdentifiers');
 *
 * const input = {
 *   'org.iso.18013.5.1': [
 *     'given_name',
 *     'family_name'
 *   ]
 * };
 * const result = nameSpaceElementIdentifiersSchema.parse(input); // Returns NameSpaceElementIdentifiers
 * ```
 *
 * @see {@link NameSpace}
 * @see {@link DataElementIdentifiers}
 */
export const createNameSpaceElementIdentifiersSchema = (
  target: string
): z.ZodType<
  Record<string, string[]>,
  z.ZodTypeDef,
  Record<string, readonly string[]>
> =>
  createRecordSchema({
    target,
    keySchema: nameSpaceSchema,
    valueSchema: dataElementIdentifiersSchema,
  });

/**
 * Schema for namespaces containing data element identifiers
 * @description
 * A concrete schema instance that validates a required, non-empty record of `NameSpace` to `DataElementIdentifiers`.
 * This represents a structure where each namespace contains an array of data element identifiers.
 *
 * Validation rules:
 * - Requires input to be a record
 * - Disallows empty records (at least one namespace is required)
 * - Keys must satisfy {@link NameSpace}
 * - Values must satisfy {@link DataElementIdentifiers}
 *
 * Error messages are prefixed with: `NameSpaceElementIdentifiers: ...`.
 *
 * ```cddl
 * NameSpaceElementIdentifiers = {
 *   + NameSpace => DataElementIdentifiers
 * }
 * ```
 *
 * @example
 * ```typescript
 * const input = {
 *   'org.iso.18013.5.1': [
 *     'given_name',
 *     'family_name'
 *   ]
 * };
 * const result = nameSpaceElementIdentifiersSchema.parse(input); // Returns NameSpaceElementIdentifiers
 * ```
 *
 * @see {@link NameSpace}
 * @see {@link DataElementIdentifiers}
 * @see {@link createNameSpaceElementIdentifiersSchema}
 */
export const nameSpaceElementIdentifiersSchema =
  createNameSpaceElementIdentifiersSchema('NameSpaceElementIdentifiers');

/**
 * Type representing a record of namespaces to data element identifiers arrays
 * @description
 * A record where each key is a namespace and each value is an array of data element identifiers.
 * This type is inferred from the `nameSpaceElementIdentifiersSchema`.
 */
export type NameSpaceElementIdentifiers = z.output<
  typeof nameSpaceElementIdentifiersSchema
>;
