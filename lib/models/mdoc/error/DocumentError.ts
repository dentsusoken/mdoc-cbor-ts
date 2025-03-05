import { z } from 'zod';
import { DocType, docTypeSchema, Entry } from '../../common';
import { ErrorCode, errorCodeSchema } from './ErrorCode';
export const documentErrorSchema = z.record(docTypeSchema, errorCodeSchema);

/**
 * ```cddl
 * DocumentError = {+ DocType => ErrorCode}
 * ```
 * @see {@link DocType}
 * @see {@link ErrorCode}
 */
export type DocumentError = z.infer<typeof documentErrorSchema>;
export type DocumentErrorEntry = Entry<DocumentError>;
