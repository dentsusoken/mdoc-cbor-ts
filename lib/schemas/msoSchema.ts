import { ProtectedHeaders, Sign1, UnprotectedHeaders } from '@auth0/cose';
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

// TODO: 多分これはいらない
const rawMsoSchema = z.tuple([
  bufferSchema,
  z.map(z.number(), z.unknown()),
  msoPayloadSchema,
  bufferSchema,
]);

// TODO: 本来はタプルでパースするのが正しい気がするけど、なぜかSign1でないとパースできない
// export const msoSchema = z.tuple([
//   bufferSchema,
//   // z.map(z.number(), z.unknown()),
//   z.any(),
//   bufferSchema,
//   bufferSchema,
// ]);

export const msoSchema = z.custom<Sign1>();

export type MsoPayload = z.infer<typeof msoPayloadSchema>;
export type Mso = z.infer<typeof msoSchema>;
