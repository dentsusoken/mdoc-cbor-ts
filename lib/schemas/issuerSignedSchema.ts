import { z } from 'zod';
import {
  encodedNameSpacesSchema,
  rawNameSpacesSchema,
} from './nameSpacesSchema';
import { msoSchema } from './msoSchema';
import { bufferSchema } from './common';

export const rawIssuerSignedSchema = z.object({
  nameSpaces: rawNameSpacesSchema,
  issuerAuth: msoSchema,
});

export const encodedIssuerSignedSchema = z.object({
  nameSpaces: encodedNameSpacesSchema,
  issuerAuth: bufferSchema,
});

export type RawIssuerSigned = z.infer<typeof rawIssuerSignedSchema>;
export type EncodedIssuerSigned = z.infer<typeof encodedIssuerSignedSchema>;
