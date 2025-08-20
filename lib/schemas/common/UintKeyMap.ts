import { createMapSchema } from '@/schemas/common/Map';
import { createUintSchema } from '@/schemas/common/Uint';
import { z } from 'zod';

/**
 * Creates a schema for validating Map structures with unsigned integer keys
 * @description
 * Generates a Zod schema that validates Map structures with unsigned integer keys and any values.
 * This is commonly used for CBOR headers and other structures that use numeric keys.
 * Empty maps are allowed by default.
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns A Zod schema that validates Map<number, unknown> structures
 *
 * @example
 * ```typescript
 * const unprotectedHeadersSchema = createUintKeyMapSchema('UnprotectedHeaders');
 *
 * const headers = new Map([[1, 'value'], [2, 42]]);
 * const result = protectedHeadersSchema.parse(headers); // Returns Map<number, unknown>
 * ```
 */
export const createUintKeyMapSchema = (
  target: string
): z.ZodType<Map<number, unknown>> =>
  createMapSchema({
    target,
    keySchema: createUintSchema('Key'),
    valueSchema: z.any(),
    allowEmpty: true,
  });
