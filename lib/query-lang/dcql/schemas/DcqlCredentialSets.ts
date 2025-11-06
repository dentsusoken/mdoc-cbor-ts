import { z } from 'zod';

/**
 * Zod schema for DCQL Credential Sets.
 *
 * This schema represents a non-empty array of credential sets,
 * where each credential set is itself an array of non-negative integers.
 * Each integer typically represents an index or reference to a credential
 * in a separate credentials array.
 *
 * Example:
 *   [
 *     [0, 1],   // First set: credentials at index 0 and 1
 *     [2]       // Second set: credential at index 2
 *   ]
 */
export const dcqlCredentialSetsSchema = z
  .array(z.array(z.number().int().nonnegative()))
  .min(1);
