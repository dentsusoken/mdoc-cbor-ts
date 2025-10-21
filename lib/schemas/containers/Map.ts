import { z } from 'zod';
import { containerEmptyMessage } from '../messages/containerEmptyMessage';
import { containerInvalidValueMessage } from '../messages/containerInvalidValueMessage';
import { containerInvalidTypeMessage } from '../messages/containerInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

/**
 * Parameters for creating a map schema.
 *
 * @template K - The type of the map keys.
 * @template VO - The output type of the map values (after validation).
 * @template VI - The input type of the map values (before validation, defaults to VO).
 *
 * @property {string} target - The name of the target schema/context (used in error messages).
 * @property {z.ZodType<K>} keySchema - Zod schema that validates the map keys.
 * @property {z.ZodType<VO, z.ZodTypeDef, VI>} valueSchema - Zod schema that validates the map values.
 * @property {boolean} [nonempty] - Whether to require at least one map entry (default: false).
 */
type MapSchemaParams<K, VO, VI = VO> = {
  target: string;
  keySchema: z.ZodType<K>;
  valueSchema: z.ZodType<VO, z.ZodTypeDef, VI>;
  nonempty?: boolean;
};

/**
 * Creates a Zod schema for validating Map objects with controlled key and value types.
 *
 * @template K - The validated map key type.
 * @template VO - The validated (output) map value type.
 * @template VI - The input map value type (before validation, defaults to VO).
 *
 * @param {MapSchemaParams<K, VO, VI>} params - Map schema configuration options.
 * @returns {z.ZodType<Map<K, VO>, z.ZodTypeDef, Map<K, VI>>} Zod schema for Map<K, VO> output, accepting Map<K, VI> input.
 *
 * @example
 * const schema = createMapSchema({
 *   target: 'MyMap',
 *   keySchema: z.string(),
 *   valueSchema: z.number(),
 *   nonempty: true
 * });
 * const valid = schema.parse(new Map([['foo', 42]])); // Map<string, number>
 *
 * // Error on empty map if nonempty: true
 * schema.parse(new Map()); // throws ZodError with context-specific message
 *
 * // Error on invalid key/value types is scoped and context-rich
 */
export const createMapSchema = <K, VO, VI = VO>({
  target,
  keySchema,
  valueSchema,
  nonempty = false,
}: MapSchemaParams<K, VO, VI>): z.ZodType<
  Map<K, VO>,
  z.ZodTypeDef,
  Map<K, VI>
> =>
  z.any().transform((data, ctx) => {
    if (!(data instanceof Map)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: containerInvalidTypeMessage({
          target,
          expected: 'Map',
          received: getTypeName(data),
        }),
      });

      return z.NEVER;
    }

    const entries = [...data.entries()];

    if (nonempty && entries.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: containerEmptyMessage(target),
      });

      return z.NEVER;
    }

    let hasError = false;
    const output = new Map<K, VO>();

    entries.forEach(([key, value], index) => {
      const keyResult = keySchema.safeParse(key);
      if (!keyResult.success) {
        hasError = true;
        keyResult.error.issues.forEach((issue) => {
          const path = [index, 'key', ...issue.path];
          ctx.addIssue({
            ...issue,
            path,
            message: containerInvalidValueMessage({
              target,
              path,
              originalMessage: issue.message,
            }),
          });
        });
      }

      const valueResult = valueSchema.safeParse(value);
      if (!valueResult.success) {
        hasError = true;
        valueResult.error.issues.forEach((issue) => {
          const path = [index, 'value', ...issue.path];
          ctx.addIssue({
            ...issue,
            path,
            message: containerInvalidValueMessage({
              target,
              path,
              originalMessage: issue.message,
            }),
          });
        });
      }

      if (keyResult.success && valueResult.success) {
        output.set(keyResult.data, valueResult.data);
      }
    });

    if (hasError) {
      return z.NEVER;
    }

    return output;
  }) as unknown as z.ZodType<Map<K, VO>, z.ZodTypeDef, Map<K, VI>>;
