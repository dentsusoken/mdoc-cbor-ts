import { describe, it, expect } from 'vitest';
import { buildDeviceSigned } from '../buildDeviceSigned';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { encodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { Tag } from 'cbor-x';
import { encodeDeviceAuthentication } from '@/mdoc/encodeDeviceAuthentication';
import { Sign1 } from '@/cose/Sign1';
import { Sign1Tuple } from '@/cose/Sign1';
import { nameSpacesRecordToMap } from '@/mdoc/nameSpacesRecordToMap';
import { deviceSignedSchema } from '@/schemas/mdoc/DeviceSigned';

const p256 = createSignatureCurve('P-256', randomBytes);

describe('buildDeviceSigned', () => {
  it('builds DeviceSigned with nameSpaces and deviceAuth', () => {
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);
    const jwkPublicKey = p256.toJwkPublicKey(publicKey);

    const sessionTranscriptBytes = encodeCbor(createTag24({ foo: 'bar' }));
    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpaces = nameSpacesRecordToMap({
      'org.iso.18013.5.1': {
        given_name: 'Alice',
        age: 30,
      },
    });

    const deviceSigned = buildDeviceSigned({
      sessionTranscriptBytes,
      docType,
      nameSpaces,
      deviceJwkPrivateKey: jwkPrivateKey,
    });

    expect(deviceSigned).toBeInstanceOf(Map);
    expect(deviceSigned.get('nameSpaces')).toBe(nameSpaces);
    expect(deviceSigned.get('deviceAuth')).toBeInstanceOf(Map);

    const deviceAuth = deviceSigned.get('deviceAuth') as Map<string, unknown>;
    const deviceSignature = deviceAuth.get('deviceSignature') as Tag;
    expect(deviceSignature).toBeInstanceOf(Tag);
    expect(deviceSignature.tag).toBe(18);

    const [protectedHeaders, unprotectedHeaders, payload, signature] =
      deviceSignature.value as Sign1Tuple;

    expect(payload).toBeNull();

    const detachedPayload = encodeDeviceAuthentication({
      sessionTranscript: sessionTranscriptBytes,
      docType,
      nameSpaces,
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

  it('defaults to empty nameSpaces when not provided', () => {
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);
    const jwkPublicKey = p256.toJwkPublicKey(publicKey);

    const sessionTranscriptBytes = encodeCbor(createTag24(['any', 1]));
    const docType = 'org.iso.18013.5.1.mDL';

    const deviceSigned = buildDeviceSigned({
      sessionTranscriptBytes,
      docType,
      deviceJwkPrivateKey: jwkPrivateKey,
    });

    expect(deviceSigned).toBeInstanceOf(Map);
    const nameSpaces = deviceSigned.get('nameSpaces') as Map<string, unknown>;
    expect(nameSpaces).toBeInstanceOf(Map);
    expect(nameSpaces.size).toBe(0);

    const deviceAuth = deviceSigned.get('deviceAuth') as Map<string, unknown>;
    const deviceSignature = deviceAuth.get('deviceSignature') as Tag;
    expect(deviceSignature).toBeInstanceOf(Tag);

    const [ph, uh, payload, sig] = deviceSignature.value as Sign1Tuple;

    expect(payload).toBeNull();

    const detachedPayload = encodeDeviceAuthentication({
      sessionTranscript: sessionTranscriptBytes,
      docType,
      nameSpaces: new Map(),
    });

    const sign1 = new Sign1(ph, uh, payload, sig);
    sign1.verify(jwkPublicKey, { detachedPayload });

    deviceSignedSchema.parse(deviceSigned);
  });
});

