import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { selectDocumentsClaims } from '../selectDocumentsClaims';
import { createDocument } from '@/schemas/mdoc/Document';
import { createIssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { DcqlCredential } from '../../schemas/DcqlCredential';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';

/**
 * Helper to build a Tag(24) containing an IssuerSignedItem map.
 */
const makeItemTag = (
  digestID: number,
  elementIdentifier: string,
  elementValue: unknown
): Tag =>
  createTag24(
    createIssuerSignedItem([
      ['digestID', digestID],
      ['random', new Uint8Array([digestID])],
      ['elementIdentifier', elementIdentifier],
      ['elementValue', elementValue],
    ])
  );

/**
 * Helper to create a minimal issuerAuth Tag(18).
 */
const makeIssuerAuth = (): Tag => {
  const issuerAuthTuple: Tag18Content = [
    new Uint8Array([]),
    new Map<number, unknown>(),
    null,
    new Uint8Array([]),
  ];
  return createTag18(issuerAuthTuple);
};

describe('selectDocumentsClaims', () => {
  describe('should return single document when multiple is false', () => {
    it('returns first matching document and stops processing', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'given_name', 'Jane');
      const issuerAuth1 = makeIssuerAuth();
      const issuerAuth2 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const issuerSigned2 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag2]]])],
        ['issuerAuth', issuerAuth2],
      ]);
      const document1 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned1],
      ]);
      const document2 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned2],
      ]);

      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
      };

      const result = selectDocumentsClaims([document1, document2], credential);

      expect(result).toHaveLength(1);
      expect(result[0].get('docType')).toBe('org.iso.18013.5.1.mDL');
      const resultIssuerSigned = result[0].get('issuerSigned');
      const resultNameSpaces = resultIssuerSigned!.get('nameSpaces');
      expect(resultNameSpaces!.get('org.iso.18013.5.1')).toEqual([tag1]);
    });

    it('returns empty array when no documents match', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const issuerAuth = makeIssuerAuth();
      const issuerSigned = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth],
      ]);
      const document = createDocument([
        ['docType', 'org.iso.18013.5.2.mDL'],
        ['issuerSigned', issuerSigned],
      ]);

      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
      };

      const result = selectDocumentsClaims([document], credential);

      expect(result).toHaveLength(0);
    });

    it('skips non-matching documents and returns first match', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'given_name', 'Jane');
      const issuerAuth1 = makeIssuerAuth();
      const issuerAuth2 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const issuerSigned2 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag2]]])],
        ['issuerAuth', issuerAuth2],
      ]);
      const document1 = createDocument([
        ['docType', 'org.iso.18013.5.2.mDL'],
        ['issuerSigned', issuerSigned1],
      ]);
      const document2 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned2],
      ]);

      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
      };

      const result = selectDocumentsClaims([document1, document2], credential);

      expect(result).toHaveLength(1);
      expect(result[0].get('docType')).toBe('org.iso.18013.5.1.mDL');
      const resultIssuerSigned = result[0].get('issuerSigned');
      const resultNameSpaces = resultIssuerSigned!.get('nameSpaces');
      expect(resultNameSpaces!.get('org.iso.18013.5.1')).toEqual([tag2]);
    });
  });

  describe('should return multiple documents when multiple is true', () => {
    it('returns all matching documents', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'given_name', 'Jane');
      const issuerAuth1 = makeIssuerAuth();
      const issuerAuth2 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const issuerSigned2 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag2]]])],
        ['issuerAuth', issuerAuth2],
      ]);
      const document1 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned1],
      ]);
      const document2 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned2],
      ]);

      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: true,
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
      };

      const result = selectDocumentsClaims([document1, document2], credential);

      expect(result).toHaveLength(2);
      expect(result[0].get('docType')).toBe('org.iso.18013.5.1.mDL');
      expect(result[1].get('docType')).toBe('org.iso.18013.5.1.mDL');
      const resultIssuerSigned1 = result[0].get('issuerSigned');
      const resultIssuerSigned2 = result[1].get('issuerSigned');
      const resultNameSpaces1 = resultIssuerSigned1!.get('nameSpaces');
      const resultNameSpaces2 = resultIssuerSigned2!.get('nameSpaces');
      expect(resultNameSpaces1!.get('org.iso.18013.5.1')).toEqual([tag1]);
      expect(resultNameSpaces2!.get('org.iso.18013.5.1')).toEqual([tag2]);
    });

    it('filters out non-matching documents and returns only matches', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'given_name', 'Jane');
      const issuerAuth1 = makeIssuerAuth();
      const issuerAuth2 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const issuerSigned2 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag2]]])],
        ['issuerAuth', issuerAuth2],
      ]);
      const document1 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned1],
      ]);
      const document2 = createDocument([
        ['docType', 'org.iso.18013.5.2.mDL'],
        ['issuerSigned', issuerSigned2],
      ]);
      const document3 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned2],
      ]);

      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: true,
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
      };

      const result = selectDocumentsClaims(
        [document1, document2, document3],
        credential
      );

      expect(result).toHaveLength(2);
      expect(result[0].get('docType')).toBe('org.iso.18013.5.1.mDL');
      expect(result[1].get('docType')).toBe('org.iso.18013.5.1.mDL');
    });

    it('returns empty array when no documents match', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const issuerAuth = makeIssuerAuth();
      const issuerSigned = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth],
      ]);
      const document1 = createDocument([
        ['docType', 'org.iso.18013.5.2.mDL'],
        ['issuerSigned', issuerSigned],
      ]);
      const document2 = createDocument([
        ['docType', 'org.iso.18013.5.2.mDL'],
        ['issuerSigned', issuerSigned],
      ]);

      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: true,
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
      };

      const result = selectDocumentsClaims([document1, document2], credential);

      expect(result).toHaveLength(0);
    });
  });

  describe('should handle edge cases', () => {
    it('returns empty array when documents array is empty', () => {
      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
      };

      const result = selectDocumentsClaims([], credential);

      expect(result).toHaveLength(0);
    });

    it('handles documents with claim sets', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'family_name', 'Doe');
      const issuerAuth1 = makeIssuerAuth();
      const issuerAuth2 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1, tag2]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const issuerSigned2 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth2],
      ]);
      const document1 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned1],
      ]);
      const document2 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned2],
      ]);

      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: true,
        claims: [
          {
            id: 'claim1',
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
          {
            id: 'claim2',
            path: ['org.iso.18013.5.1', 'family_name'],
            intent_to_retain: false,
          },
        ],
        claim_sets: [['claim1', 'claim2']],
      };

      const result = selectDocumentsClaims([document1, document2], credential);

      expect(result).toHaveLength(1);
      expect(result[0].get('docType')).toBe('org.iso.18013.5.1.mDL');
    });

    it('handles credential with undefined claims', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const issuerAuth = makeIssuerAuth();
      const issuerSigned = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth],
      ]);
      const document = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned],
      ]);

      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };

      const result = selectDocumentsClaims([document], credential);

      expect(result).toHaveLength(1);
      expect(result[0].get('docType')).toBe('org.iso.18013.5.1.mDL');
    });
  });

  describe('should propagate errors from selectDocumentClaims', () => {
    it('throws ErrorCodeError when docType is missing', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const issuerAuth = makeIssuerAuth();
      const issuerSigned = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth],
      ]);
      const document = createDocument([['issuerSigned', issuerSigned]]);

      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
      };

      try {
        selectDocumentsClaims([document], credential);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ErrorCodeError);
        const errorCodeError = error as ErrorCodeError;
        expect(errorCodeError.errorCode).toBe(MdocErrorCode.DocTypeMissing);
        expect(errorCodeError.message).toBe(
          'The document type is missing. - 2015 - DocTypeMissing'
        );
      }
    });

    it('throws ErrorCodeError when issuerSigned is missing', () => {
      const document = createDocument([['docType', 'org.iso.18013.5.1.mDL']]);

      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
      };

      try {
        selectDocumentsClaims([document], credential);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ErrorCodeError);
        const errorCodeError = error as ErrorCodeError;
        expect(errorCodeError.errorCode).toBe(
          MdocErrorCode.IssuerSignedMissing
        );
        expect(errorCodeError.message).toBe(
          'The issuer-signed structure is missing. - 2016 - IssuerSignedMissing'
        );
      }
    });
  });
});
