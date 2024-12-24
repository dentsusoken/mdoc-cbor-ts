import { z } from 'zod';
import { disclosureMapSchema } from './disclosureMapSchema';

export const nameSpaceIdSchema = z.string();

export const nameSpaceSchema = z.record(
  nameSpaceIdSchema,
  z.array(disclosureMapSchema)
);

export const encodedNameSpaceSchema = z.record(
  nameSpaceIdSchema,
  z.custom<ArrayBuffer>()
);

export type NameSpaceId = z.infer<typeof nameSpaceIdSchema>;
export type NameSpace = z.infer<typeof nameSpaceSchema>;
export type EncodedNameSpace = z.infer<typeof encodedNameSpaceSchema>;
