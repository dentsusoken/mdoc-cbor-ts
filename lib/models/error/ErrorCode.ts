import { z } from 'zod';

export const errorCodeSchema = z.number().int();

export type ErrorCode = z.infer<typeof errorCodeSchema>;
