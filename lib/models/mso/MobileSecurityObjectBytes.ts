import { z } from 'zod';
import { bytesSchema } from '../common';

export const mobileSecurityObjectBytesSchema = bytesSchema;

export type MobileSecurityObjectBytes = z.infer<
  typeof mobileSecurityObjectBytesSchema
>;
