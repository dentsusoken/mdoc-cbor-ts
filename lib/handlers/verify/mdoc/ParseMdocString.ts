import { decode } from '../../../cbor';
import { DeviceResponse, deviceResponseSchema } from '../../../schemas/mdoc';

/**
 * Type definition for parsing MDOC strings
 * @description
 * A function type that takes an MDOC string and returns a parsed DeviceResponse.
 * The function attempts to decode the string using various encoding formats.
 */
export type ParseMdocString = (mdoc: string) => DeviceResponse;

/**
 * Supported encoding types for MDOC strings
 * @description
 * An array of supported encoding formats that can be used to decode MDOC strings.
 * The parser will attempt each format in sequence until successful.
 */
export const MDOC_ENCODING_TYPES = ['base64url', 'base64', 'hex'] as const;

/**
 * Parses an MDOC string into a DeviceResponse object
 * @description
 * Attempts to decode an MDOC string using various encoding formats and validates
 * the decoded data against the DeviceResponse schema.
 *
 * @param mdoc - The MDOC string to parse
 * @returns The parsed and validated DeviceResponse
 * @throws {Error} If the MDOC string cannot be decoded using any supported format
 *
 * @example
 * ```typescript
 * const deviceResponse = parseMdocString(mdocString);
 * ```
 */
export const parseMdocString: ParseMdocString = (mdoc) => {
  for (const encodingType of MDOC_ENCODING_TYPES) {
    try {
      const buffer = Buffer.from(mdoc, encodingType);
      const decoded = decode(buffer);
      const deviceResponse = deviceResponseSchema.parse(decoded);
      return deviceResponse;
    } catch (error) {
      continue;
    }
  }

  throw new Error('Invalid mdoc string');
};
