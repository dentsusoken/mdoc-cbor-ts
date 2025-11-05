import { z } from 'zod';
import { pexFilterSchema } from './PExFilter';

/**
 * Zod schema for a Presentation Exchange (PEx) field definition.
 *
 * This schema defines a field (claim requirement) to be referenced in input descriptors.
 *
 * Properties:
 * - `path` (string[]): **Required.** An array of JSONPath strings, each identifying a location within a credential where the field's value may be found. At least one path is required.
 * - `intent_to_retain` (boolean): **Optional.** Indicates whether the holder intends to retain this claim after presentation. Defaults to `false`.
 * - `filter` (object): **Optional.** Restrictions on the claim's value, as defined by JSON Schema-like filtering (see {@link pexFilterSchema}).
 *
 * ### Note: `optional` property is not included
 * In our implementation, PEx is converted to DCQL. Since DCQL does not have an equivalent feature for the `optional` property, we have removed it from this schema. During conversion from PEx to DCQL, all fields (both required and optional) are included in the DCQL `claims` array. The Wallet returns only claims that exist, and the Verifier validates based on the original PEx `optional` flags to determine if missing claims are acceptable.
 *
 * @see https://identity.foundation/presentation-exchange/#presentation-definition
 */
export const pexFieldSchema = z
  .object({
    /**
     * Array of JSONPath strings specifying where to extract the claim value from.
     * Must contain at least one path.
     */
    path: z.array(z.string()).min(1),
    /**
     * Indicates if the holder intends to retain the claim after presentation.
     * Defaults to `false`.
     */
    intent_to_retain: z.boolean().default(false),
    /**
     * Filter constraints (if any), restricting the claim to certain types, constants, or enums.
     * See PExFilter for details.
     */
    filter: pexFilterSchema.optional(),
  })
  .strict();

/**
 * Type representing a Presentation Exchange field, as inferred from {@link pexFieldSchema}.
 */
export type PExField = z.output<typeof pexFieldSchema>;
