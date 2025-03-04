import { COSEKey } from '@auth0/cose';
import { z } from 'zod';

export const deviceKeySchema = z.custom<COSEKey>().transform((key) => {
  return new COSEKey(key);
});

export type DeviceKey = z.infer<typeof deviceKeySchema>;
