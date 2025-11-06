import { z } from 'zod';
import { pexFormatSchema } from './PexFormat';
import { pexConstraintsSchema } from './PexConstraints';

/**
 * Zod schema for an Input Descriptor within a Presentation Exchange Definition.
 *
 * An Input Descriptor specifies the requirements for a particular type of credential
 * that must be provided by the holder. It defines the accepted proof format, constraints
 * on disclosure, and required fields.
 *
 * Properties:
 * - `id` (string): **Required.** A unique identifier for this input descriptor within the presentation definition.
 * - `format` (object): **Required.** Defines which cryptographic proof formats are accepted (see {@link pexFormatSchema}).
 *   Currently supports "mso_mdoc" format for mdoc profiles.
 * - `constraints` (object): **Required.** Defines constraints on disclosure and required fields (see {@link pexConstraintsSchema}).
 *
 * @see https://identity.foundation/presentation-exchange/#input-descriptor-object
 */
export const pexInputDescriptorSchema = z.object({
  /**
   * Unique identifier for this input descriptor.
   * Must be unique within the parent presentation definition.
   */
  id: z.string(),
  /**
   * Defines which cryptographic proof formats are accepted for credentials matching this descriptor.
   * Currently supports "mso_mdoc" format for mdoc profiles.
   * See {@link pexFormatSchema} for format details.
   */
  format: pexFormatSchema,
  /**
   * Defines constraints on disclosure and required fields for credentials matching this descriptor.
   * See {@link pexConstraintsSchema} for constraint details.
   */
  constraints: pexConstraintsSchema,
});
