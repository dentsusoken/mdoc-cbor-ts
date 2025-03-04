import { z } from 'zod';
import { bytesSchema } from '../common';

export const digestSchema = bytesSchema;

export type Digest = z.infer<typeof digestSchema>;
