import { z } from 'zod';
import { valueDigestsSchema } from './ValueDigests';
import { deviceKeyInfoSchema } from './DeviceKeyInfo';
import { docTypeSchema } from '../common';
import { validityInfoSchema } from './ValidityInfo';

export const mobileSecurityObjectSchema = z.object({
  version: z.literal('1.0'),
  // TODO: digestAlgorithm should be defined in the common schema
  digestAlgorithm: z.literal('SHA-256'),
  valueDigests: valueDigestsSchema,
  deviceKeyInfo: deviceKeyInfoSchema,
  docType: docTypeSchema,
  validityInfo: validityInfoSchema,
});

export type MobileSecurityObject = z.infer<typeof mobileSecurityObjectSchema>;
