import { z } from 'zod';
import { containerEmptyMessage } from '../messages/containerEmptyMessage';
import { containerInvalidValueMessage } from '../messages/containerInvalidValueMessage';
import { containerInvalidTypeMessage } from '../messages/containerInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

type MapSchemaParams<K, VO, VI = VO> = {
  target: string;
  keySchema: z.ZodType<K>;
  valueSchema: z.ZodType<VO, z.ZodTypeDef, VI>;
  nonempty?: boolean;
};

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
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: containerInvalidTypeMessage({
          target,
          expected: 'map',
          received: getTypeName(data),
        }),
      });
    }

    const entries = [...data.entries()];

    if (nonempty && entries.length === 0) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: containerEmptyMessage(target),
      });
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
            message: containerInvalidValueMessage(target, path, issue.message),
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
            message: containerInvalidValueMessage(target, path, issue.message),
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
