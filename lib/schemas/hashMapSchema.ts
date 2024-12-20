import { z } from 'zod';

export const hashMapItemSchema = z.record(z.number(), z.custom<ArrayBuffer>());

export const hashMapSchema = z.record(z.string(), hashMapItemSchema);

export type HashMapItem = z.infer<typeof hashMapItemSchema>;

export type HashMap = z.infer<typeof hashMapSchema>;
