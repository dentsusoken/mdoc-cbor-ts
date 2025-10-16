import { z } from 'zod';
import { createRecordSchema } from '../common/Record';
import { nameSpaceSchema } from '../common/NameSpace';
import { dataElementIdentifierSchema } from '../common/values/DataElementIdentifier';
import { dataElementValueSchema } from '../common/DataElementValue';

/**
 * Schema for namespaces containing data elements
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
 * Error messages are prefixed with the target name: `NameSpaceElements: ...`.
 *
 * ```cddl
 * NameSpaceElements = {
 *   + NameSpace => {
 *     + DataElementIdentifier => DataElementValue
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * const nameSpaceElements = {
 *   'org.iso.18013.5.1': {
 *     'given_name': 'John',
 *     'family_name': 'Doe'
 *   }
 * };
 * const result = nameSpaceElementsSchema.parse(nameSpaceElements); // Returns NameSpaceElements
 * ```
 *
 * @see {@link NameSpace}
 * @see {@link DataElementIdentifier}
 * @see {@link DataElementValue}
 */
export const nameSpaceElementsSchema = createRecordSchema({
  target: 'NameSpaceElements',
  keySchema: nameSpaceSchema,
  valueSchema: createRecordSchema({
    target: 'NameSpaceElements.Value',
    keySchema: dataElementIdentifierSchema,
    valueSchema: dataElementValueSchema,
  }),
});

/**
 * Type representing a record of namespaces to data element records
 * @description
 * A record where each key is a namespace and each value is a record of data element identifiers
 * to their corresponding values. This type is inferred from the `nameSpaceElementsSchema`.
 */
export type NameSpaceElements = z.output<typeof nameSpaceElementsSchema>;
