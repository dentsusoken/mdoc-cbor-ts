import { createMapSchema } from '@/schemas/containers/Map';
import { Key } from '@/cose/types';
import { z } from 'zod';

/**
 * Zod schema for a COSE Key Map.
 * Keys are restricted to the Key enum, and values can be of any type.
 */
export const keyMapSchema = createMapSchema({
  target: 'KeyMap',
  keySchema: z.nativeEnum(Key),
  valueSchema: z.unknown(),
});

/**
 * Type representing the validated output of a COSE Key Map.
 */
export type KeyMap = z.output<typeof keyMapSchema>;
