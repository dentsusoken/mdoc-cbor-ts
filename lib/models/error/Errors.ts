import { z } from 'zod';
import { nameSpaceSchema } from '../common';
import { errorItemsSchema } from './ErrorItems';
import { Entry } from '../common';
export const errorsSchema = z.map(nameSpaceSchema, errorItemsSchema);

export type Errors = z.infer<typeof errorsSchema>;
export type ErrorsEntry = Entry<Errors>;
