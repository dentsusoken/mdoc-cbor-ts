import { z } from 'zod';
import { DeviceNameSpaces } from './DeviceNameSpaces';
import { Tag } from 'cbor-x';

// export const deviceNameSpacesBytesSchema = bytesSchema;
export const deviceNameSpacesBytesSchema = z.custom<Tag>();

/**
 * ```cddl
 * DeviceNameSpacesBytes = #6.24(bstr .cbor DeviceNameSpaces)
 * ```
 * @see {@link DeviceNameSpaces}
 */
export type DeviceNameSpacesBytes = z.infer<typeof deviceNameSpacesBytesSchema>;
