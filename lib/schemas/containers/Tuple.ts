import { z } from 'zod';
import { getTypeName } from '@/utils/getTypeName';
import { containerInvalidValueMessage } from '../messages/containerInvalidValueMessage';
import { containerInvalidTypeMessage } from '../messages/containerInvalidTypeMessage';

/**
 * Parameters for creating a tuple schema.
 *
 * @template T - The tuple type to validate.
 * @property {string} target - The name of the target schema/context (used in error messages).
 * @property itemSchemas - A tuple (as an object) of Zod schemas, one for each position in the tuple.
 */
type CreateTupleSchemaParams<T extends readonly unknown[]> = {
  target: string;
  itemSchemas: { [K in keyof T]: z.ZodType<T[K]> };
};

/**
 * Creates a Zod schema for validating a fixed-length tuple with typed elements.
 *
 * @template T - The output tuple type, e.g., [number, string, boolean]
 * @param {CreateTupleSchemaParams<T>} params - The tuple schema parameters.
 * @returns {z.ZodType<T, z.ZodTypeDef, unknown>} A Zod schema that parses the input as the desired tuple.
 *
 * @example
 * const schema = createTupleSchema({
 *   target: 'Pair',
 *   itemSchemas: [z.number(), z.string()] as const
 * });
 * const out = schema.parse([1, "foo"]); // out: readonly [number, string]
 *
 * // Error when shape or types do not match:
 * schema.parse([1, 2]); // ZodError with context-specific messages
 */
export const createTupleSchema = <T extends readonly unknown[]>({
  target,
  itemSchemas,
}: CreateTupleSchemaParams<T>): z.ZodType<T, z.ZodTypeDef, unknown> =>
  z.any().transform((data, ctx) => {
    if (!Array.isArray(data)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: containerInvalidTypeMessage({
          target,
          expected: 'Array',
          received: getTypeName(data),
        }),
      });
      return z.NEVER;
    }

    const innerSchema = z.tuple(
      Object.values(itemSchemas) as unknown as [z.ZodTypeAny, ...z.ZodTypeAny[]]
    );
    const result = innerSchema.safeParse(data);

    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({
          ...issue,
          message: containerInvalidValueMessage({
            target,
            path: issue.path,
            originalMessage: issue.message,
          }),
        });
      }
      return z.NEVER;
    }
    return result.data as unknown as T;
  }) as unknown as z.ZodType<T, z.ZodTypeDef, unknown>;
