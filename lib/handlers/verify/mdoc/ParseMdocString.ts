import { decode } from 'cbor-x';
import { DeviceResponse, deviceResponseSchema } from '../../../schemas/mdoc';

export type ParseMdocString = (mdoc: string) => DeviceResponse;

export const MDOC_ENCODING_TYPES = ['base64url', 'base64', 'hex'] as const;

export const parseMdocString: ParseMdocString = (mdoc) => {
  MDOC_ENCODING_TYPES.forEach((encodingType) => {
    try {
      const buffer = Buffer.from(mdoc, encodingType);
      const decoded = decode(buffer);
      const deviceResponse = deviceResponseSchema.parse(decoded);
      return deviceResponse;
    } catch (error) {
      return null;
    }
  });

  throw new Error('Invalid mdoc string');
};
