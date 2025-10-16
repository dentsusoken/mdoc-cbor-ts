import { z } from 'zod';
import { mapInvalidTypeMessage } from './container/Map';
import { createRequiredSchema } from './Required';

type CreateStructParams<O extends Record<string, unknown>, I = unknown> = {
  target: string;
  objectSchema: z.ZodType<O, z.ZodTypeDef, I>;
};

const createStructInnerSchema = <
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
      invalid_type_error: mapInvalidTypeMessage(target),
    })
    .transform((valueMap) => {
      const asObject = Object.fromEntries(valueMap);

      return objectSchema.parse(asObject);
    });

/**
 * Creates a schema that validates a Map input against an object schema
 * @description
 * This function creates a Zod schema that accepts a `Map<string, unknown>`, converts it to a plain object,
 * validates it using the provided object schema, and returns the parsed object. Map validation errors
 * are prefixed with the target name and use shared Map message suffixes.
 *
 * @template O - Output object type produced by `objectSchema` (must extend `Record<string, unknown>`)
 * @template I - Input type consumed by `objectSchema` (defaults to `unknown`), useful when the
 *               object schema performs transforms/refinements from a broader input type
 *
 * @param params - Configuration object
 * @param params.target - Name used in error messages (e.g., "DeviceAuth")
 * @param params.objectSchema - Zod object schema used for validation (may transform input I to output O)
 *
 * @returns A Zod schema that validates Map<string, unknown> input and returns type O
 *
 * @example
 * ```typescript
 * const objSchema = z.object({ a: z.string(), b: z.number() });
 *
 * const schema = createStructSchema({
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
  createRequiredSchema(target).pipe(
    createStructInnerSchema({ target, objectSchema })
  );
