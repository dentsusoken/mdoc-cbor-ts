import { z } from 'zod';

export const nameSpaceSchema = z.string();

export type NameSpace = z.infer<typeof nameSpaceSchema>;
