import { z } from 'zod';
import { issuerNameSpacesSchema, IssuerNameSpaces } from './IssuerNameSpaces';
import { issuerAuthSchema, IssuerAuth } from '../mso';

export const issuerSignedSchema = z.object({
  nameSpaces: issuerNameSpacesSchema,
  issuerAuth: issuerAuthSchema,
});

/**
 * ```cddl
 * IssuerSigned = {
 *  "nameSpaces": IssuerNameSpaces,
 *  "issuerAuth": IssuerAuth
 * }
 * ```
 * @see {@link IssuerNameSpaces}
 * @see {@link IssuerAuth}
 */
export type IssuerSigned = z.infer<typeof issuerSignedSchema>;
