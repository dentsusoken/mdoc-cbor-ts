import { z } from 'zod';
import { nameSpaceSchema } from '../common';
import { errorItemsSchema } from './ErrorItems';

export const errorsEntrySchema = z.tuple([nameSpaceSchema, errorItemsSchema]);

export type ErrorsEntry = z.infer<typeof errorsEntrySchema>;
