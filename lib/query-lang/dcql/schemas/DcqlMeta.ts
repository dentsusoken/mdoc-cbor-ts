import { z } from 'zod';

/**
 * Zod schema for DCQL meta data.
 *
 * This schema defines the structure for DCQL meta data, supporting:
 * - 'doctype_value': The document type for mdoc.
 *
 * @see https://openid.net/specs/openid-4-verifiable-presentations-1_0.html
 */
export const dcqlMetaSchema = z.object({
  /**
   * REQUIRED: Document type value for mdoc and similar credential formats.
   *
   * This field specifies the concrete document type to be queried by the DCQL credential request.
   * It typically follows a reverse domain name notation, for example:
   *   "org.iso.18013.5.1.mDL"
   *
   * @example
   * // DCQL meta for mdoc
   * { doctype_value: "org.iso.18013.5.1.mDL" }
   */
  doctype_value: z.string().min(1),
});

/**
 * Type inferred from {@link dcqlMetaSchema} representing a DCQL meta data.
 */
export type DcqlMeta = z.output<typeof dcqlMetaSchema>;
