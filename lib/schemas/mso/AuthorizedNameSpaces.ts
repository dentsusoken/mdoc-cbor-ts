import { z } from 'zod';
import { NameSpace, nameSpaceSchema } from '../common';

/**
 * Schema for authorized namespaces in MSO
 * @description
 * Represents an array of authorized namespaces.
 * This schema validates that the array contains at least one valid namespace.
 *
 * @example
 * ```typescript
 * const namespaces = ["org.iso.18013.5.1"];
 * const result = authorizedNameSpacesSchema.parse(namespaces); // Returns AuthorizedNameSpaces
 * ```
 */
export const authorizedNameSpacesSchema = z.array(nameSpaceSchema).nonempty();

/**
 * Type definition for authorized namespaces
 * @description
 * Represents a validated array of authorized namespaces
 *
 * ```cddl
 * AuthorizedNameSpaces = [+ NameSpace]
 * ```
 * @see {@link NameSpace}
 */
export type AuthorizedNameSpaces = z.infer<typeof authorizedNameSpacesSchema>;
