import { z } from 'zod';
import { numberKeySchema } from './NumberKey';

/**
 * Schema for validating number maps in MSO
 * @description
 * Represents a map with number keys that can be provided as an object or Map.
 * This schema validates and normalizes the map format to ensure consistent
 * representation as a Map with number keys.
 *
 * ```cddl
 * NumberMap = {+ NumberKey => any}
 * ```
 *
 * @example
 * ```typescript
 * // Using object with string keys
 * const objMap = { "1": "value1", "2": "value2" };
 * const result1 = numberMapSchema.parse(objMap); // Returns Map<number, unknown>
 *
 * // Using Map directly
 * const mapData = new Map([[1, "value1"], [2, "value2"]]);
 * const result2 = numberMapSchema.parse(mapData); // Returns Map<number, unknown>
 * ```
 */
export const numberMapSchema = z.union(
  [
    z.record(numberKeySchema, z.unknown()).transform((obj) => {
      const entries: [number, unknown][] = Object.entries(obj).map(
        ([key, value]) => [Number(key), value]
      );
      return new Map(entries);
    }),
    z.map(numberKeySchema, z.unknown()),
  ],
  {
    errorMap: () => ({
      message: 'NumberMap: Please provide a valid number map (object or Map)',
    }),
  }
);

/**
 * Type definition for number maps
 * @description
 * Represents a validated map with number keys that has been normalized
 * through the numberMapSchema. The output is always a Map<number, unknown>.
 *
 * ```cddl
 * NumberMap = {+ NumberKey => any}
 * ```
 */
export type NumberMap = z.output<typeof numberMapSchema>;
