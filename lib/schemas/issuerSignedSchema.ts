import { z } from 'zod';
import {
  encodedNameSpacesSchema,
  rawNameSpacesSchema,
} from './nameSpacesSchema';
import { msoSchema } from './msoSchema';

export const rawIssuerSignedSchema = z.object({
  nameSpaces: rawNameSpacesSchema,
  issuerAuth: msoSchema,
});

export const encodedIssuerSignedSchema = z.object({
  nameSpaces: encodedNameSpacesSchema,
  issuerAuth: msoSchema,
});

export type RawIssuerSigned = z.infer<typeof rawIssuerSignedSchema>;
export type EncodedIssuerSigned = z.infer<typeof encodedIssuerSignedSchema>;
