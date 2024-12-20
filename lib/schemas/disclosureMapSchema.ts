import { z } from 'zod';
import { bufferSchema } from './common/bufferSchema';
import { Tag } from 'cbor';

export const disclosureMapItemSchema = z.object({
  random: bufferSchema,
  digestID: z.number(),
  elementIdentifier: z.string(),
  elementValue: z.string(),
});

export const disclosureMapSchema = z
  .array(z.custom<Tag<DisclosureMapItem>>())
  .refine((tags) => {
    return tags.every((tag) => {
      if (tag.tag !== 24) {
        throw new Error('Invalid tag');
      }
      return disclosureMapItemSchema.parse(tag.value);
    });
  });

export type DisclosureMapItem = z.infer<typeof disclosureMapItemSchema>;
export type DisclosureMap = z.infer<typeof disclosureMapSchema>;
