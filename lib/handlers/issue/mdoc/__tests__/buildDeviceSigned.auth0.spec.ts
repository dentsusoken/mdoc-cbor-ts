import { describe, it, expect } from 'vitest';
import { buildDeviceSigned } from '../buildDeviceSigned';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { createTag24 } from '@/cbor/createTag24';
import { Tag } from 'cbor-x';
import { encodeDeviceAuthentication } from '@/mdoc/encodeDeviceAuthentication';
import { Sign1 } from '@auth0/cose';
import { Sign1Tuple } from '@/cose/Sign1';
import { nameSpacesRecordToMap } from '@/mdoc/nameSpacesRecordToMap';
import { SessionTranscript } from '@/mdoc/types';
import * as jose from 'jose';

const p256 = createSignatureCurve('P-256', randomBytes);

describe('buildDeviceSigned auth0 compatibility', () => {
  it('signature should be verifiable by auth0 sign1', async () => {
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);
    const jwkPublicKey = p256.toJwkPublicKey(publicKey);

    const sessionTranscript = [null, null, 1] as SessionTranscript;
    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpaces = nameSpacesRecordToMap({
      'com.foobar-device': { test: 1234 },
    });
    const nameSpacesBytes = createTag24(nameSpaces);

    const deviceSigned = buildDeviceSigned({
      sessionTranscript,
      docType,
      nameSpacesBytes,
      deviceJwkPrivateKey: jwkPrivateKey,
    });

    expect(deviceSigned).toBeInstanceOf(Map);
    const deviceAuth = deviceSigned.get('deviceAuth')!;
    const deviceSignature = deviceAuth.get('deviceSignature')!;
    expect(deviceSignature).toBeInstanceOf(Tag);

    const [ph, uh, payload, sig] = deviceSignature.value as Sign1Tuple;

    expect(payload).toBeNull();

    const detachedPayload = encodeDeviceAuthentication({
      sessionTranscript,
      docType,
      nameSpacesBytes: nameSpacesBytes,
    });

    const sign1 = new Sign1(ph, uh, payload!, sig);
    const pubkey = await jose.importJWK(jwkPublicKey, 'ES256');
    sign1.verify(pubkey, { detachedPayload });
  });
});
