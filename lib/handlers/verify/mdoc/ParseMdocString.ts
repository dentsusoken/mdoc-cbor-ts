import { Buffer } from 'node:buffer';
import { decode } from '../../../cbor';
import {
  DeviceResponse,
  deviceResponseSchema,
  issuerSignedSchema,
  IssuerSigned,
} from '../../../schemas/mdoc';

/**
 * Type definition for parsing MDOC strings
 * @description
 * A function type that takes an MDOC string and returns a parsed DeviceResponse.
 * The function attempts to decode the string using various encoding formats.
 */
export type ParseMdocString = (
  mdoc: string | Uint8Array | Buffer
) => DeviceResponse | IssuerSigned;

/**
 * Supported encoding types for MDOC strings
 * @description
 * An array of supported encoding formats that can be used to decode MDOC strings.
 * The parser will attempt each format in sequence until successful.
 */
export const MDOC_ENCODING_TYPES = ['base64url', 'base64', 'hex'] as const;
export const SCHEMA_TYPES = ['deviceResponse', 'issuerSigned'] as const;

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
  if (mdoc instanceof Uint8Array || Buffer.isBuffer(mdoc)) {
    const decoded = decode(mdoc);
    try {
      return deviceResponseSchema.parse(decoded);
    } catch {
      return issuerSignedSchema.parse(decoded);
    }
  }
  for (const encodingType of MDOC_ENCODING_TYPES) {
    for (const schemaType of SCHEMA_TYPES) {
      try {
        const buffer = Buffer.from(mdoc, encodingType);
        const decoded = decode(buffer);
        if (schemaType === 'deviceResponse') {
          return deviceResponseSchema.parse(decoded);
        } else if (schemaType === 'issuerSigned') {
          return issuerSignedSchema.parse(decoded);
        }
      } catch {
        continue;
      }
    }
  }

  throw new Error('Invalid mdoc string');
};
