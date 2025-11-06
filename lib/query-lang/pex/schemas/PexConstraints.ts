import { z } from 'zod';
import { pexFieldSchema } from './PexField';

/**
 * Zod schema for constraints within a Presentation Exchange Input Descriptor.
 *
 * Constraints define rules that must be satisfied by credentials matching the input descriptor.
 * This includes disclosure limitations and required fields.
 *
 * Properties:
 * - `limit_disclosure` (enum): **Optional.** Indicates whether selective disclosure is required or preferred.
 *   - `'required'`: Selective disclosure is mandatory.
 *   - `'preferred'`: Selective disclosure is preferred but not mandatory.
 * - `fields` (array): **Optional.** An array of field definitions (see {@link pexFieldSchema}) that specify
 *   which claims must be present and any constraints on their values.
 *
 * @see https://identity.foundation/presentation-exchange/#input-descriptor-object
 */
export const pexConstraintsSchema = z.object({
  /**
   * Indicates whether selective disclosure is required or preferred.
   * When set to 'required', the holder must use selective disclosure.
   * When set to 'preferred', selective disclosure is encouraged but not mandatory.
   */
  limit_disclosure: z.enum(['required', 'preferred']).optional(),
  /**
   * Array of field definitions that specify which claims must be present
   * and any constraints on their values.
   * See {@link pexFieldSchema} for field definition details.
   */
  fields: z.array(pexFieldSchema).optional(),
});
