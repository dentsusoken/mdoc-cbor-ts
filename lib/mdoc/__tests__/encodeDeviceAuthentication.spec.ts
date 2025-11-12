import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { decodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { encodeDeviceAuthentication } from '../encodeDeviceAuthentication';
import { nameSpacesRecordToMap } from '../nameSpacesRecordToMap';

describe('encodeDeviceAuthentication', () => {
  describe('sessionTranscript as tuple', () => {
    it('embeds sessionTranscript tuple in the array', () => {
      const sessionTranscript: [Uint8Array | null, Uint8Array | null, unknown] =
        [null, null, new Map<string, unknown>([['k', 'v']])];

      const docType = 'org.iso.18013.5.1.mDL';
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Ava',
          age: 30,
        },
      });
      const deviceNameSpacesBytes = createTag24(nameSpaces);

      const encoded = encodeDeviceAuthentication({
        sessionTranscript,
        docType,
        deviceNameSpacesBytes,
      });

      const outer = decodeCbor(encoded) as Tag;
      expect(outer).toBeInstanceOf(Tag);
      expect(outer.tag).toBe(24);

      const inner = decodeCbor(outer.value as Uint8Array) as [
        string,
        [Uint8Array | null, Uint8Array | null, unknown],
        string,
        Tag,
      ];

      expect(inner[0]).toBe('DeviceAuthentication');
      expect(inner[1]).toEqual(sessionTranscript);
      expect(inner[2]).toBe(docType);

      const nsTag = inner[3];
      expect(nsTag).toBeInstanceOf(Tag);
      expect(nsTag.tag).toBe(24);

      const nsDecoded = decodeCbor(nsTag.value as Uint8Array) as Map<
        string,
        Map<string, unknown>
      >;
      expect(nsDecoded).toEqual(nameSpaces);
    });

    it('embeds sessionTranscript with null values', () => {
      const sessionTranscript: [Uint8Array | null, Uint8Array | null, unknown] =
        [null, null, 'handover'];
      const docType = 'org.iso.18013.5.1.mDL';
      const nameSpaces = nameSpacesRecordToMap({ ns: { a: 1 } });
      const deviceNameSpacesBytes = createTag24(nameSpaces);

      const encoded = encodeDeviceAuthentication({
        sessionTranscript,
        docType,
        deviceNameSpacesBytes,
      });

      const outer = decodeCbor(encoded) as Tag;
      const inner = decodeCbor(outer.value as Uint8Array) as [
        string,
        [Uint8Array | null, Uint8Array | null, unknown],
        string,
        Tag,
      ];

      expect(inner[0]).toBe('DeviceAuthentication');
      expect(inner[1]).toEqual(sessionTranscript);
      expect(inner[2]).toBe(docType);
      expect(inner[3]).toBeInstanceOf(Tag);
    });
  });
});
