import { z } from 'zod';
import { dataElementIdentifierSchema } from '../common';
import { errorCodeSchema } from './ErrorCode';

export const errorItemsSchema = z.map(
  dataElementIdentifierSchema,
  errorCodeSchema
);

export type ErrorItems = z.infer<typeof errorItemsSchema>;
