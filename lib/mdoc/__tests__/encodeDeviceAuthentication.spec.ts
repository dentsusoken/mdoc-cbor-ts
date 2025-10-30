import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { encodeCbor, decodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import {
  decodeSessionTranscript,
  toNameSpacesTag,
  encodeDeviceAuthentication,
} from '../encodeDeviceAuthentication';

describe('encodeDeviceAuthentication', () => {
  describe('sessionTranscript: Uint8Array', () => {
    it('embeds decoded sessionTranscript (from Tag24 bytes) in the array', () => {
      const sessionInner = new Map<string, unknown>([['k', 'v']]);
      const sessionTranscriptBytes = encodeCbor(createTag24(sessionInner));

      const docType = 'org.iso.18013.5.1.mDL';
      const nameSpaces = {
        'org.iso.18013.5.1': {
          given_name: 'Ava',
          age: 30,
        },
      };

      const encoded = encodeDeviceAuthentication({
        sessionTranscript: sessionTranscriptBytes,
        docType,
        nameSpaces,
      });

      const outer = decodeCbor(encoded) as Tag;
      expect(outer).toBeInstanceOf(Tag);
      expect(outer.tag).toBe(24);

      const inner = decodeCbor(outer.value as Uint8Array) as [
        string,
        unknown,
        string,
        Tag,
      ];

      expect(inner[0]).toBe('DeviceAuthentication');
      expect(inner[1]).toEqual(sessionInner);
      expect(inner[2]).toBe(docType);

      const nsTag = inner[3];
      expect(nsTag).toBeInstanceOf(Tag);
      expect(nsTag.tag).toBe(24);

      const nsDecoded = decodeCbor(nsTag.value as Uint8Array) as Map<
        string,
        Map<string, unknown>
      >;
      const expectedNs = new Map<string, Map<string, unknown>>([
        [
          'org.iso.18013.5.1',
          new Map<string, unknown>([
            ['given_name', 'Ava'],
            ['age', 30],
          ]),
        ],
      ]);
      expect(nsDecoded).toEqual(expectedNs);
    });
  });

  describe('sessionTranscript: decoded value', () => {
    it('embeds sessionTranscript as-is when already decoded', () => {
      const sessionInner = ['already', 'decoded'];
      const docType = 'org.iso.18013.5.1.mDL';
      const nameSpaces = { ns: { a: 1 } };

      const encoded = encodeDeviceAuthentication({
        sessionTranscript: sessionInner,
        docType,
        nameSpaces,
      });

      const outer = decodeCbor(encoded) as Tag;
      const inner = decodeCbor(outer.value as Uint8Array) as [
        string,
        unknown,
        string,
        Tag,
      ];

      expect(inner[0]).toBe('DeviceAuthentication');
      expect(inner[1]).toEqual(sessionInner);
      expect(inner[2]).toBe(docType);
      expect(inner[3]).toBeInstanceOf(Tag);
    });
  });
  describe('decodeSessionTranscript', () => {
    it('returns decoded value when input is Tag24 as Uint8Array', () => {
      const innerValue = { x: 1 };
      const bytes = encodeCbor(createTag24(innerValue));
      const decoded = decodeSessionTranscript(bytes);
      // cbor-x decodes objects to Map
      expect(decoded).toEqual(new Map([['x', 1]]));
    });

    it('returns input as-is when not Uint8Array', () => {
      const value = 123;
      expect(decodeSessionTranscript(value)).toBe(123);
    });
  });

  describe('toNameSpacesTag', () => {
    it('wraps a Map-of-Maps in Tag 24', () => {
      const nameSpaces = {
        ns1: { a: 1, b: 'x' },
      };
      const tag = toNameSpacesTag(nameSpaces);
      expect(tag).toBeInstanceOf(Tag);
      expect(tag.tag).toBe(24);

      const decoded = decodeCbor(tag.value as Uint8Array) as Map<
        string,
        Map<string, unknown>
      >;
      expect(decoded).toEqual(
        new Map<string, Map<string, unknown>>([
          [
            'ns1',
            new Map<string, unknown>([
              ['a', 1],
              ['b', 'x'],
            ]),
          ],
        ])
      );
    });
  });
});
