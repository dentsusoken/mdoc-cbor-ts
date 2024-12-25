import { z } from 'zod';
import {
  encodedIssuerSignedSchema,
  rawIssuerSignedSchema,
} from './issuerSignedSchema';

export const rawDocumentSchema = z.object({
  docType: z.string().optional(),
  issuerSigned: rawIssuerSignedSchema,
  // TODO: Implement deviceSigned
  deviceSigned: z.unknown(),
});

export const encodedDocumentSchema = z.object({
  docType: z.string().optional(),
  issuerSigned: encodedIssuerSignedSchema,
  // TODO: Implement deviceSigned
  deviceSigned: z.unknown(),
});

export type RawDocument = z.infer<typeof rawDocumentSchema>;
export type EncodedDocument = z.infer<typeof encodedDocumentSchema>;
