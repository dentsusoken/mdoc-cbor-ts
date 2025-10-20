import { createMapSchema } from '@/schemas/containers/Map';
import { Header } from '@/cose/types';
import { z } from 'zod';

/**
 * Zod schema for a COSE Header Map.
 * Keys are restricted to the Header enum, and values can be of any type.
 */
export const headerMapSchema = createMapSchema({
  target: 'HeaderMap',
  keySchema: z.nativeEnum(Header),
  valueSchema: z.unknown(),
});

/**
 * Type representing the validated output of a COSE Header Map.
 */
export type HeaderMap = z.output<typeof headerMapSchema>;
