import { describe, it, expect, vi } from 'vitest';
import { Tag } from 'cbor-x';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { selectDocumentsClaimsByQuery } from '../selectDocumentsClaimsByQuery';
import { createDocument } from '@/schemas/mdoc/Document';
import { createIssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { DcqlQuery } from '../../schemas/DcqlQuery';
import * as selectDocumentsClaimsByCredentialSetModule from '../selectDocumentsClaimsByCredentialSet';
import * as selectDocumentsClaimsByCredentialsModule from '../selectDocumentsClaimsByCredentials';

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

describe('selectDocumentsClaimsByQuery', () => {
  describe('should process credential sets mode', () => {
    it('returns Map when single credential set matches', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'license_number', 'D1234567');
      const issuerAuth1 = makeIssuerAuth();
      const issuerAuth2 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const issuerSigned2 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.2', [tag2]]])],
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

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'cred-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
          {
            id: 'cred-2',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.2', 'license_number'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
        credential_sets: [
          {
            options: [['cred-1', 'cred-2']],
            required: true,
          },
        ],
      };

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialSetModule,
        'selectDocumentsClaimsByCredentialSet'
      );
      selectSpy.mockImplementationOnce(() => {
        return new Map([
          ['cred-1', [document1]],
          ['cred-2', [document2]],
        ]);
      });

      const result = selectDocumentsClaimsByQuery(
        [document1, document2],
        query
      );

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(2);
      expect(result!.get('cred-1')).toEqual([document1]);
      expect(result!.get('cred-2')).toEqual([document2]);
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });

    it('merges results from multiple credential sets', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'license_number', 'D1234567');
      const tag3 = makeItemTag(3, 'age', 30);
      const issuerAuth1 = makeIssuerAuth();
      const issuerAuth2 = makeIssuerAuth();
      const issuerAuth3 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const issuerSigned2 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.2', [tag2]]])],
        ['issuerAuth', issuerAuth2],
      ]);
      const issuerSigned3 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag3]]])],
        ['issuerAuth', issuerAuth3],
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
        ['issuerSigned', issuerSigned3],
      ]);

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'cred-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
          {
            id: 'cred-2',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.2', 'license_number'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
          {
            id: 'cred-3',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'age'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
        credential_sets: [
          {
            options: [['cred-1', 'cred-2']],
            required: true,
          },
          {
            options: [['cred-3']],
            required: false,
          },
        ],
      };

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialSetModule,
        'selectDocumentsClaimsByCredentialSet'
      );
      selectSpy
        .mockImplementationOnce(() => {
          // First credential set matches
          return new Map([
            ['cred-1', [document1]],
            ['cred-2', [document2]],
          ]);
        })
        .mockImplementationOnce(() => {
          // Second credential set matches
          return new Map([['cred-3', [document3]]]);
        });

      const result = selectDocumentsClaimsByQuery(
        [document1, document2, document3],
        query
      );

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(3);
      expect(result!.get('cred-1')).toEqual([document1]);
      expect(result!.get('cred-2')).toEqual([document2]);
      expect(result!.get('cred-3')).toEqual([document3]);
      expect(selectSpy).toHaveBeenCalledTimes(2);
    });

    it('skips optional credential sets that do not match', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const issuerAuth1 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const document1 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned1],
      ]);

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'cred-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
          {
            id: 'cred-2',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.2', 'license_number'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
        credential_sets: [
          {
            options: [['cred-1']],
            required: false, // Optional, matches
          },
          {
            options: [['cred-2']],
            required: false, // Optional, does not match
          },
        ],
      };

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialSetModule,
        'selectDocumentsClaimsByCredentialSet'
      );
      selectSpy
        .mockImplementationOnce(() => {
          // First credential set matches
          return new Map([['cred-1', [document1]]]);
        })
        .mockImplementationOnce(() => {
          // Second credential set does not match
          return undefined;
        });

      const result = selectDocumentsClaimsByQuery([document1], query);

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(1);
      expect(result!.get('cred-1')).toEqual([document1]);
      expect(selectSpy).toHaveBeenCalledTimes(2);
    });

    it('returns empty Map when all credential sets are optional and do not match', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const issuerAuth1 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const document1 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned1],
      ]);

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'cred-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.2', 'license_number'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
        credential_sets: [
          {
            options: [['cred-1']],
            required: false, // Optional, does not match
          },
        ],
      };

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialSetModule,
        'selectDocumentsClaimsByCredentialSet'
      );
      selectSpy.mockImplementationOnce(() => {
        // No match
        return undefined;
      });

      const result = selectDocumentsClaimsByQuery([document1], query);

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(0);
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('should throw error when required credential set does not match', () => {
    it('throws error when first required credential set does not match', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const issuerAuth1 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const document1 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned1],
      ]);

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'cred-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.2', 'license_number'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
          {
            id: 'cred-2',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'age'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
        credential_sets: [
          {
            options: [['cred-1']],
            required: true, // First required set, does not match
          },
          {
            options: [['cred-2']],
            required: false, // Optional set (will not be processed)
          },
        ],
      };

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialSetModule,
        'selectDocumentsClaimsByCredentialSet'
      );
      selectSpy.mockImplementationOnce(() => {
        // No match, throws error
        throw new Error(
          'The required credential set did not match any documents. Options: [["cred-1"]]'
        );
      });

      expect(() => {
        selectDocumentsClaimsByQuery([document1], query);
      }).toThrow(
        'The required credential set did not match any documents. Options:'
      );

      expect(selectSpy).toHaveBeenCalledTimes(1); // Only first set is processed
    });
  });

  describe('should process individual credentials mode', () => {
    it('returns Map when all credentials match', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag2 = makeItemTag(2, 'license_number', 'D1234567');
      const issuerAuth1 = makeIssuerAuth();
      const issuerAuth2 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const issuerSigned2 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.2', [tag2]]])],
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

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'cred-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
          {
            id: 'cred-2',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.2', 'license_number'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
      };

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialsModule,
        'selectDocumentsClaimsByCredentials'
      );
      selectSpy.mockImplementationOnce(() => {
        return new Map([
          ['cred-1', [document1]],
          ['cred-2', [document2]],
        ]);
      });

      const result = selectDocumentsClaimsByQuery(
        [document1, document2],
        query
      );

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(2);
      expect(result!.get('cred-1')).toEqual([document1]);
      expect(result!.get('cred-2')).toEqual([document2]);
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });

    it('returns undefined when any credential does not match', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const issuerAuth1 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const document1 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned1],
      ]);

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'cred-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
          {
            id: 'cred-2',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.2', 'license_number'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
      };

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialsModule,
        'selectDocumentsClaimsByCredentials'
      );
      selectSpy.mockImplementationOnce(() => {
        // No match
        return undefined;
      });

      const result = selectDocumentsClaimsByQuery([document1], query);

      expect(result).toBeUndefined();
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('should propagate errors', () => {
    it('propagates error from selectDocumentsClaimsByCredentialSet', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const issuerAuth1 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const document1 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned1],
      ]);

      const query: DcqlQuery = {
        credentials: [
          {
            id: 'cred-1',
            format: 'mso_mdoc',
            meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
            claims: [
              {
                path: ['org.iso.18013.5.1', 'given_name'],
                intent_to_retain: false,
              },
            ],
            multiple: false,
          },
        ],
        credential_sets: [
          {
            options: [['non_existent']],
            required: true,
          },
        ],
      };

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialSetModule,
        'selectDocumentsClaimsByCredentialSet'
      );
      selectSpy.mockImplementationOnce(() => {
        throw new Error('Credential with id non_existent not found');
      });

      expect(() => {
        selectDocumentsClaimsByQuery([document1], query);
      }).toThrow('Credential with id non_existent not found');

      expect(selectSpy).toHaveBeenCalledTimes(1);
    });
  });
});
