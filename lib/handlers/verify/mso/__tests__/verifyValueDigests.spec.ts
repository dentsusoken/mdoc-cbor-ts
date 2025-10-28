import { describe, expect, it } from 'vitest';
import { verifyValueDigests } from '../verifyValueDigests';
import { createTag24 } from '@/cbor/createTag24';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { ErrorsError } from '@/mdoc/ErrorsError';
import { MDocErrorCode } from '@/mdoc/types';
import { calculateDigest } from '@/utils/calculateDigest';
import { Tag } from 'cbor-x';

const ns = 'org.iso.18013.5.1';

const buildIssuerSignedItemTag = (
  digestID: number,
  elementIdentifier: string,
  elementValue: unknown
): Tag => {
  const item = createIssuerSignedItem([
    ['digestID', digestID],
    ['random', new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8])],
    ['elementIdentifier', elementIdentifier],
    ['elementValue', elementValue],
  ]);
  return createTag24(item);
};

describe('verifyValueDigests', () => {
  describe('success cases', () => {
    it('should pass when all digests match', () => {
      const tag = buildIssuerSignedItemTag(1, 'given_name', 'Alice');

      const nameSpaces = new Map<string, Tag[]>([[ns, [tag]]]);

      const expectedDigest = calculateDigest('SHA-256', tag);
      const valueDigests = new Map<string, Map<number, Uint8Array>>([
        [ns, new Map([[1, expectedDigest]])],
      ]);

      expect(() =>
        verifyValueDigests({
          valueDigests,
          nameSpaces,
          digestAlgorithm: 'SHA-256',
        })
      ).not.toThrow();
    });
  });

  describe('error cases', () => {
    it('should throw NameSpaceError when namespace has no digests', () => {
      const tag = buildIssuerSignedItemTag(1, 'given_name', 'Alice');
      const nameSpaces = new Map<string, Tag[]>([[ns, [tag]]]);
      const valueDigests = new Map<string, Map<number, Uint8Array>>([
        [`${ns}.other`, new Map([[1, new Uint8Array([0x00])]])],
      ]);
      try {
        verifyValueDigests({
          valueDigests,
          nameSpaces,
          digestAlgorithm: 'SHA-256',
        });
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.nameSpace).toBe(ns);
        expect(err.errorCode).toBe(
          MDocErrorCode.ValueDigestsMissingForNamespace
        );
      }
    });

    it('should aggregate ErrorsError for missing digestID', () => {
      const tag = buildIssuerSignedItemTag(1, 'given_name', 'Alice');
      const nameSpaces = new Map<string, Tag[]>([[ns, [tag]]]);
      // Missing digest for ID 1
      const valueDigests = new Map<string, Map<number, Uint8Array>>([
        [ns, new Map([[2, new Uint8Array([0x00])]])],
      ]);
      try {
        verifyValueDigests({
          valueDigests,
          nameSpaces,
          digestAlgorithm: 'SHA-256',
        });
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorsError);
        const err = e as ErrorsError;
        expect(err.errors).toBeInstanceOf(Map);
        expect(err.errors.size).toBe(1);
        const nsErrors = err.errors.get(ns);
        expect(nsErrors).toBeInstanceOf(Map);
        expect(nsErrors?.size).toBe(1);
        expect(nsErrors?.get('given_name')).toBe(
          MDocErrorCode.ValueDigestsMissingForDigestId
        );
      }
    });

    it('should aggregate ErrorsError for digest mismatch', () => {
      const tag = buildIssuerSignedItemTag(1, 'given_name', 'Alice');
      const nameSpaces = new Map<string, Tag[]>([[ns, [tag]]]);
      // Wrong digest
      const valueDigests = new Map<string, Map<number, Uint8Array>>([
        [ns, new Map([[1, new Uint8Array([0xde, 0xad])]])],
      ]);

      try {
        verifyValueDigests({
          valueDigests,
          nameSpaces,
          digestAlgorithm: 'SHA-256',
        });
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorsError);
        const err = e as ErrorsError;
        expect(err.errors).toBeInstanceOf(Map);
        expect(err.errors.size).toBe(1);
        const nsErrors = err.errors.get(ns);
        expect(nsErrors).toBeInstanceOf(Map);
        expect(nsErrors?.size).toBe(1);
        expect(nsErrors?.get('given_name')).toBe(
          MDocErrorCode.MsoDigestMismatch
        );
      }
    });

    it('should throw NameSpaceError on CBOR decoding error', () => {
      const tag = new Tag('invalid', 24);
      const nameSpaces = new Map<string, Tag[]>([[ns, [tag]]]);
      const valueDigests = new Map<string, Map<number, Uint8Array>>([
        [ns, new Map([[1, new Uint8Array([0x00])]])],
      ]);

      try {
        verifyValueDigests({
          valueDigests,
          nameSpaces,
          digestAlgorithm: 'SHA-256',
        });
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MDocErrorCode.CborDecodingError);
      }
    });

    it('should throw NameSpaceError on CBOR validation error', () => {
      const invalidItem = new Map<string, unknown>([['foo', 'bar']]);
      const tag = createTag24(invalidItem);
      const digest = calculateDigest('SHA-256', tag);
      const nameSpaces = new Map<string, Tag[]>([[ns, [tag]]]);
      const valueDigests = new Map<string, Map<number, Uint8Array>>([
        [ns, new Map([[1, digest]])],
      ]);

      try {
        verifyValueDigests({
          valueDigests,
          nameSpaces,
          digestAlgorithm: 'SHA-256',
        });
        throw new Error('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MDocErrorCode.CborValidationError);
      }
    });
  });
});
