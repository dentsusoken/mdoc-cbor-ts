import { z } from 'zod';
import { DocType, docTypeSchema } from '../common';
import { DeviceSigned, deviceSignedSchema } from './DeviceSigned';
import { Errors, errorsSchema } from './error';
import { IssuerSigned, issuerSignedSchema } from './IssuerSigned';

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
