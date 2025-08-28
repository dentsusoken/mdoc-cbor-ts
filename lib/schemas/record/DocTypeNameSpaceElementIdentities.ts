import { z } from 'zod';
import { createRecordSchema } from '@/schemas/common/Record';
import { dataElementsArraySchema } from '@/schemas/mso/DataElementsArray';
import { docTypeSchema } from '@/schemas/common/DocType';
import { nameSpaceSchema } from '../common';

/**
 * Schema for document types containing namespace element identities records
 * @description
 * Validates a required, non-empty record of `DocType` to nested records of
 * `NameSpace` to `DataElementsArray`. This represents a hierarchical structure
 * where each document type contains multiple namespaces with their respective
 * arrays of data element identifiers.
 *
 * Validation rules:
 * - Requires input to be a record
 * - Disallows empty records (at least one document type is required)
 * - Keys must satisfy {@link DocType}
 * - Values must be non-empty records where:
 *   - Keys must satisfy {@link NameSpace}
 *   - Values must satisfy {@link DataElementsArray}
 *
 * Error messages are prefixed with the target name: `DocTypeNamespaceElementIdentitiesRecord: ...`.
 *
 * ```cddl
 * DocTypeNamespaceElementIdentitiesRecord = {
 *   + DocType => {
 *     + NameSpace => DataElementsArray
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * const docTypeNamespaceElementIdentitiesRecord = {
 *   'org.iso.18013.5.1.mDL': {
 *     'org.iso.18013.5.1': [
 *       'given_name',
 *       'family_name'
 *     ]
 *   }
 * };
 * const result = docTypeNamespaceElementIdentitiesRecordSchema.parse(docTypeNamespaceElementIdentitiesRecord); // Returns DocTypeNamespaceElementIdentitiesRecord
 * ```
 *
 * @see {@link DocType}
 * @see {@link NameSpace}
 * @see {@link DataElementsArray}
 */
export const docTypeNamespaceElementIdentitiesRecordSchema = createRecordSchema(
  {
    target: 'DocTypeNamespaceElementIdentitiesRecord',
    keySchema: docTypeSchema,
    valueSchema: createRecordSchema({
      target: 'DocTypeNamespaceElementIdentitiesRecord.Value',
      keySchema: nameSpaceSchema,
      valueSchema: dataElementsArraySchema,
    }),
  }
);

/**
 * Type representing a record of document types to namespace element identities records
 * @description
 * A record where each key is a document type and each value is a record of namespaces
 * to arrays of data element identifiers. This type is inferred from the
 * `docTypeNamespaceElementIdentitiesRecordSchema`.
 */
export type DocTypeNamespaceElementIdentitiesRecord = z.output<
  typeof docTypeNamespaceElementIdentitiesRecordSchema
>;
