import { z } from 'zod';

export const errorCodeSchema = z.number().int();

/**
 * ```cddl
 * ErrorCode = int
 * ```
 */
export type ErrorCode = z.infer<typeof errorCodeSchema>;
