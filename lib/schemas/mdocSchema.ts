import { z } from 'zod';
import { encodedDocumentSchema, rawDocumentSchema } from './documentSchema';

export const rawMdocSchema = z.object({
  version: z.string(),
  documents: z.array(rawDocumentSchema),
  status: z.number(),
});

export const encodedMdocSchema = z.object({
  version: z.string(),
  documents: z.array(encodedDocumentSchema),
  status: z.number(),
});

export type RawMdoc = z.infer<typeof rawMdocSchema>;
export type EncodedMdoc = z.infer<typeof encodedMdocSchema>;
