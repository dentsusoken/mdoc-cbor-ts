import { z } from 'zod';
import { docTypeSchema, DocType } from '../../common';
import { errorCodeSchema, ErrorCode } from './ErrorCode';
import { Entry } from '../../common';
export const documentErrorSchema = z.map(docTypeSchema, errorCodeSchema);

/**
 * ```cddl
 * DocumentError = {+ DocType => ErrorCode}
 * ```
 * @see {@link DocType}
 * @see {@link ErrorCode}
 */
export type DocumentError = z.infer<typeof documentErrorSchema>;
export type DocumentErrorEntry = Entry<DocumentError>;
