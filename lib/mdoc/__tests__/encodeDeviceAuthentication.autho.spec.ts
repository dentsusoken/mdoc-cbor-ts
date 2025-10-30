import { describe, expect, it } from 'vitest';

import { encodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { encodeDeviceAuthentication } from '../encodeDeviceAuthentication';
import { calculateDeviceAutenticationBytes } from '@auth0/mdl/lib/mdoc/utils';

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

      const ours = encodeDeviceAuthentication({
        sessionTranscript: sessionTranscriptBytes,
        docType,
        nameSpaces,
      });
      expect(Array.from(ours)).toEqual(Array.from(auth0));
      // const outer = decodeCbor(ours) as Tag;
      // const actualInner = outer.value as Uint8Array;

      // expect(Array.from(actualInner)).toEqual(Array.from(auth0));
    });

    it('produces identical inner bytes for sessionTranscript as decoded value', () => {
      const sessionInner = ['already', 'decoded'];
      const docType = 'org.iso.18013.5.1.mDL';
      const nameSpaces = { ns: { a: 1 } };

      const auth0 = calculateDeviceAutenticationBytes(
        sessionInner,
        docType,
        nameSpaces
      );

      const ours = encodeDeviceAuthentication({
        sessionTranscript: sessionInner,
        docType,
        nameSpaces,
      });

      expect(Array.from(ours)).toEqual(Array.from(auth0));
    });
  });
});
