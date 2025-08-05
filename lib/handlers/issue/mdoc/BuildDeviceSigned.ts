import { COSEKey, Sign1 } from '@auth0/cose';
import { TypedMap } from '@jfromaniello/typedmap';
import { ByteString } from '../../../cbor';
import { DeviceSigned } from '../../../schemas/mdoc';
import { BuildProtectedHeaders } from '../common';
import { CreateBuilderFunction } from '../CreateBuilder';

/**
 * Type definition for building device-signed data
 * @description
 * A function type that creates device-signed data using the provided COSE key.
 * The function creates a COSE_Sign1 signature for the device's authentication.
 */
export type BuildDeviceSigned = (coseKey: COSEKey) => Promise<DeviceSigned>;

/**
 * Parameters for creating a device-signed data builder
 * @description
 * Configuration required to create a builder function for device-signed data.
 */
export type CreateDeviceSignedBuilderParams = {
  /** Function to build protected headers for the signature */
  buildProtectedHeaders: BuildProtectedHeaders;
};

/**
 * Creates a function for building device-signed data
 * @description
 * Returns a function that creates device-signed data using the provided
 * COSE key. The function creates a COSE_Sign1 signature and wraps it
 * in a DeviceSigned structure.
 *
 * @example
 * ```typescript
 * const builder = createDeviceSignedBuilder({
 *   buildProtectedHeaders
 * });
 * const deviceSigned = await builder(deviceKey);
 * ```
 */
export const createDeviceSignedBuilder: CreateBuilderFunction<
  CreateDeviceSignedBuilderParams,
  BuildDeviceSigned
> =
  ({ buildProtectedHeaders }) =>
  async (coseKey) => {
    const protectedHeaders = buildProtectedHeaders(coseKey);
    const sign1 = await Sign1.sign(
      protectedHeaders,
      new Map(),
      null!,
      await coseKey.toKeyLike()
    );

    const deviceSigned: DeviceSigned = {
      // TODO: Implement DeviceAuthentication
      // TODO: Add proper types
      nameSpaces: new ByteString(new TypedMap()),
      // TODO: DeviceAuthenticationを実装する
      deviceAuth: {
        // @ts-ignore
        // TODO: 型をちゃんとつける
        deviceSignature: sign1.getContentForEncoding(),
      },
    };

    return deviceSigned;
  };
