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
        expect(err.errorCode).toBe(
          MDocErrorCode.ValueDigestsMissingForNamespace
        );
        expect(err.message).toBe(
          `Value digests missing for namespace: ${ns} - 2001 - ValueDigestsMissingForNamespace`
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
        expect(err.message).toBe(
          'Value digests verification failed: [\n' +
            '  [\n' +
            '    "org.iso.18013.5.1",\n' +
            '    [\n' +
            '      [\n' +
            '        "given_name",\n' +
            '        "ValueDigestsMissingForDigestId"\n' +
            '      ]\n' +
            '    ]\n' +
            '  ]\n' +
            ']'
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
        expect(err.message).toBe(
          'Value digests verification failed: [\n' +
            '  [\n' +
            '    "org.iso.18013.5.1",\n' +
            '    [\n' +
            '      [\n' +
            '        "given_name",\n' +
            '        "MsoDigestMismatch"\n' +
            '      ]\n' +
            '    ]\n' +
            '  ]\n' +
            ']'
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

    it('should include index and original decode message in CBOR decoding ErrorCodeError', () => {
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
        expect(err.message).toBe(
          'Failed to cbor-decode issuer-signed item[0]: Source must be a Uint8Array or Buffer but was a string - 1 - CborDecodingError'
        );
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
        // Assert exact message including zod details
        expect(err.message).toBe(
          'Failed to validate issuer-signed item[0] structure: [\n' +
            '  {\n' +
            '    "code": "custom",\n' +
            '    "message": "IssuerSignedItem: Missing required keys: digestID, random, elementIdentifier",\n' +
            '    "path": []\n' +
            '  }\n' +
            '] - 2 - CborValidationError'
        );
      }
    });
  });
});
