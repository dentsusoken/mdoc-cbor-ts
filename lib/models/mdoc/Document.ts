import { z } from 'zod';
import { docTypeSchema, DocType } from '../common';
import { issuerSignedSchema, IssuerSigned } from './IssuerSigned';
import { deviceSignedSchema, DeviceSigned } from './DeviceSigned';
import { errorsSchema, Errors } from './error';

export const documentSchema = z.object({
  docType: docTypeSchema,
  issuerSigned: issuerSignedSchema,
  deviceSigned: deviceSignedSchema,
  errors: errorsSchema.optional(),
});

/**
 * ```cddl
 * Document = {
 *  "docType": DocType,
 *  "issuerSigned": IssuerSigned,
 *  "deviceSigned": DeviceSigned,
 *  "errors": Errors?
 * }
 * ```
 * @see {@link DocType}
 * @see {@link IssuerSigned}
 * @see {@link DeviceSigned}
 * @see {@link Errors}
 */
export type Document = z.infer<typeof documentSchema>;
