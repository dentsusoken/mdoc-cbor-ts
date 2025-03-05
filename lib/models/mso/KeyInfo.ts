import { z } from 'zod';
import { Entry } from '../common';

export const keyInfoSchema = z.record(z.string(), z.any());

/**
 * ```cddl
 * KeyInfo = {* int => any}
 * ```
 */
export type KeyInfo = z.infer<typeof keyInfoSchema>;
export type KeyInfoEntry = Entry<KeyInfo>;
