import { z } from 'zod';

export const docTypeSchema = z.string();

export type DocType = z.infer<typeof docTypeSchema>;
