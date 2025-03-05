import { COSEKey, Sign1 } from '@auth0/cose';
import { ByteString } from '../../../cbor';
import { DeviceSigned } from '../../../schemas/mdoc';
import { BuildProtectedHeaders } from '../common';
import { CreateBuilderFunction } from '../CreateBuilder';

export type BuildDeviceSigned = (coseKey: COSEKey) => Promise<DeviceSigned>;

export type CreateDeviceSignedBuilderParams = {
  buildProtectedHeaders: BuildProtectedHeaders;
};

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
      // TODO: implement
      nameSpaces: new ByteString({}),
      // TODO: DeviceAuthenticationを実装する
      deviceAuth: {
        // @ts-ignore
        // TODO: 型をちゃんとつける
        deviceSignature: sign1.getContentForEncoding(),
      },
    };

    return deviceSigned;
  };
