import { z } from 'zod';
import { bytesSchema } from '../common';

export const digestSchema = bytesSchema;

/**
 * ```cddl
 * Digest = bstr
 * ```
 */
export type Digest = z.infer<typeof digestSchema>;
