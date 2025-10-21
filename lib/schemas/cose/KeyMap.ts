import { createMapSchema } from '@/schemas/containers/Map';
import { Key } from '@/cose/types';
import { z } from 'zod';

/**
 * Zod schema for a COSE Key Map.
 * Keys are restricted to the Key enum, and values can be of any type.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createKeyMapSchema = (target: string) =>
  createMapSchema({
    target,
    keySchema: z.nativeEnum(Key),
    valueSchema: z.unknown(),
  });
