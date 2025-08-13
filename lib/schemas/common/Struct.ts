import { z } from 'zod';
import {
  MAP_INVALID_TYPE_MESSAGE_SUFFIX,
  MAP_REQUIRED_MESSAGE_SUFFIX,
} from './Map';

type CreateStructParams<O extends Record<string, unknown>, I = unknown> = {
  target: string;
  objectSchema: z.ZodType<O, z.ZodTypeDef, I>;
};

/**
 * Builds a Map-to-Object schema validated by an object schema.
 * @description
 * Accepts a `Map<string, unknown>`, converts it to a plain object, validates it
 * using the provided object schema, and returns the parsed object. Map
 * type/required errors are prefixed with `target` and use shared Map message
 * suffixes.
 *
 * Generics:
 * - O: Output object type produced by `objectSchema` (must extend `Record<string, unknown>`)
 * - I: Input type consumed by `objectSchema` (defaults to `unknown`), useful when the
 *      object schema performs transforms/refinements from a broader input
 *
 * Validation steps:
 * - Ensures input is a Map with string keys
 * - Converts Map -> plain object
 * - Validates using the provided object schema
 * - Returns the parsed object (type O)
 *
 * @param target - Prefix used in error messages (e.g., "DeviceAuth")
 * @param objectSchema - Zod object schema used for validation (may transform input I to output O)
 *
 * @example
 * ```typescript
 * const objSchema = z.object({ a: z.string(), b: z.number() });
 *
 * const schema = createStructSchema<{ a: string; b: number }, { a?: unknown; b?: unknown}>({
 *   target: 'MyStruct',
 *   objectSchema: objSchema,
 * });
 *
 * const result = schema.parse(new Map([
 *   ['a', 'hello'],
 *   ['b', 42],
 * ]));
 * // result is { a: string; b: number }
 * ```
 */
export const createStructSchema = <
  O extends Record<string, unknown>,
  I = unknown,
>({
  target,
  objectSchema,
}: CreateStructParams<O, I>): z.ZodType<
  O,
  z.ZodTypeDef,
  Map<string, unknown>
> =>
  z
    .map(z.string(), z.any(), {
      invalid_type_error: `${target}: ${MAP_INVALID_TYPE_MESSAGE_SUFFIX}`,
      required_error: `${target}: ${MAP_REQUIRED_MESSAGE_SUFFIX}`,
    })
    .transform((valueMap) => {
      const asObject = Object.fromEntries(valueMap);

      return objectSchema.parse(asObject);
    });
