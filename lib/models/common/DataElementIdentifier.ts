import { z } from 'zod';

export const dataElementIdentifierSchema = z.string();

export type DataElementIdentifier = z.infer<typeof dataElementIdentifierSchema>;
