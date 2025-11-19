import { describe, it, expect, vi } from 'vitest';
import { Tag } from 'cbor-x';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { selectDocumentsClaimsByCredentials } from '../selectDocumentsClaimsByCredentials';
import { createDocument } from '@/schemas/mdoc/Document';
import { createIssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { DcqlCredential } from '../../schemas/DcqlCredential';
import * as selectDocumentsClaimsByCredentialModule from '../selectDocumentsClaimsByCredential';

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

describe('selectDocumentsClaimsByCredentials', () => {
  describe('should return Map with matching documents', () => {
    it('returns Map with documents for multiple credentials', () => {
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

      const credentials: DcqlCredential[] = [
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
      ];

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialModule,
        'selectDocumentsClaimsByCredential'
      );
      selectSpy
        .mockImplementationOnce(() => {
          // First credential matches
          return [document1];
        })
        .mockImplementationOnce(() => {
          // Second credential matches
          return [document2];
        });

      const result = selectDocumentsClaimsByCredentials(
        [document1, document2],
        credentials
      );

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(2);
      expect(result!.get('cred-1')).toEqual([document1]);
      expect(result!.get('cred-2')).toEqual([document2]);
      expect(selectSpy).toHaveBeenCalledTimes(2);
    });

    it('returns undefined when second credential does not match', () => {
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

      const credentials: DcqlCredential[] = [
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
      ];

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialModule,
        'selectDocumentsClaimsByCredential'
      );
      selectSpy
        .mockImplementationOnce(() => {
          // First credential matches
          return [document1];
        })
        .mockImplementationOnce(() => {
          // Second credential does not match
          return undefined;
        });

      const result = selectDocumentsClaimsByCredentials(
        [document1],
        credentials
      );

      expect(result).toBeUndefined();
      expect(selectSpy).toHaveBeenCalledTimes(2);
    });

    it('returns Map with multiple documents when credential.multiple is true', () => {
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

      const credentials: DcqlCredential[] = [
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
          multiple: true,
        },
      ];

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialModule,
        'selectDocumentsClaimsByCredential'
      );
      selectSpy.mockImplementationOnce(() => {
        // Returns multiple documents
        return [document1, document2];
      });

      const result = selectDocumentsClaimsByCredentials(
        [document1, document2],
        credentials
      );

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(1);
      expect(result!.get('cred-1')).toEqual([document1, document2]);
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('should return undefined when credential does not match', () => {
    it('returns undefined when first credential does not match', () => {
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

      const credentials: DcqlCredential[] = [
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
      ];

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialModule,
        'selectDocumentsClaimsByCredential'
      );
      selectSpy.mockImplementationOnce(() => {
        // No match
        return undefined;
      });

      const result = selectDocumentsClaimsByCredentials(
        [document1],
        credentials
      );

      expect(result).toBeUndefined();
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });

    it('returns undefined when second credential does not match', () => {
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

      const credentials: DcqlCredential[] = [
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
      ];

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialModule,
        'selectDocumentsClaimsByCredential'
      );
      selectSpy
        .mockImplementationOnce(() => {
          // First credential matches
          return [document1];
        })
        .mockImplementationOnce(() => {
          // Second credential does not match
          return undefined;
        });

      const result = selectDocumentsClaimsByCredentials(
        [document1],
        credentials
      );

      expect(result).toBeUndefined();
      expect(selectSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('should handle edge cases', () => {
    it('returns empty Map when credentials array is empty', () => {
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

      const credentials: DcqlCredential[] = [];

      const result = selectDocumentsClaimsByCredentials(
        [document1],
        credentials
      );

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(0);
    });

    it('handles credentials with undefined claims', () => {
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

      const credentials: DcqlCredential[] = [
        {
          id: 'cred-1',
          format: 'mso_mdoc',
          meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
          multiple: false,
        },
      ];

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialModule,
        'selectDocumentsClaimsByCredential'
      );
      selectSpy.mockImplementationOnce(() => {
        return [document1];
      });

      const result = selectDocumentsClaimsByCredentials(
        [document1],
        credentials
      );

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(1);
      expect(result!.get('cred-1')).toEqual([document1]);
    });
  });

  describe('should propagate errors from selectDocumentsClaimsByCredential', () => {
    it('propagates ErrorCodeError when docType is missing', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const issuerAuth1 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const document1 = createDocument([['issuerSigned', issuerSigned1]]);

      const credentials: DcqlCredential[] = [
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
      ];

      // The error will be thrown by selectDocumentsClaimsByCredential
      // when it processes the document without docType
      expect(() => {
        selectDocumentsClaimsByCredentials([document1], credentials);
      }).toThrow();
    });
  });
});
