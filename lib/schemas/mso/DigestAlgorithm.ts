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
export const ALLOWED_DIGEST_ALGORITHMS = [
  'SHA-256',
  'SHA-384',
  'SHA-512',
] as const;

export const DIGEST_ALGORITHM_INVALID_TYPE_MESSAGE =
  'DigestAlgorithm: Expected a string value ("SHA-256", "SHA-384", or "SHA-512").';
export const DIGEST_ALGORITHM_REQUIRED_MESSAGE =
  'DigestAlgorithm: This field is required. Please provide a digest algorithm("SHA-256", "SHA-384", or "SHA-512").';
export const DIGEST_ALGORITHM_INVALID_VALUE_MESSAGE =
  'DigestAlgorithm: Invalid algorithm. Allowed values are "SHA-256", "SHA-384", "SHA-512".';

export const digestAlgorithmSchema = z
  .string({
    invalid_type_error: DIGEST_ALGORITHM_INVALID_TYPE_MESSAGE,
    required_error: DIGEST_ALGORITHM_REQUIRED_MESSAGE,
  })
  .refine((v) => (ALLOWED_DIGEST_ALGORITHMS as readonly string[]).includes(v), {
    message: DIGEST_ALGORITHM_INVALID_VALUE_MESSAGE,
  });

/**
 * Type definition for digest algorithm
 * @description
 * Represents a validated digest algorithm
 */
export type DigestAlgorithm = (typeof ALLOWED_DIGEST_ALGORITHMS)[number];
