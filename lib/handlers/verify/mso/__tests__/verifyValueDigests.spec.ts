import { describe, it, expect } from 'vitest';
import { createTag24 } from '@/cbor/createTag24';
import { encodeCbor } from '@/cbor/codec';
import { verifyValueDigests } from '../verifyValueDigests.ts';
import { ErrorsError } from '../ErrorsError';
import { ErrorCode } from '@/schemas/error/ErrorCode';
import type { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';

describe('verifyValueDigests', () => {
  const mockRandom = new Uint8Array(32);

  it('passes when digest maps exist and calculated digests match', async () => {
    const item1 = {
      digestID: 1,
      random: mockRandom,
      elementIdentifier: 'a',
      elementValue: 'A',
    };
    const item2 = {
      digestID: 2,
      random: mockRandom,
      elementIdentifier: 'b',
      elementValue: 'B',
    };
    const tag1 = createTag24(item1);
    const tag2 = createTag24(item2);

    const nameSpaces: IssuerNameSpaces = new Map([['ns', [tag1, tag2]]]);

    // Precompute expected digests using the same function as implementation
    const expectedDigest1 = new Uint8Array(
      await crypto.subtle.digest('SHA-256', encodeCbor(tag1))
    );
    const expectedDigest2 = new Uint8Array(
      await crypto.subtle.digest('SHA-256', encodeCbor(tag2))
    );

    const valueDigests = new Map<string, Map<number, Uint8Array>>([
      [
        'ns',
        new Map<number, Uint8Array>([
          [1, expectedDigest1],
          [2, expectedDigest2],
        ]),
      ],
    ]);

    await expect(
      verifyValueDigests({
        valueDigests,
        nameSpaces,
        digestAlgorithm: 'SHA-256',
      })
    ).resolves.toBeUndefined();
  });

  it('throws ErrorsError with namespace-level error when namespace missing in valueDigests', async () => {
    const item = {
      digestID: 1,
      random: mockRandom,
      elementIdentifier: 'a',
      elementValue: 'A',
    };
    const tag = createTag24(item);
    const nameSpaces: IssuerNameSpaces = new Map([['ns', [tag]]]);
    const valueDigests = new Map<string, Map<number, Uint8Array>>();

    try {
      await verifyValueDigests({
        valueDigests,
        nameSpaces,
        digestAlgorithm: 'SHA-256',
      });
      throw new Error('Expected ErrorsError');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorsError);
      const err = error as ErrorsError;
      expect(err.message).toBe('Value digests verification failed');
      expect(err.errors).toEqual(
        new Map([
          [
            'ns',
            new Map([
              [':namespace', ErrorCode.value_digests_missing_for_namespace],
            ]),
          ],
        ])
      );
    }
  });

  it('throws ErrorsError with element-level error when digestID missing', async () => {
    const item = {
      digestID: 3,
      random: mockRandom,
      elementIdentifier: 'x',
      elementValue: 'X',
    };
    const tag = createTag24(item);
    const nameSpaces: IssuerNameSpaces = new Map([['ns', [tag]]]);
    const valueDigests = new Map<string, Map<number, Uint8Array>>([
      ['ns', new Map<number, Uint8Array>([[1, new Uint8Array([1])]])],
    ]);

    try {
      await verifyValueDigests({
        valueDigests,
        nameSpaces,
        digestAlgorithm: 'SHA-256',
      });
      throw new Error('Expected ErrorsError');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorsError);
      const err = error as ErrorsError;
      expect(err.message).toBe('Value digests verification failed');
      expect(err.errors).toEqual(
        new Map([
          [
            'ns',
            new Map([['x', ErrorCode.value_digests_missing_for_digest_id]]),
          ],
        ])
      );
    }
  });

  it('throws ErrorsError when calculated digest mismatches expected', async () => {
    const item = {
      digestID: 1,
      random: mockRandom,
      elementIdentifier: 'a',
      elementValue: 'A',
    };
    const tag = createTag24(item);
    const nameSpaces: IssuerNameSpaces = new Map([['ns', [tag]]]);
    const valueDigests = new Map<string, Map<number, Uint8Array>>([
      ['ns', new Map<number, Uint8Array>([[1, new Uint8Array([9, 9, 9])]])],
    ]);

    try {
      await verifyValueDigests({
        valueDigests,
        nameSpaces,
        digestAlgorithm: 'SHA-256',
      });
      throw new Error('Expected ErrorsError');
    } catch (error) {
      expect(error).toBeInstanceOf(ErrorsError);
      const err = error as ErrorsError;
      expect(err.message).toBe('Value digests verification failed');
      const nsErrors = err.errors.get('ns');
      expect(nsErrors).toEqual(new Map([['a', ErrorCode.mso_digest_mismatch]]));
    }
  });
});
