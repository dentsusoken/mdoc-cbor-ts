import { z } from 'zod';
import { createRecordSchema } from '../common/Record';
import { nameSpaceSchema } from '../common/NameSpace';
import { dataElementsArraySchema } from '../mso/DataElementsArray';

/**
 * Creates a schema for namespaces containing data element identifiers records
 * @description
 * Returns a Zod schema that validates a required, non-empty record of `NameSpace` to `DataElementsArray`.
 * This represents a structure where each namespace contains an array of data element identifiers.
 *
 * Validation rules:
 * - Requires input to be a record
 * - Disallows empty records (at least one namespace is required)
 * - Keys must satisfy {@link NameSpace}
 * - Values must satisfy {@link DataElementsArray}
 *
 * Error messages are prefixed with the provided `target` name.
 *
 * ```cddl
 * NameSpaceElementIdentifiersRecord = {
 *   + NameSpace => DataElementsArray
 * }
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "NameSpaceElementIdentifiersRecord")
 * @returns A Zod schema that validates Record<NameSpace, DataElementsArray>
 *
 * @example
 * ```typescript
 * const nameSpaceElementIdentifiersRecordSchema = createNameSpaceElementIdentifiersRecordSchema('NameSpaceElementIdentifiersRecord');
 *
 * const input = {
 *   'org.iso.18013.5.1': [
 *     'given_name',
 *     'family_name'
 *   ]
 * };
 * const result = nameSpaceElementIdentifiersRecordSchema.parse(input); // Returns NameSpaceElementIdentifiersRecord
 * ```
 *
 * @see {@link NameSpace}
 * @see {@link DataElementsArray}
 */
export const createNameSpaceElementIdentifiersRecordSchema = (
  target: string
): z.ZodType<Record<string, string[]>> =>
  createRecordSchema({
    target,
    keySchema: nameSpaceSchema,
    valueSchema: dataElementsArraySchema,
  });

/**
 * Schema for namespaces containing data element identifiers records
 * @description
 * A concrete schema instance that validates a required, non-empty record of `NameSpace` to `DataElementsArray`.
 * This represents a structure where each namespace contains an array of data element identifiers.
 *
 * Validation rules:
 * - Requires input to be a record
 * - Disallows empty records (at least one namespace is required)
 * - Keys must satisfy {@link NameSpace}
 * - Values must satisfy {@link DataElementsArray}
 *
 * Error messages are prefixed with: `NameSpaceElementIdentifiersRecord: ...`.
 *
 * ```cddl
 * NameSpaceElementIdentifiersRecord = {
 *   + NameSpace => DataElementsArray
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
 * const result = nameSpaceElementIdentifiersRecordSchema.parse(input); // Returns NameSpaceElementIdentifiersRecord
 * ```
 *
 * @see {@link NameSpace}
 * @see {@link DataElementsArray}
 * @see {@link createNameSpaceElementIdentifiersRecordSchema}
 */
export const nameSpaceElementIdentifiersRecordSchema =
  createNameSpaceElementIdentifiersRecordSchema(
    'NameSpaceElementIdentifiersRecord'
  );

/**
 * Type representing a record of namespaces to data element identifiers arrays
 * @description
 * A record where each key is a namespace and each value is an array of data element identifiers.
 * This type is inferred from the `nameSpaceElementIdentifiersRecordSchema`.
 */
export type NameSpaceElementIdentifiersRecord = z.output<
  typeof nameSpaceElementIdentifiersRecordSchema
>;
