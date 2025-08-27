import { Algorithms, COSEKey } from '@auth0/cose';
import { describe, expect, it } from 'vitest';
import { buildDeviceSigned } from '@/handlers/issue/mdoc/buildDeviceSigned';
import { encodeCbor, decodeCbor } from '@/cbor/codec';
import { deviceSignedSchema } from '@/schemas/mdoc/DeviceSigned';

describe('buildDeviceSigned', () => {
  it('should build DeviceSigned and be parseable after CBOR encode/decode', async () => {
    const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
      crv: 'P-256',
    });

    const deviceSigned = await buildDeviceSigned(privateKey);
    console.log('deviceSigned', deviceSigned);
    const expected = {
      nameSpaces: deviceSigned.nameSpaces,
      deviceAuth: {
        deviceSignature: deviceSigned.deviceAuth.deviceSignature,
      },
    };
    expect(expected).toEqual(deviceSigned);

    const encoded = encodeCbor(expected);

    const decoded = decodeCbor(encoded);

    const parsed = deviceSignedSchema.parse(decoded);

    // Compare nameSpaces (Tag 24 with Uint8Array value)
    const parsedNameSpaces = parsed.nameSpaces;
    const originalNameSpaces = deviceSigned.nameSpaces;
    expect(parsedNameSpaces).toEqual(originalNameSpaces);

    //const parsedDeviceSignature = parsed.deviceAuth.deviceSignature;
    //const originalDeviceSignature = deviceSigned.deviceAuth.deviceSignature;
    //console.log('parsedDeviceSignature', parsedDeviceSignature);
    //console.log('originalDeviceSignature', originalDeviceSignature);
    //expect(parsedDeviceSignature).toEqual(originalDeviceSignature);

    // Compare deviceSignature tuple by content
    const [p1, u1, pl1, s1] = parsed.deviceAuth.deviceSignature!;
    const [p2, u2, pl2, s2] = deviceSigned.deviceAuth.deviceSignature!;

    // protected headers bytes
    expect(new Uint8Array(p1)).toEqual(new Uint8Array(p2));
    // unprotected headers map
    expect(u1).toEqual(u2);
    // payload
    expect(pl1).toEqual(pl2);
    // signature bytes
    expect(s1).toEqual(s2);
  });
});
