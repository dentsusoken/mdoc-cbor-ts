import { z } from 'zod';

/**
 * Zod schema for the Input Descriptor's format object, as used in Presentation Exchange.
 *
 * This schema defines which cryptographic proof formats are accepted for a credential
 * within an input descriptor. Currently, it supports only the Mobile Security Object
 * format ("mso_mdoc").
 *
 * @property {object} mso_mdoc - REQUIRED. The definition for Mobile Security Object for mdoc profile,
 *   specifying accepted signature algorithms. See {@link msoMdocFormatSchema}.
 *
 * Example:
 * {
 *   mso_mdoc: {
 *     alg: ["ES256", "ES384"]
 *   }
 * }
 */
export const inputDescriptorFormatSchema = z.object({
  /**
   * Mobile Security Object for mdoc profile.
   * REQUIRED: Specifies accepted signature algorithms for this profile.
   */
  mso_mdoc: z.object({
    alg: z.array(z.string()).min(1),
  }),
});
