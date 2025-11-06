import { z } from 'zod';

/**
 * Zod schema for a filter object used within a PresentationDefinition field.
 *
 * This schema is shaped after JSON Schema filter patterns, specifically as defined by Presentation Exchange.
 * It is applied to restrict or validate field values for selective disclosure and input descriptor filtering.
 *
 * Supported properties:
 * - `type`: (optional) A string indicating the expected value type, such as "string", "number", or "boolean".
 *           If omitted, any type is permitted.
 * - `const`: (optional) If defined, the field value must match this constant exactly.
 * - `enum`: (optional) An array of accepted values; if provided, the field value must be one of these.
 *
 * This structure aligns with the Presentation Exchange specification and builds on
 * conventions from JSON Schema, allowing implementers to define strict field constraints
 * for verifiable presentations.
 *
 * @see https://identity.foundation/presentation-exchange/#filter
 */
export const pexFilterSchema: z.ZodTypeAny = z
  .object({
    /**
     * (optional) The expected type for the field value.
     * Common examples: "string", "number", "boolean".
     * When omitted, the value type is not restricted.
     */
    type: z.string().optional(),

    /**
     * (optional) A constant value. When specified, field value must equal this.
     */
    const: z.unknown().optional(),

    /**
     * (optional) An array of allowed values. When specified, the value must be
     * one of these.
     */
    enum: z.array(z.unknown()).optional(),
  })
  .strict();
