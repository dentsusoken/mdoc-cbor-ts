import { z } from 'zod';
import { Entry, NameSpace, nameSpaceSchema } from '../common';
import {
  IssuerSignedItemBytes,
  issuerSignedItemBytesSchema,
} from './IssuerSignedItemBytes';

export const issuerNameSpacesSchema = z.record(
  nameSpaceSchema,
  z.array(issuerSignedItemBytesSchema)
);

/**
 * ```cddl
 * IssuerNameSpaces = {+ NameSpace => [+ IssuerSignedItemBytes]}
 * ```
 * @see {@link NameSpace}
 * @see {@link IssuerSignedItemBytes}
 */
export type IssuerNameSpaces = z.infer<typeof issuerNameSpacesSchema>;
export type IssuerNameSpacesEntry = Entry<IssuerNameSpaces>;
