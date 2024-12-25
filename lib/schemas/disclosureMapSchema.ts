import { z } from 'zod';
import { bufferSchema } from './common/bufferSchema';
import { decode, Tag } from 'cbor-x';

export const disclosureMapItemSchema = z.object({
  random: bufferSchema,
  digestID: z.number(),
  elementIdentifier: z.string(),
  elementValue: z.unknown(),
});

export const rawDisclosureMapSchema = z
  .custom<Tag<Buffer | DisclosureMapItem>>()
  .transform((data) => {
    const encoded = encodedDisclosureMapSchema.parse(data);
    const value = disclosureMapItemSchema.parse(decode(encoded.value));
    return new Tag<DisclosureMapItem>(value, 24);
  });

export const encodedDisclosureMapSchema = z
  .custom<Tag<Buffer>>()
  .refine((data) => {
    return data.tag === 24;
  });

export type DisclosureMapItem = z.infer<typeof disclosureMapItemSchema>;

export type RawDisclosureMap = z.infer<typeof rawDisclosureMapSchema>;
export type EncodedDisclosureMap = z.infer<typeof encodedDisclosureMapSchema>;
