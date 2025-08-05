import { z } from 'zod';

/**
 * Schema for validating number keys in MSO
 * @description
 * Represents a positive integer that can be provided as a number or string.
 * This schema validates and normalizes the key format.
 *
 * ```cddl
 * NumberKey = uint
 * ```
 */
export const numberKey = z.union([
  z.number().int().positive(),
  z
    .string()
    .regex(/^\d+$/)
    .transform((s) => Number(s))
    .refine((n) => n > 0, {
      message: 'Number must be greater than 0',
    }),
]);

/**
 * Schema for validating number maps in MSO
 * @description
 * Represents a map with number keys that can be provided as an object or Map.
 * This schema validates and normalizes the map format.
 *
 * ```cddl
 * NumberMap = {+ NumberKey => any}
 * ```
 */
export const numberMap = z.union([
  z.record(numberKey, z.unknown()).transform((obj) => {
    const entries: [number, unknown][] = Object.entries(obj).map(
      ([key, value]) => [Number(key), value]
    );
    return new Map(entries);
  }),
  z.map(numberKey, z.unknown()),
]);
