import { z } from 'zod';
import { createRecordSchema } from '@/schemas/common/Record';
import { docTypeSchema } from '@/schemas/common/DocType';
import { createNameSpaceElementIdentifiersSchema } from './NameSpaceElementIdentifiers';

/**
 * Schema for document types containing namespace element identities
 * @description
 * Validates a required, non-empty record of `DocType` to nested records of
 * `NameSpace` to `DataElementIdentifiers`. This represents a hierarchical structure
 * where each document type contains multiple namespaces with their respective
 * arrays of data element identifiers.
 *
 * Validation rules:
 * - Requires input to be a record
 * - Disallows empty records (at least one document type is required)
 * - Keys must satisfy {@link DocType}
 * - Values must be non-empty records where:
 *   - Keys must satisfy {@link NameSpace}
 *   - Values must satisfy {@link DataElementIdentifiers}
 *
 * Error messages are prefixed with the target name: `DocTypeNamespaceElementIdentities: ...`.
 *
 * ```cddl
 * DocTypeNamespaceElementIdentities = {
 *   + DocType => {
 *     + NameSpace => DataElementIdentifiers
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * const docTypeNamespaceElementIdentities = {
 *   'org.iso.18013.5.1.mDL': {
 *     'org.iso.18013.5.1': [
 *       'given_name',
 *       'family_name'
 *     ]
 *   }
 * };
 * const result = docTypeNameSpaceElementIdentitiesSchema.parse(docTypeNamespaceElementIdentities); // Returns DocTypeNamespaceElementIdentities
 * ```
 *
 * @see {@link DocType}
 * @see {@link NameSpace}
 * @see {@link DataElementIdentifiers}
 */
export const docTypeNameSpaceElementIdentitiesSchema = createRecordSchema({
  target: 'DocTypeNamespaceElementIdentities',
  keySchema: docTypeSchema,
  valueSchema: createNameSpaceElementIdentifiersSchema(
    'DocTypeNamespaceElementIdentities.Value'
  ),
});

/**
 * Type representing a record of document types to namespace element identities
 * @description
 * A record where each key is a document type and each value is a record of namespaces
 * to arrays of data element identifiers. This type is inferred from the
 * `docTypeNameSpaceElementIdentitiesSchema`.
 */
export type DocTypeNameSpaceElementIdentities = z.output<
  typeof docTypeNameSpaceElementIdentitiesSchema
>;
