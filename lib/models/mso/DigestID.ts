import { z } from 'zod';

export const digestIDSchema = z.string();

export type DigestID = z.infer<typeof digestIDSchema>;
