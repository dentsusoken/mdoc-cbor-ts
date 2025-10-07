import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { Tag } from 'cbor-x';
import { createTag24 } from '@/cbor/createTag24';
import { decodeCbor } from '@/cbor/codec';
import {
  IssuerSignedItem,
  issuerSignedItemSchema,
} from '@/schemas/mdoc/IssuerSignedItem';
import { extractSelectedIssuerNameSpaces } from '../extractSelectedIssuerNameSpaces';
import { NameSpaceElementIdentifiers } from '@/schemas/record/NameSpaceElementIdentifiers';

const makeItem = (
  digestID: number,
  elementIdentifier: string,
  elementValue: unknown
): Tag => {
  return createTag24({
    digestID,
    random: new Uint8Array([digestID]),
    elementIdentifier,
    elementValue,
  });
};

const unwrap = (tag: Tag): IssuerSignedItem =>
  issuerSignedItemSchema.parse(decodeCbor(tag.value as Uint8Array));

describe('extractSelectedIssuerNameSpaces', () => {
  it('filters elements within requested namespaces by element identifiers', () => {
    const issuerNameSpaces = new Map<string, Tag[]>([
      [
        'org.iso.18013.5.1',
        [
          makeItem(1, 'given_name', 'John'),
          makeItem(2, 'family_name', 'Doe'),
          makeItem(3, 'age', 30),
        ],
      ],
      ['org.iso.18013.5.2', [makeItem(4, 'document_number', '1234567890')]],
    ]);

    const requested: NameSpaceElementIdentifiers = {
      'org.iso.18013.5.1': ['given_name', 'family_name'],
    };

    const result = extractSelectedIssuerNameSpaces(issuerNameSpaces, requested);

    const selected = result.get('org.iso.18013.5.1')!;
    expect(selected.length).toBe(2);
    expect(unwrap(selected[0]).elementIdentifier).toBe('given_name');
    expect(unwrap(selected[0]).elementValue).toBe('John');
    expect(unwrap(selected[1]).elementIdentifier).toBe('family_name');
    expect(unwrap(selected[1]).elementValue).toBe('Doe');
  });

  it('skips namespaces not present in request', () => {
    const issuerNameSpaces = new Map<string, Tag[]>([
      ['ns1', [makeItem(1, 'a', 1)]],
      ['ns2', [makeItem(2, 'b', 2)]],
    ]);
    const requested: NameSpaceElementIdentifiers = { ns2: ['b'] };

    const result = extractSelectedIssuerNameSpaces(issuerNameSpaces, requested);

    expect([...result.keys()]).toEqual(['ns2']);
    const ns2 = result.get('ns2')!;
    expect(ns2.length).toBe(1);
    const inner = unwrap(ns2[0]);
    expect(inner.elementIdentifier).toBe('b');
    expect(inner.elementValue).toBe(2);
  });

  it('returns empty array for namespace when none of its elements match', () => {
    const issuerNameSpaces = new Map<string, Tag[]>([
      ['ns', [makeItem(1, 'a', 1), makeItem(2, 'b', 2)]],
    ]);
    const requested: NameSpaceElementIdentifiers = { ns: ['c'] };

    const result = extractSelectedIssuerNameSpaces(issuerNameSpaces, requested);

    expect(result.get('ns')).toEqual([]);
  });

  it('throws ZodError when input IssuerNameSpaces is invalid type', () => {
    const badInput = 'not-a-map';
    const requested: NameSpaceElementIdentifiers = { ns: ['a'] };

    try {
      // @ts-expect-error - intentionally pass non-Map to assert IssuerNameSpaces invalid type
      extractSelectedIssuerNameSpaces(badInput, requested);
      expect.fail('Expected ZodError for invalid IssuerNameSpaces');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      // IssuerNameSpaces uses Map schema; invalid type should surface mapInvalidTypeMessage
      expect(zodError.issues[0].message).toMatch(
        /IssuerNameSpaces: Expected a map/
      );
    }
  });

  it('throws ZodError when requested identities record is invalid type', () => {
    const issuerNameSpaces = new Map<string, Tag[]>([
      ['ns', [makeItem(1, 'a', 1)]],
    ]);
    const badRequested = 'not-a-record';

    try {
      // @ts-expect-error - intentionally pass invalid requested identities
      extractSelectedIssuerNameSpaces(issuerNameSpaces, badRequested);
      expect.fail(
        'Expected ZodError for invalid NameSpaceElementIdentifiersRecord'
      );
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toMatch(
        /NameSpaceElementIdentifiers: Expected a record/
      );
    }
  });

  it('throws ZodError when requested identities has empty array', () => {
    const issuerNameSpaces = new Map<string, Tag[]>([
      ['ns', [makeItem(1, 'a', 1)]],
    ]);
    const badRequested: NameSpaceElementIdentifiers = {
      ns: [],
    };

    try {
      extractSelectedIssuerNameSpaces(issuerNameSpaces, badRequested);
      expect.fail('Expected ZodError for empty DataElementsArray');
    } catch (error) {
      expect(error).toBeInstanceOf(z.ZodError);
      const zodError = error as z.ZodError;
      expect(zodError.issues[0].message).toMatch(
        /DataElementIdentifiers: At least one entry must be provided/
      );
    }
  });
});
