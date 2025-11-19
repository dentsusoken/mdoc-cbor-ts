import { describe, it, expect } from 'vitest';
import { Tag } from 'cbor-x';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { selectDocumentClaimsByCredential } from '../selectDocumentClaimsByCredential';
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

describe('selectDocumentClaimsByCredential', () => {
  describe('should return selected document when claims are satisfied', () => {
    it('returns new document with selected name spaces when docType matches and claims are satisfied', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'family_name', 'Doe');
      const issuerAuth = makeIssuerAuth();
      const issuerSigned = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1, tag2]]])],
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
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
          {
            path: ['org.iso.18013.5.1', 'family_name'],
            intent_to_retain: false,
          },
        ],
      };

      const result = selectDocumentClaimsByCredential(document, credential);

      expect(result).not.toBeUndefined();
      expect(result!.get('docType')).toBe('org.iso.18013.5.1.mDL');
      const resultIssuerSigned = result!.get('issuerSigned');
      expect(resultIssuerSigned).not.toBeUndefined();
      expect(resultIssuerSigned!.get('issuerAuth')).toBe(issuerAuth);
      const resultNameSpaces = resultIssuerSigned!.get('nameSpaces');
      expect(resultNameSpaces).not.toBeUndefined();
      expect(resultNameSpaces!.get('org.iso.18013.5.1')).toEqual([tag1, tag2]);
    });

    it('returns new document with selected name spaces when using claim sets', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'family_name', 'Doe');
      const issuerAuth = makeIssuerAuth();
      const issuerSigned = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1, tag2]]])],
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

      const result = selectDocumentClaimsByCredential(document, credential);

      expect(result).not.toBeUndefined();
      expect(result!.get('docType')).toBe('org.iso.18013.5.1.mDL');
      const resultIssuerSigned = result!.get('issuerSigned');
      expect(resultIssuerSigned).not.toBeUndefined();
      const resultNameSpaces = resultIssuerSigned!.get('nameSpaces');
      expect(resultNameSpaces).not.toBeUndefined();
      expect(resultNameSpaces!.get('org.iso.18013.5.1')).toEqual([tag1, tag2]);
    });
  });

  describe('should return undefined when document does not match', () => {
    it('returns undefined when docType does not match credential doctype_value', () => {
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
        meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
        multiple: false,
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
      };

      const result = selectDocumentClaimsByCredential(document, credential);

      expect(result).toBeUndefined();
    });
  });

  describe('should return undefined when required claims are not found', () => {
    it('returns undefined when claims cannot be satisfied', () => {
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
        claims: [
          {
            path: ['org.iso.18013.5.1', 'non_existent'],
            intent_to_retain: false,
          },
        ],
      };

      const result = selectDocumentClaimsByCredential(document, credential);

      expect(result).toBeUndefined();
    });

    it('returns undefined when all claim sets fail', () => {
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
        claims: [
          {
            id: 'claim1',
            path: ['org.iso.18013.5.1', 'non_existent1'],
            intent_to_retain: false,
          },
          {
            id: 'claim2',
            path: ['org.iso.18013.5.1', 'non_existent2'],
            intent_to_retain: false,
          },
        ],
        claim_sets: [['claim1'], ['claim2']],
      };

      const result = selectDocumentClaimsByCredential(document, credential);

      expect(result).toBeUndefined();
    });
  });

  describe('should throw ErrorCodeError for missing required fields', () => {
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
        selectDocumentClaimsByCredential(document, credential);
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
        selectDocumentClaimsByCredential(document, credential);
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

    it('throws ErrorCodeError when issuerAuth is missing', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const issuerSigned = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
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
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
      };

      try {
        selectDocumentClaimsByCredential(document, credential);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ErrorCodeError);
        const errorCodeError = error as ErrorCodeError;
        expect(errorCodeError.errorCode).toBe(MdocErrorCode.IssuerAuthMissing);
        expect(errorCodeError.message).toBe(
          'The issuer authentication is missing. - 2007 - IssuerAuthMissing'
        );
      }
    });

    it('throws ErrorCodeError when nameSpaces is missing', () => {
      const issuerAuth = makeIssuerAuth();
      const issuerSigned = createIssuerSigned([['issuerAuth', issuerAuth]]);
      const document = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
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

      try {
        selectDocumentClaimsByCredential(document, credential);
        throw new Error('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ErrorCodeError);
        const errorCodeError = error as ErrorCodeError;
        expect(errorCodeError.errorCode).toBe(
          MdocErrorCode.IssuerNameSpacesMissing
        );
        expect(errorCodeError.message).toBe(
          'The issuer name spaces are missing. - 2006 - IssuerNameSpacesMissing'
        );
      }
    });
  });

  describe('should handle edge cases', () => {
    it('handles document with multiple namespaces', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'document_number', '123456');
      const issuerAuth = makeIssuerAuth();
      const issuerSigned = createIssuerSigned([
        [
          'nameSpaces',
          new Map([
            ['org.iso.18013.5.1', [tag1]],
            ['org.iso.18013.5.2', [tag2]],
          ]),
        ],
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
        claims: [
          {
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
          {
            path: ['org.iso.18013.5.2', 'document_number'],
            intent_to_retain: false,
          },
        ],
      };

      const result = selectDocumentClaimsByCredential(document, credential);

      expect(result).not.toBeUndefined();
      const resultIssuerSigned = result!.get('issuerSigned');
      const resultNameSpaces = resultIssuerSigned!.get('nameSpaces');
      expect(resultNameSpaces!.get('org.iso.18013.5.1')).toEqual([tag1]);
      expect(resultNameSpaces!.get('org.iso.18013.5.2')).toEqual([tag2]);
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

      const result = selectDocumentClaimsByCredential(document, credential);

      expect(result).not.toBeUndefined();
      const resultIssuerSigned = result!.get('issuerSigned');
      const resultNameSpaces = resultIssuerSigned!.get('nameSpaces');
      expect(resultNameSpaces!.size).toBe(0);
    });

    it('handles claim sets with fallback', () => {
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
        claims: [
          {
            id: 'claim1',
            path: ['org.iso.18013.5.1', 'non_existent'],
            intent_to_retain: false,
          },
          {
            id: 'claim2',
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
        claim_sets: [
          ['claim1'], // First claim set fails
          ['claim2'], // Second claim set succeeds
        ],
      };

      const result = selectDocumentClaimsByCredential(document, credential);

      expect(result).not.toBeUndefined();
      const resultIssuerSigned = result!.get('issuerSigned');
      const resultNameSpaces = resultIssuerSigned!.get('nameSpaces');
      expect(resultNameSpaces!.get('org.iso.18013.5.1')).toEqual([tag1]);
    });
  });
});
