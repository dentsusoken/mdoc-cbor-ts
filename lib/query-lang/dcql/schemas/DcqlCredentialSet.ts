import { z } from 'zod';

/**
 * Zod schema for a DCQL Credential Set.
 *
 * Represents a set of credential options with a required flag.
 * Each option is a non-empty array of non-empty strings, where each string
 * designates a credential ID. Used to specify which credentials
 * are requested or required together in a credential set.
 *
 * - `options`: A non-empty array of credential set options. Each option is
 *   a non-empty array of non-empty strings representing credential IDs.
 * - `required`: A boolean indicating whether this credential set is required.
 *   Defaults to true.
 *
 * Example:
 *   {
 *     options: [
 *       ["credential-1", "credential-2"],
 *       ["credential-3"]
 *     ],
 *     required: true
 *   }
 */
export const dcqlCredentialSetSchema = z.object({
  options: z.array(z.array(z.string().min(1)).min(1)).min(1),
  required: z.boolean().default(true),
});
