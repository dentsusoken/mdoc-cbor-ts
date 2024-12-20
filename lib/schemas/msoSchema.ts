import { ProtectedHeaders, UnprotectedHeaders } from '@auth0/cose';
import { z } from 'zod';
import { bufferSchema } from './common/bufferSchema';
import { hashMapSchema } from './hashMapSchema';

export const deviceKeyInfoSchema = z.object({
  deviceKey: z.unknown(),
});

export const validityInfoSchema = z.object({
  signed: bufferSchema,
  validFrom: bufferSchema,
  validUntil: bufferSchema,
});

export const msoPayloadSchema = z.object({
  version: z.literal('1.0'),
  digestAlgorithm: z.string(),
  valueDigests: hashMapSchema,
  deviceKeyInfo: deviceKeyInfoSchema.optional(),
  docType: z.string(),
  validityInfo: validityInfoSchema,
});

export const protectedHeadersSchema = z.custom<ProtectedHeaders>();
export const unprotectedHeadersSchema = z.custom<UnprotectedHeaders>();

export const msoSchema = z.object({
  protectedHeaders: protectedHeadersSchema,
  unprotectedHeaders: unprotectedHeadersSchema,
  payload: msoPayloadSchema,
  signature: bufferSchema,
});

export const msoTupleSchema = z.tuple([
  protectedHeadersSchema,
  unprotectedHeadersSchema,
  msoPayloadSchema,
  bufferSchema,
]);

export type MsoPayload = z.infer<typeof msoPayloadSchema>;
export type Mso = z.infer<typeof msoSchema>;
