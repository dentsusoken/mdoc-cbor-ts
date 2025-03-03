import { z } from 'zod';
import { dataElementIdentifierSchema } from '../common';
import { errorCodeSchema } from './ErrorCode';

export const errorItemsEntry = z.tuple([
  dataElementIdentifierSchema,
  errorCodeSchema,
]);

export type ErrorItemsEntry = z.infer<typeof errorItemsEntry>;
