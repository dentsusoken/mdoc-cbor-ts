import { describe, expect, it } from 'vitest';
import { verifyValueDigests } from '../verifyValueDigests';
import { createTag24 } from '@/cbor/createTag24';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
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
    it('should throw ErrorCodeError with ValueDigestsMissing when namespace has no digests', () => {
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
        expect(err.errorCode).toBe(MdocErrorCode.ValueDigestsMissing);
        expect(err.message).toBe(
          `Value digests missing for namespace: ${ns} - 2001 - ValueDigestsMissing`
        );
      }
    });

    it('should throw ErrorCodeError with IssuerSignedItemCborDecodingError on CBOR decoding error', () => {
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
        expect(err.errorCode).toBe(
          MdocErrorCode.IssuerSignedItemCborDecodingError
        );
        expect(err.message).toBe(
          `Failed to cbor-decode issuer-signed item[0]: Source must be a Uint8Array or Buffer but was a string - ${MdocErrorCode.IssuerSignedItemCborDecodingError} - IssuerSignedItemCborDecodingError`
        );
      }
    });

    it('should throw ErrorCodeError with IssuerSignedItemCborValidationError on CBOR validation error', () => {
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
        expect(err.errorCode).toBe(
          MdocErrorCode.IssuerSignedItemCborValidationError
        );
        expect(err.message).toBe(
          `Failed to validate issuer-signed item[0] structure: [\n  {\n    "code": "custom",\n    "message": "IssuerSignedItem: Missing required keys: digestID, random, elementIdentifier",\n    "path": []\n  }\n] - ${MdocErrorCode.IssuerSignedItemCborValidationError} - IssuerSignedItemCborValidationError`
        );
      }
    });

    it('should throw ErrorCodeError with ValueDigestMissing when digest is missing for digestID', () => {
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
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.ValueDigestMissing);
        expect(err.message).toBe(
          `Value digest missing for elementIdentifier: given_name - ${MdocErrorCode.ValueDigestMissing} - ValueDigestMissing`
        );
      }
    });

    it('should throw ErrorCodeError with ValueDigestMismatch when digest does not match', () => {
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
        expect(e).toBeInstanceOf(ErrorCodeError);
        const err = e as ErrorCodeError;
        expect(err.errorCode).toBe(MdocErrorCode.ValueDigestMismatch);
        expect(err.message).toBe(
          `Value digest mismatch for elementIdentifier: given_name - ${MdocErrorCode.ValueDigestMismatch} - ValueDigestMismatch`
        );
      }
    });
  });
});
