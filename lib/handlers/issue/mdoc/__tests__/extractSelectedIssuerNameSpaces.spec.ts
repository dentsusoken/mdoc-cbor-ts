import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { createTag24 } from '@/cbor/createTag24';
import { decodeCbor } from '@/cbor/codec';
import {
  createIssuerSignedItem,
  IssuerSignedItem,
} from '@/schemas/mdoc/IssuerSignedItem';
import { extractSelectedIssuerNameSpaces } from '../extractSelectedIssuerNameSpaces';

const makeItem = (
  digestID: number,
  elementIdentifier: string,
  elementValue: unknown
): Tag => {
  return createTag24(
    createIssuerSignedItem([
      ['digestID', digestID],
      ['random', new Uint8Array([digestID])],
      ['elementIdentifier', elementIdentifier],
      ['elementValue', elementValue],
    ])
  );
};

const unwrap = (tag: Tag): IssuerSignedItem =>
  decodeCbor(tag.value) as IssuerSignedItem;

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

    const requested = {
      'org.iso.18013.5.1': ['given_name', 'family_name'],
    };

    const result = extractSelectedIssuerNameSpaces(issuerNameSpaces, requested);

    const selected = result.get('org.iso.18013.5.1')!;
    expect(selected.length).toBe(2);
    const item1 = unwrap(selected[0]);
    const item2 = unwrap(selected[1]);
    expect(item1.get('elementIdentifier')).toBe('given_name');
    expect(item1.get('elementValue')).toBe('John');
    expect(item2.get('elementIdentifier')).toBe('family_name');
    expect(item2.get('elementValue')).toBe('Doe');
  });

  it('skips namespaces not present in request', () => {
    const issuerNameSpaces = new Map<string, Tag[]>([
      ['ns1', [makeItem(1, 'a', 1)]],
      ['ns2', [makeItem(2, 'b', 2)]],
    ]);
    const requested = { ns2: ['b'] };

    const result = extractSelectedIssuerNameSpaces(issuerNameSpaces, requested);

    expect([...result.keys()]).toEqual(['ns2']);
    const ns2 = result.get('ns2')!;
    expect(ns2.length).toBe(1);
    const inner = unwrap(ns2[0]);
    expect(inner.get('elementIdentifier')).toBe('b');
    expect(inner.get('elementValue')).toBe(2);
  });

  it('returns empty array for namespace when none of its elements match', () => {
    const issuerNameSpaces = new Map<string, Tag[]>([
      ['ns', [makeItem(1, 'a', 1), makeItem(2, 'b', 2)]],
    ]);
    const requested = { ns: ['c'] };

    const result = extractSelectedIssuerNameSpaces(issuerNameSpaces, requested);

    expect(result.get('ns')).toEqual([]);
  });
});
