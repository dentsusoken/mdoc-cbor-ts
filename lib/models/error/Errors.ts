import { z } from 'zod';
import { nameSpaceSchema } from '../common';
import { errorItemsSchema } from './ErrorItems';

export const errorsSchema = z.map(nameSpaceSchema, errorItemsSchema);

export type Errors = z.infer<typeof errorsSchema>;
