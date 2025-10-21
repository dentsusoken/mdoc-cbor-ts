import { z } from 'zod';
import { createArraySchema } from '@/schemas/containers/Array';

/**
 * Schema for authorized namespaces in MSO
 * @description
 * Represents an array of authorized namespaces.
 * This schema validates that the array contains at least one valid namespace.
 *
 * ```cddl
 * AuthorizedNameSpaces = [+ NameSpace]
 * ```
 *
 * @example
 * ```typescript
 * const namespaces = ["org.iso.18013.5.1"];
 * const result = authorizedNameSpacesSchema.parse(namespaces); // Returns AuthorizedNameSpaces
 * ```
 */
export const authorizedNameSpacesSchema = createArraySchema({
  target: 'AuthorizedNameSpaces',
  itemSchema: z.string().min(1),
  nonempty: true,
});

/**
 * Type definition for authorized namespaces
 * @description
 * Represents a validated array of authorized namespaces
 *
 * @see {@link NameSpace}
 */
export type AuthorizedNameSpaces = z.output<typeof authorizedNameSpacesSchema>;
