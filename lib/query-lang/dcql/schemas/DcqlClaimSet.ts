import { z } from 'zod';

/**
 * Zod schema for a DCQL Claim Set.
 *
 * Represents a non-empty array of non-empty strings, where each string
 * designates a claim path or identifier. Used to specify which claims
 * are requested or required in a particular context.
 *
 * Example:
 *   ["org.iso.18013.5.1.mDL.given_name", "org.iso.18013.5.1.mDL.family_name"]
 */
export const dcqlClaimSetSchema = z.array(z.string().min(1)).min(1);
