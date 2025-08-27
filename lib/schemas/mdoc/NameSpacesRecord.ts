import { z } from 'zod';
import { createRecordSchema } from '../common/Record';
import { nameSpaceSchema } from '../common/NameSpace';
import { dataElementIdentifierSchema } from '../common/DataElementIdentifier';
import { dataElementValueSchema } from '../common/DataElementValue';

/**
 * Schema for name spaces containing data elements
 * @description
 * Validates a required, non-empty record of `NameSpace` to nested records of
 * `DataElementIdentifier` to `DataElementValue`. This represents a hierarchical
 * structure where each namespace contains multiple data elements.
 *
 * Validation rules:
 * - Requires input to be a record
 * - Disallows empty records (at least one namespace is required)
 * - Keys must satisfy {@link NameSpace}
 * - Values must be non-empty records where:
 *   - Keys must satisfy {@link DataElementIdentifier}
 *   - Values must satisfy {@link DataElementValue}
 *
 * Error messages are prefixed with the target name: `NameSpacesRecord: ...`.
 *
 * ```cddl
 * NameSpacesRecord = {
 *   + NameSpace => {
 *     + DataElementIdentifier => DataElementValue
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * const nameSpacesRecord = {
 *   'org.iso.18013.5.1': {
 *     'given_name': 'John',
 *     'family_name': 'Doe'
 *   }
 * };
 * const result = nameSpacesRecordSchema.parse(nameSpacesRecord); // Returns Record<NameSpace, Record<DataElementIdentifier, DataElementValue>>
 * ```
 *
 * @see {@link NameSpace}
 * @see {@link DataElementIdentifier}
 * @see {@link DataElementValue}
 */
export const nameSpacesRecordSchema = createRecordSchema({
  target: 'NameSpacesRecord',
  keySchema: nameSpaceSchema,
  valueSchema: createRecordSchema({
    target: 'NameSpacesRecord.Value',
    keySchema: dataElementIdentifierSchema,
    valueSchema: dataElementValueSchema,
  }),
});

export type NameSpacesRecord = z.output<typeof nameSpacesRecordSchema>;
