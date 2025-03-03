import { z } from 'zod';
import { Entry } from '../common';

export const keyInfoSchema = z.map(z.string(), z.any());

export type KeyInfo = z.infer<typeof keyInfoSchema>;
export type KeyInfoEntry = Entry<KeyInfo>;
