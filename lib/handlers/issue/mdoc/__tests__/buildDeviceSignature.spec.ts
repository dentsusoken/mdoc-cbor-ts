import { describe, it, expect } from 'vitest';
import { buildDeviceSignature } from '../buildDeviceSignature';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { decodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { Tag } from 'cbor-x';
import { Header, Algorithm } from '@/cose/types';
import { encodeDeviceAuthentication } from '@/mdoc/encodeDeviceAuthentication';
import { Sign1 } from '@/cose/Sign1';
import { Sign1Tuple } from '@/cose/Sign1';
import { nameSpacesRecordToMap } from '@/mdoc/nameSpacesRecordToMap';
import { SessionTranscript } from '@/mdoc/types';

const p256 = createSignatureCurve('P-256', randomBytes);

describe('buildDeviceSignature', () => {
  it('produces Tag(18) COSE_Sign1 with expected payload and a valid signature', () => {
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);
    const jwkPublicKey = p256.toJwkPublicKey(publicKey);

    const sessionTranscript: SessionTranscript = [null, null, { foo: 'bar' }];
    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpaces = nameSpacesRecordToMap({
      'org.iso.18013.5.1': {
        given_name: 'Alice',
      },
    });
    const deviceNameSpacesBytes = createTag24(nameSpaces);

    const tag = buildDeviceSignature({
      sessionTranscript,
      docType,
      deviceNameSpacesBytes,
      deviceJwkPrivateKey: jwkPrivateKey,
    });

    expect(tag).toBeInstanceOf(Tag);
    expect(tag.tag).toBe(18);

    const [protectedHeaders, unprotectedHeaders, payload, signature] =
      tag.value as Sign1Tuple;

    expect(payload).toBeNull();

    const detachedPayload = encodeDeviceAuthentication({
      sessionTranscript,
      docType,
      deviceNameSpacesBytes,
    });

    const headers = decodeCbor(protectedHeaders) as Map<number, unknown>;
    expect(headers.get(Header.Algorithm)).toBe(Algorithm.ES256);

    const sign1 = new Sign1(
      protectedHeaders,
      unprotectedHeaders,
      payload,
      signature
    );
    sign1.verify(jwkPublicKey, { detachedPayload });
  });

  it('defaults to empty nameSpaces when not provided', () => {
    const privateKey = p256.randomPrivateKey();
    const publicKey = p256.getPublicKey(privateKey);
    const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);
    const jwkPublicKey = p256.toJwkPublicKey(publicKey);

    const sessionTranscript: SessionTranscript = [null, null, ['any', 1]];
    const docType = 'org.iso.18013.5.1.mDL';
    const deviceNameSpacesBytes = createTag24(new Map());

    const tag = buildDeviceSignature({
      sessionTranscript,
      docType,
      deviceNameSpacesBytes,
      deviceJwkPrivateKey: jwkPrivateKey,
    });

    expect(tag.tag).toBe(18);
    const [ph, uh, payload, sig] = tag.value as Sign1Tuple;

    expect(payload).toBeNull();

    const detachedPayload = encodeDeviceAuthentication({
      sessionTranscript,
      docType,
      deviceNameSpacesBytes,
    });

    const sign1 = new Sign1(ph, uh, payload, sig);
    sign1.verify(jwkPublicKey, { detachedPayload });
  });
});
