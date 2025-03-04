import { z } from 'zod';
import { Buffer } from 'node:buffer';

export const bytesSchema = z
  .custom<Uint8Array | Buffer>()
  .transform((bytes) => {
    return new Buffer(bytes);
  });

export type Bytes = z.infer<typeof bytesSchema>;
