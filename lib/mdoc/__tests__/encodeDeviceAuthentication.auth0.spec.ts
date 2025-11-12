import { describe, expect, it } from 'vitest';

import { encodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { decodeTag24 } from '@/cbor/decodeTag24';
import { encodeDeviceAuthentication } from '../encodeDeviceAuthentication';
import { calculateDeviceAutenticationBytes } from '@auth0/mdl/lib/mdoc/utils';
import { nameSpacesRecordToMap } from '../nameSpacesRecordToMap';

describe('encodeDeviceAuthentication', () => {
  describe('compatibility with auth0/mdl calculateDeviceAutenticationBytes', () => {
    it('produces identical inner bytes for sessionTranscript as Uint8Array', () => {
      const sessionInner = new Map<string, unknown>([['k', 'v']]);
      const sessionTranscriptBytes = encodeCbor(createTag24(sessionInner));

      const docType = 'org.iso.18013.5.1.mDL';
      const nameSpaces = {
        'org.iso.18013.5.1': {
          given_name: 'Ava',
          age: 30,
        },
      };

      const auth0 = calculateDeviceAutenticationBytes(
        sessionTranscriptBytes,
        docType,
        nameSpaces
      );

      // Decode sessionTranscriptBytes to tuple format
      const decodedSessionTranscript = decodeTag24(sessionTranscriptBytes) as [
        Uint8Array | null,
        Uint8Array | null,
        unknown,
      ];

      const nameSpacesMap = nameSpacesRecordToMap(nameSpaces);
      const deviceNameSpacesBytes = createTag24(nameSpacesMap);
      const ours = encodeDeviceAuthentication({
        sessionTranscript: decodedSessionTranscript,
        docType,
        deviceNameSpacesBytes,
      });
      expect(Array.from(ours)).toEqual(Array.from(auth0));
    });

    it('produces identical inner bytes for sessionTranscript as decoded value', () => {
      const sessionInner: [Uint8Array | null, Uint8Array | null, unknown] = [
        null,
        null,
        'handover',
      ];
      const docType = 'org.iso.18013.5.1.mDL';
      const nameSpaces = { ns: { a: 1 } };

      const auth0 = calculateDeviceAutenticationBytes(
        sessionInner,
        docType,
        nameSpaces
      );

      const nameSpacesMap = nameSpacesRecordToMap(nameSpaces);
      const deviceNameSpacesBytes = createTag24(nameSpacesMap);
      const ours = encodeDeviceAuthentication({
        sessionTranscript: sessionInner,
        docType,
        deviceNameSpacesBytes,
      });

      expect(Array.from(ours)).toEqual(Array.from(auth0));
    });
  });
});
