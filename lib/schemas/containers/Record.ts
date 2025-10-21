import { z } from 'zod';
import { containerEmptyMessage } from '../messages/containerEmptyMessage';
import { containerInvalidValueMessage } from '../messages/containerInvalidValueMessage';
import { containerInvalidTypeMessage } from '../messages/containerInvalidTypeMessage';
import { getTypeName } from '@/utils/getTypeName';

type CreateRecordSchemaParams<K extends string | number, VO, VI = VO> = {
  target: string;
  keySchema: z.ZodType<K>;
  valueSchema: z.ZodType<VO, z.ZodTypeDef, VI>;
  nonempty?: boolean;
};

export const createRecordSchema = <K extends string | number, VO, VI = VO>({
  target,
  keySchema,
  valueSchema,
  nonempty = false,
}: CreateRecordSchemaParams<K, VO, VI>): z.ZodType<
  Record<K, VO>,
  z.ZodTypeDef,
  Record<K, VI>
> =>
  z.any().transform((data, ctx) => {
    const received = getTypeName(data);
    if (received !== 'object') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: containerInvalidTypeMessage({
          target,
          expected: 'object',
          received,
        }),
      });

      return z.NEVER;
    }

    const entries = Object.entries(data);

    if (nonempty && entries.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: containerEmptyMessage(target),
      });

      return z.NEVER;
    }

    let hasError = false;
    const output = {} as Record<K, VO>;

    entries.forEach(([key, value]) => {
      const keyResult = keySchema.safeParse(key);
      if (!keyResult.success) {
        hasError = true;
        keyResult.error.issues.forEach((issue) => {
          const path = [key as string | number, ...issue.path];
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
          const path = [key as string | number, ...issue.path];
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
        output[keyResult.data] = valueResult.data;
      }
    });

    if (hasError) {
      return z.NEVER;
    }

    return output;
  }) as unknown as z.ZodType<Record<K, VO>, z.ZodTypeDef, Record<K, VI>>;
