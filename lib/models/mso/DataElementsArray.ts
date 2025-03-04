import { z } from 'zod';
import { dataElementIdentifierSchema, DataElementIdentifier } from '../common';

export const dataElementsArraySchema = z
  .array(dataElementIdentifierSchema)
  .nonempty();

/**
 * ```cddl
 * DataElementsArray = [+ DataElementIdentifier]
 * ```
 * @see {@link DataElementIdentifier}
 */
export type DataElementsArray = z.infer<typeof dataElementsArraySchema>;
