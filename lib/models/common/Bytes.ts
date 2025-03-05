import { Buffer } from 'node:buffer';
import { z } from 'zod';

export const bytesSchema = z
  .custom<Uint8Array | Buffer>()
  .transform((bytes) => {
    return Buffer.from(bytes);
  });

export type Bytes = z.infer<typeof bytesSchema>;
