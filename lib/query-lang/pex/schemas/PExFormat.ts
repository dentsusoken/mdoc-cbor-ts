import { z } from 'zod';

/**
 * Zod schema describing the "format" property of an Input Descriptor, as used in Presentation Exchange.
 *
 * The "format" object specifies which cryptographic proof formats are permitted for credentials matching the input descriptor.
 *
 * Currently, only the Mobile Security Object format ("mso_mdoc") for mdoc profiles is supported.
 *
 * @property {Object} mso_mdoc - REQUIRED. The Mobile Security Object format definition for the mdoc profile.
 *   This object must list accepted signature algorithms for credentials of this format.
 *
 * Example usage:
 * ```ts
 * {
 *   mso_mdoc: {
 *     alg: ["ES256", "ES384"]
 *   }
 * }
 * ```
 */
export const pexFormatSchema = z.object({
  /**
   * The Mobile Security Object format for the mdoc profile.
   * Required. Defines the set of accepted signature algorithms.
   */
  mso_mdoc: z.object({
    alg: z.array(z.string()).min(1),
  }),
});
