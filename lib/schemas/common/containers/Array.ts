import { z } from 'zod';
import { getTypeName } from '@/utils/getTypeName';
import { containerInvalidValueMessage } from '../messages/containerInvalidValueMessage';
import { containerInvalidTypeMessage } from '../messages/containerInvalidTypeMessage';
import { containerEmptyMessage } from '../messages/containerEmptyMessage';

/**
 * Parameters for creating an array schema with validation.
 *
 * @template Output The type of the data output by each item after validation.
 * @template Input The input type for each item before validation. Defaults to Output.
 */
type CreateArraySchemaParams<Output, Input = Output> = {
  /**
   * A string label for the target array, used in error messages.
   */
  target: string;
  /**
   * The Zod schema for validating individual items of the array.
   */
  itemSchema: z.ZodType<Output, z.ZodTypeDef, Input>;
  /**
   * If true, the schema will reject empty arrays.
   * @default false
   */
  nonempty?: boolean;
};

/**
 * Creates a Zod schema for arrays with detailed custom error messages.
 *
 * - Rejects values that are not arrays with a custom error.
 * - Optionally rejects empty arrays (when nonempty is true).
 * - Provides scoped, context-rich error messages for invalid items.
 *
 * @template Output The output type of validated items (and array).
 * @template Input The input type of array items (defaults to Output).
 * @param params The schema options, including `target`, `itemSchema`, and `nonempty`.
 * @returns A Zod array schema that parses arrays of validated items.
 *
 * @example
 * const schema = createArraySchema({ target: 'Tags', itemSchema: z.string(), nonempty: true });
 */
export const createArraySchema = <Output, Input = Output>({
  target,
  itemSchema,
  nonempty = false,
}: CreateArraySchemaParams<Output, Input>): z.ZodType<
  Output[],
  z.ZodTypeDef,
  Input[]
> =>
  z.any().transform((data, ctx) => {
    if (!(data instanceof Array)) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: containerInvalidTypeMessage({
          target,
          expected: 'array',
          received: getTypeName(data),
        }),
      });
    }

    if (nonempty && data.length === 0) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: containerEmptyMessage(target),
      });
    }

    let hasError = false;
    const output = [] as Output[];

    data.forEach((item, index) => {
      const result = itemSchema.safeParse(item);
      if (!result.success) {
        hasError = true;
        for (const issue of result.error.issues) {
          const path = [index, ...issue.path];
          ctx.addIssue({
            ...issue,
            path,
            message: containerInvalidValueMessage(target, path, issue.message),
          });
        }
      } else {
        output.push(result.data);
      }
    });

    if (hasError) {
      return z.NEVER;
    }

    return output;
  }) as unknown as z.ZodType<Output[], z.ZodTypeDef, Input[]>;
