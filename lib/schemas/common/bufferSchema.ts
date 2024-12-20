import { Buffer } from 'node:buffer';
import { z } from 'zod';

export const bufferSchema = z.custom<Buffer>((data) => {
  if (data instanceof Buffer) {
    return data;
  } else if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }
});
