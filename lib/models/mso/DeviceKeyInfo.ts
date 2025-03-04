import { z } from 'zod';
import { deviceKeySchema } from './DeviceKey';
import { keyAuthorizationsSchema } from './KeyAuthorizations';
import { keyInfoSchema } from './KeyInfo';

export const deviceKeyInfoSchema = z.object({
  deviceKey: deviceKeySchema,
  keyAuthorizations: keyAuthorizationsSchema.optional(),
  keyInfo: keyInfoSchema.optional(),
});

export type DeviceKeyInfo = z.infer<typeof deviceKeyInfoSchema>;
