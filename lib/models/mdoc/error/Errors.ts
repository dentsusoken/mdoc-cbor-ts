import { z } from 'zod';
import { Entry, NameSpace, nameSpaceSchema } from '../../common';
import { ErrorItems, errorItemsSchema } from './ErrorItems';
export const errorsSchema = z.record(nameSpaceSchema, errorItemsSchema);

/**
 * ```cddl
 * Errors = {+ NameSpace => ErrorItems}
 * ```
 * @see {@link NameSpace}
 * @see {@link ErrorItems}
 */
export type Errors = z.infer<typeof errorsSchema>;
export type ErrorsEntry = Entry<Errors>;
