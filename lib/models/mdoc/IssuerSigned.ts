import { z } from 'zod';
import { IssuerAuth, issuerAuthSchema } from '../mso';
import { IssuerNameSpaces, issuerNameSpacesSchema } from './IssuerNameSpaces';

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
