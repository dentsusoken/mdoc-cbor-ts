import { describe, it, expect, vi } from 'vitest';
import { Tag } from 'cbor-x';
import { createIssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import { createTag24 } from '@/cbor/createTag24';
import { createTag18, type Tag18Content } from '@/cbor/createTag18';
import { selectDocumentsClaimsByCredentialSet } from '../selectDocumentsClaimsByCredentialSet';
import { createDocument } from '@/schemas/mdoc/Document';
import { createIssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { DcqlCredential } from '../../schemas/DcqlCredential';
import { DcqlCredentialSet } from '../../schemas/DcqlCredentialSet';
import { toCredentialMap } from '../../utils/toCredentialMap';
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

describe('selectDocumentsClaimsByCredentialSet', () => {
  describe('should return Map with matching documents (first-match strategy)', () => {
    it('returns Map when first option matches', () => {
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
      ];

      const credentialSet: DcqlCredentialSet = {
        options: [
          ['cred-1', 'cred-2'], // First option
          ['cred-3'], // Second option
        ],
        required: true,
      };

      const credentialMap = toCredentialMap(credentials);

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialsModule,
        'selectDocumentsClaimsByCredentials'
      );
      selectSpy.mockImplementationOnce(() => {
        // First option matches
        return new Map([
          ['cred-1', [document1]],
          ['cred-2', [document2]],
        ]);
      });

      const result = selectDocumentsClaimsByCredentialSet(
        [document1, document2],
        credentialSet,
        credentialMap
      );

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(2);
      expect(result!.get('cred-1')).toEqual([document1]);
      expect(result!.get('cred-2')).toEqual([document2]);
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });

    it('returns Map when second option matches (first-match strategy)', () => {
      const tag1 = makeItemTag(1, 'given_name', 'John');
      const tag3 = makeItemTag(3, 'age', 30);
      const issuerAuth1 = makeIssuerAuth();
      const issuerAuth3 = makeIssuerAuth();
      const issuerSigned1 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag1]]])],
        ['issuerAuth', issuerAuth1],
      ]);
      const issuerSigned3 = createIssuerSigned([
        ['nameSpaces', new Map([['org.iso.18013.5.1', [tag3]]])],
        ['issuerAuth', issuerAuth3],
      ]);
      const document1 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned1],
      ]);
      const document3 = createDocument([
        ['docType', 'org.iso.18013.5.1.mDL'],
        ['issuerSigned', issuerSigned3],
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
      ];

      const credentialSet: DcqlCredentialSet = {
        options: [
          ['cred-1', 'cred-2'], // First option: no match
          ['cred-3'], // Second option: matches
        ],
        required: true,
      };

      const credentialMap = toCredentialMap(credentials);

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialsModule,
        'selectDocumentsClaimsByCredentials'
      );
      selectSpy
        .mockImplementationOnce(() => {
          // First option: no match
          return undefined;
        })
        .mockImplementationOnce(() => {
          // Second option: matches
          return new Map([['cred-3', [document3]]]);
        });

      const result = selectDocumentsClaimsByCredentialSet(
        [document1, document3],
        credentialSet,
        credentialMap
      );

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(1);
      expect(result!.get('cred-3')).toEqual([document3]);
      expect(selectSpy).toHaveBeenCalledTimes(2);
    });

    it('stops at first matching option and does not check remaining options', () => {
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
          meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
          claims: [
            {
              path: ['org.iso.18013.5.1', 'age'],
              intent_to_retain: false,
            },
          ],
          multiple: false,
        },
      ];

      const credentialSet: DcqlCredentialSet = {
        options: [
          ['cred-1'], // First option: matches
          ['cred-2'], // Second option: should not be checked
        ],
        required: true,
      };

      const credentialMap = toCredentialMap(credentials);

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialsModule,
        'selectDocumentsClaimsByCredentials'
      );
      selectSpy.mockImplementationOnce(() => {
        // First option matches
        return new Map([['cred-1', [document1]]]);
      });

      const result = selectDocumentsClaimsByCredentialSet(
        [document1],
        credentialSet,
        credentialMap
      );

      expect(result).not.toBeUndefined();
      expect(result!.size).toBe(1);
      expect(result!.get('cred-1')).toEqual([document1]);
      expect(selectSpy).toHaveBeenCalledTimes(1); // Only first option is checked
    });
  });

  describe('should return undefined when optional credential set does not match', () => {
    it('returns undefined when no option matches and required is false', () => {
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

      const credentialSet: DcqlCredentialSet = {
        options: [['cred-1']],
        required: false, // Not required
      };

      const credentialMap = toCredentialMap(credentials);

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialsModule,
        'selectDocumentsClaimsByCredentials'
      );
      selectSpy.mockImplementationOnce(() => {
        // No match
        return undefined;
      });

      const result = selectDocumentsClaimsByCredentialSet(
        [document1],
        credentialSet,
        credentialMap
      );

      expect(result).toBeUndefined();
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('should throw error when required credential set does not match', () => {
    it('throws error when no option matches and required is true', () => {
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
        {
          id: 'cred-2',
          format: 'mso_mdoc',
          meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
          claims: [
            {
              path: ['org.iso.18013.5.2', 'age'],
              intent_to_retain: false,
            },
          ],
          multiple: false,
        },
      ];

      const credentialSet: DcqlCredentialSet = {
        options: [['cred-1'], ['cred-2']],
        required: true,
      };

      const credentialMap = toCredentialMap(credentials);

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialsModule,
        'selectDocumentsClaimsByCredentials'
      );
      selectSpy
        .mockImplementationOnce(() => {
          // First option: no match
          return undefined;
        })
        .mockImplementationOnce(() => {
          // Second option: no match
          return undefined;
        });

      expect(() => {
        selectDocumentsClaimsByCredentialSet(
          [document1],
          credentialSet,
          credentialMap
        );
      }).toThrow(
        'The required credential set did not match any documents. Options:'
      );

      expect(selectSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('should propagate errors from extractCredentials', () => {
    it('throws error when credential ID is not found in credentialMap', () => {
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
      ];

      const credentialSet: DcqlCredentialSet = {
        options: [['non_existent']], // Credential ID not in map
        required: true,
      };

      const credentialMap = toCredentialMap(credentials);

      expect(() => {
        selectDocumentsClaimsByCredentialSet(
          [document1],
          credentialSet,
          credentialMap
        );
      }).toThrow('Credential with id non_existent not found');
    });
  });

  describe('should handle undefined return from selectDocumentsClaimsByCredentials', () => {
    it('returns undefined when credential does not match and required is false', () => {
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

      const credentialSet: DcqlCredentialSet = {
        options: [['cred-1']],
        required: false,
      };

      const credentialMap = toCredentialMap(credentials);

      const selectSpy = vi.spyOn(
        selectDocumentsClaimsByCredentialsModule,
        'selectDocumentsClaimsByCredentials'
      );
      selectSpy.mockImplementationOnce(() => {
        // No match
        return undefined;
      });

      const result = selectDocumentsClaimsByCredentialSet(
        [document1],
        credentialSet,
        credentialMap
      );

      expect(result).toBeUndefined();
      expect(selectSpy).toHaveBeenCalledTimes(1);
    });
  });
});
