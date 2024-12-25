import { z } from 'zod';
import { bufferSchema } from './common/bufferSchema';
import { decode } from 'cbor-x';
import { TypedTag } from '../cbor';

export const disclosureMapItemSchema = z.object({
  random: bufferSchema,
  digestID: z.number(),
  elementIdentifier: z.string(),
  elementValue: z.unknown(),
});

export const rawDisclosureMapSchema = z
  .custom<TypedTag<Buffer | DisclosureMapItem>>()
  .transform((data) => {
    const encoded = encodedDisclosureMapSchema.parse(data);
    const value = disclosureMapItemSchema.parse(decode(encoded.value));
    return new TypedTag<DisclosureMapItem>(value, 24);
  });

export const encodedDisclosureMapSchema = z
  .custom<TypedTag<Buffer>>()
  .refine((data) => {
    return data.tag === 24;
  });

export type DisclosureMapItem = z.infer<typeof disclosureMapItemSchema>;

export type RawDisclosureMap = z.infer<typeof rawDisclosureMapSchema>;
export type EncodedDisclosureMap = z.infer<typeof encodedDisclosureMapSchema>;
