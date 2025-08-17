import { createMapSchema } from '@/schemas/common/Map';
import { createUintSchema } from '@/schemas/common/Uint';
import { z } from 'zod';

/**
 * Creates a schema for validating CBOR headers
 * @description
 * Generates a Zod schema that validates Map structures used for CBOR headers.
 * Headers are represented as Maps with unsigned integer keys and any values.
 * Empty maps are allowed.
 *
 * @param target - The name of the target schema (used in error messages)
 * @returns A Zod schema that validates Map<number, unknown> structures
 *
 * @example
 * ```typescript
 * const protectedHeadersSchema = createdHeadersSchema('ProtectedHeaders');
 * const unprotectedHeadersSchema = createdHeadersSchema('UnprotectedHeaders');
 *
 * const headers = new Map([[1, 'value'], [2, 42]]);
 * const result = protectedHeadersSchema.parse(headers); // Returns Map<number, unknown>
 * ```
 */
export const createdHeadersSchema = (
  target: string
): z.ZodType<Map<number, unknown>> =>
  createMapSchema({
    target,
    keySchema: createUintSchema('Key'),
    valueSchema: z.any(),
    allowEmpty: true,
  });
