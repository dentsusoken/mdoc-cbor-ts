import { describe, expect, it } from 'vitest';

import { encodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { decodeTag24 } from '@/cbor/decodeTag24';
import { encodeDeviceAuthentication } from '../encodeDeviceAuthentication';
import { calculateDeviceAutenticationBytes } from '@auth0/mdl/lib/mdoc/utils';
import { nameSpacesRecordToMap } from '../nameSpacesRecordToMap';
import { SessionTranscript } from '@/index';

describe('encodeDeviceAuthentication', () => {
  describe('compatibility with auth0/mdl calculateDeviceAutenticationBytes', () => {
    it('produces identical bytes when sessionTranscript is provided as Bytes (Uint8Array)', () => {
      const sessionTranscript: SessionTranscript = [null, null, 'handover'];
      const sessionTranscriptBytes = encodeCbor(createTag24(sessionTranscript));

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
      const decodedSessionTranscript = decodeTag24<SessionTranscript>(
        sessionTranscriptBytes
      );

      const nameSpacesMap = nameSpacesRecordToMap(nameSpaces);
      const nameSpacesBytes = createTag24(nameSpacesMap);
      const ours = encodeDeviceAuthentication({
        sessionTranscript: decodedSessionTranscript,
        docType,
        nameSpacesBytes,
      });
      expect(Array.from(ours)).toEqual(Array.from(auth0));
    });

    it('produces identical bytes when sessionTranscript is provided as raw value (not Bytes)', () => {
      const sessionTranscript: SessionTranscript = [null, null, 'handover'];
      const docType = 'org.iso.18013.5.1.mDL';
      const nameSpaces = { ns: { a: 1 } };

      const auth0 = calculateDeviceAutenticationBytes(
        sessionTranscript,
        docType,
        nameSpaces
      );

      const nameSpacesMap = nameSpacesRecordToMap(nameSpaces);
      const nameSpacesBytes = createTag24(nameSpacesMap);
      const ours = encodeDeviceAuthentication({
        sessionTranscript,
        docType,
        nameSpacesBytes,
      });

      expect(Array.from(ours)).toEqual(Array.from(auth0));
    });
  });
});
