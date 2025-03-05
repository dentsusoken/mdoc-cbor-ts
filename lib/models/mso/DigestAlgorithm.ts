import { z } from 'zod';

export const digestAlgorithmSchema = z.enum(['SHA-256', 'SHA-384', 'SHA-512']);

export type DigestAlgorithm = z.infer<typeof digestAlgorithmSchema>;
