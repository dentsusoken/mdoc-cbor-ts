import { z } from 'zod';
import { RawNameSpaces } from '../../schemas';

export type NameSpacesToJSONHandler<T> = (
  nameSpaces: RawNameSpaces
) => Promise<T>;

export const createNameSpacesToJSONHandler = <T>(
  schema: z.ZodSchema<T>
): NameSpacesToJSONHandler<T> => {
  return async (nameSpaces: RawNameSpaces) => {
    const result = Object.entries(nameSpaces).map(([key, tags]) => {
      return {
        [key]: tags.map((tag) => ({
          [tag.value.elementIdentifier]: tag.value.elementValue,
        })),
      };
    });
    return schema.parse(result);
  };
};
