import { z } from 'zod';
import { dataElementIdentifierSchema } from '../common';

export const dataElementsArraySchema = z
  .array(dataElementIdentifierSchema)
  .nonempty();

export type DataElementsArray = z.infer<typeof dataElementsArraySchema>;
