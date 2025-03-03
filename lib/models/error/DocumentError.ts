import { z } from 'zod';
import { docTypeSchema } from '../common';
import { errorCodeSchema } from './ErrorCode';
import { Entry } from '../common';
export const documentErrorSchema = z.map(docTypeSchema, errorCodeSchema);

export type DocumentError = z.infer<typeof documentErrorSchema>;
export type DocumentErrorEntry = Entry<DocumentError>;
