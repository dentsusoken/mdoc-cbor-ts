import { z } from 'zod';

/**
 * Schema for digest algorithm in MSO
 * @description
 * Represents the supported digest algorithms for MSO.
 * This schema validates that the algorithm is one of the predefined values.
 *
 * @example
 * ```typescript
 * const algorithm = "SHA-256";
 * const result = digestAlgorithmSchema.parse(algorithm); // Returns DigestAlgorithm
 * ```
 */
export const digestAlgorithmSchema = z.enum(['SHA-256', 'SHA-384', 'SHA-512']);

/**
 * Type definition for digest algorithm
 * @description
 * Represents a validated digest algorithm
 */
export type DigestAlgorithm = z.infer<typeof digestAlgorithmSchema>;
