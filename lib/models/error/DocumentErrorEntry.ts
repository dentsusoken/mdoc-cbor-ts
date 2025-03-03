import { z } from 'zod';
import { docTypeSchema } from '../common';
import { errorCodeSchema } from './ErrorCode';

export const documentErrorEntrySchema = z.tuple([
  docTypeSchema,
  errorCodeSchema,
]);

export type DocumentErrorEntry = z.infer<typeof documentErrorEntrySchema>;
