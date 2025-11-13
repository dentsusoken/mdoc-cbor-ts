import { describe, it, expect } from 'vitest';
import { buildDeviceSigned } from '../buildDeviceSigned';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { createTag24 } from '@/cbor/createTag24';
import { Tag } from 'cbor-x';
import { encodeDeviceAuthentication } from '@/mdoc/encodeDeviceAuthentication';
import { Sign1 } from '@/cose/Sign1';
import { Sign1Tuple } from '@/cose/Sign1';
import { nameSpacesRecordToMap } from '@/mdoc/nameSpacesRecordToMap';
import { deviceSignedSchema } from '@/schemas/mdoc/DeviceSigned';
import { decodeTag24 } from '@/cbor/decodeTag24';
import { SessionTranscript } from '@/mdoc/types';

const p256 = createSignatureCurve('P-256', randomBytes);

describe('buildDeviceSigned', () => {
  it('builds DeviceSigned with nameSpaces and deviceAuth', () => {
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);
    const jwkPublicKey = p256.toJwkPublicKey(publicKey);

    const sessionTranscript = [null, null, 1] as SessionTranscript;
    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpaces = nameSpacesRecordToMap({
      'org.iso.18013.5.1': {
        given_name: 'Alice',
        age: 30,
      },
    });
    const nameSpacesBytes = createTag24(nameSpaces);

    const deviceSigned = buildDeviceSigned({
      sessionTranscript,
      docType,
      nameSpacesBytes,
      deviceJwkPrivateKey: jwkPrivateKey,
    });

    expect(deviceSigned).toBeInstanceOf(Map);
    const nameSpacesTag24 = deviceSigned.get('nameSpaces');
    expect(nameSpacesTag24).toBeInstanceOf(Tag);
    expect(nameSpacesTag24).toHaveProperty('tag', 24);
    const decodedNameSpaces = decodeTag24<Map<string, Map<string, unknown>>>(
      nameSpacesTag24 as Tag
    );
    expect(decodedNameSpaces).toEqual(nameSpaces);
    expect(deviceSigned.get('deviceAuth')).toBeInstanceOf(Map);

    const deviceAuth = deviceSigned.get('deviceAuth')!;
    const deviceSignature = deviceAuth.get('deviceSignature')!;
    expect(deviceSignature).toBeInstanceOf(Tag);
    expect(deviceSignature.tag).toBe(18);

    const [protectedHeaders, unprotectedHeaders, payload, signature] =
      deviceSignature.value as Sign1Tuple;

    expect(payload).toBeNull();

    const detachedPayload = encodeDeviceAuthentication({
      sessionTranscript,
      docType,
      nameSpacesBytes,
    });

    const sign1 = new Sign1(
      protectedHeaders,
      unprotectedHeaders,
      payload,
      signature
    );
    sign1.verify(jwkPublicKey, { detachedPayload });

    deviceSignedSchema.parse(deviceSigned);
  });
});
