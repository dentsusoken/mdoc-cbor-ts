import { z } from 'zod';

/**
 * Schema for data element values
 * @description
 * Represents any valid value that can be assigned to a data element.
 * This schema accepts any value type as defined in the mdoc specification.
 *
 * @example
 * ```typescript
 * const validValue = "John Doe";
 * const result = dataElementValueSchema.parse(validValue); // Returns any
 * ```
 */
export const dataElementValueSchema = z.any();

/**
 * Type definition for data element values
 * @description
 * Represents any valid value type that can be assigned to a data element
 *
 * ```cddl
 * DataElementValue = any
 * ```
 */
export type DataElementValue = z.infer<typeof dataElementValueSchema>;
