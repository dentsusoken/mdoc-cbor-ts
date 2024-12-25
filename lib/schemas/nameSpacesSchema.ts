import { z } from 'zod';
import {
  encodedDisclosureMapSchema,
  rawDisclosureMapSchema,
} from './disclosureMapSchema';

export const nameSpaceIdSchema = z.string();

export const rawNameSpacesSchema = z.record(
  nameSpaceIdSchema,
  z.array(rawDisclosureMapSchema)
);

export const encodedNameSpacesSchema = z.record(
  nameSpaceIdSchema,
  z.array(encodedDisclosureMapSchema)
);

export type NameSpaceId = z.infer<typeof nameSpaceIdSchema>;
export type RawNameSpaces = z.infer<typeof rawNameSpacesSchema>;
export type EncodedNameSpaces = z.infer<typeof encodedNameSpacesSchema>;
