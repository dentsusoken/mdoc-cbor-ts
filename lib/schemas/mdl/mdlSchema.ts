import { z } from 'zod';

export const mdlSchema = z.object({
  document_number: z.string(),
  given_name: z.string(),
});
