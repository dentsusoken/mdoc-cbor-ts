import { z } from 'zod';
import { nameSpaceSchema, NameSpace } from '../../common';
import { errorItemsSchema, ErrorItems } from './ErrorItems';
import { Entry } from '../../common';
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
