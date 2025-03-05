import { z } from 'zod';

export const dataElementValueSchema = z.any();

/**
 * ```cddl
 * DataElementValue = any
 * ```
 */
export type DataElementValue = z.infer<typeof dataElementValueSchema>;
