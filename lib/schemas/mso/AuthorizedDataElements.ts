import { z } from 'zod';
import { Entry, nameSpaceSchema } from '../common';
import {
  DataElementsArray,
  dataElementsArraySchema,
} from './DataElementsArray';

/**
 * Schema for authorized data elements in MSO
 * @description
 * Represents a record of namespaces and their corresponding authorized data elements.
 * This schema validates that each namespace maps to valid data element arrays.
 *
 * @example
 * ```typescript
 * const elements = {
 *   "org.iso.18013.5.1": ["given_name", "family_name"]
 * };
 * const result = authorizedDataElementsSchema.parse(elements); // Returns AuthorizedDataElements
 * ```
 */
export const authorizedDataElementsSchema = z.record(
  nameSpaceSchema,
  dataElementsArraySchema
);

/**
 * Type definition for authorized data elements
 * @description
 * Represents a validated record of namespaces and their authorized data elements
 *
 * ```cddl
 * AuthorizedDataElements = {+ NameSpace => DataElementsArray}
 * ```
 * @see {@link DataElementsArray}
 */
export type AuthorizedDataElements = z.infer<
  typeof authorizedDataElementsSchema
>;

/**
 * Type definition for authorized data elements entries
 * @description
 * Represents a key-value pair from the authorized data elements record
 */
export type AuthorizedDataElementsEntry = Entry<AuthorizedDataElements>;
