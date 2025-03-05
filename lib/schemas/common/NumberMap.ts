import { z } from 'zod';
// TODO: test
/**
 * Schema for validating number keys in MSO
 * @description
 * Represents a positive integer that can be provided as a number or string.
 * This schema validates and normalizes the key format.
 */
export const numberKey = z.union([
  z.number().int().positive(),
  z
    .string()
    .regex(/^\d+$/)
    .transform((s) => Number(s)),
]);

/**
 * Schema for validating number maps in MSO
 * @description
 * Represents a map with number keys that can be provided as an object or Map.
 * This schema validates and normalizes the map format.
 */
export const numberMap = z.union([
  z.record(numberKey, z.any()).transform((obj) => {
    const entries: [number, any][] = Object.entries(obj).map(([key, value]) => [
      Number(key),
      value,
    ]);
    return new Map(entries);
  }),
  z.map(numberKey, z.any()),
]);
