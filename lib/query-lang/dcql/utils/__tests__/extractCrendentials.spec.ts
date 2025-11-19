import { describe, it, expect } from 'vitest';
import { extractCredentials } from '../extractCredentials';
import { DcqlCredential } from '../../schemas/DcqlCredential';

describe('extractCredentials', () => {
  describe('should extract credentials successfully', () => {
    it('returns single credential when ids array contains one id', () => {
      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential],
      ]);

      const result = extractCredentials(credentialMap, ['cred-1']);

      expect(result).toEqual([credential]);
    });

    it('returns multiple credentials when ids array contains multiple ids', () => {
      const credential1: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credential2: DcqlCredential = {
        id: 'cred-2',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential1],
        ['cred-2', credential2],
      ]);

      const result = extractCredentials(credentialMap, ['cred-1', 'cred-2']);

      expect(result).toEqual([credential1, credential2]);
    });

    it('preserves order of ids in returned array', () => {
      const credential1: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credential2: DcqlCredential = {
        id: 'cred-2',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
        multiple: false,
      };
      const credential3: DcqlCredential = {
        id: 'cred-3',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential1],
        ['cred-2', credential2],
        ['cred-3', credential3],
      ]);

      const result = extractCredentials(credentialMap, [
        'cred-3',
        'cred-1',
        'cred-2',
      ]);

      expect(result).toEqual([credential3, credential1, credential2]);
    });

    it('extracts credentials with claims property', () => {
      const credential: DcqlCredential = {
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
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential],
      ]);

      const result = extractCredentials(credentialMap, ['cred-1']);

      expect(result).toEqual([credential]);
    });

    it('extracts credentials with claim_sets property', () => {
      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
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
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential],
      ]);

      const result = extractCredentials(credentialMap, ['cred-1']);

      expect(result).toEqual([credential]);
    });

    it('extracts credentials with multiple set to true', () => {
      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: true,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential],
      ]);

      const result = extractCredentials(credentialMap, ['cred-1']);

      expect(result).toEqual([credential]);
    });

    it('extracts subset of credentials from larger map', () => {
      const credential1: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credential2: DcqlCredential = {
        id: 'cred-2',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
        multiple: false,
      };
      const credential3: DcqlCredential = {
        id: 'cred-3',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential1],
        ['cred-2', credential2],
        ['cred-3', credential3],
      ]);

      const result = extractCredentials(credentialMap, ['cred-1', 'cred-3']);

      expect(result).toEqual([credential1, credential3]);
      expect(result.length).toBe(2);
    });
  });

  describe('should throw error when id is not found', () => {
    it('throws error when single id is not found', () => {
      const credentialMap = new Map<string, DcqlCredential>();

      expect(() => {
        extractCredentials(credentialMap, ['non_existent']);
      }).toThrow('Credential with id non_existent not found');
    });

    it('throws error when first id in array is not found', () => {
      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential],
      ]);

      expect(() => {
        extractCredentials(credentialMap, ['non_existent', 'cred-1']);
      }).toThrow('Credential with id non_existent not found');
    });

    it('throws error when middle id in array is not found', () => {
      const credential1: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credential2: DcqlCredential = {
        id: 'cred-2',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential1],
        ['cred-2', credential2],
      ]);

      expect(() => {
        extractCredentials(credentialMap, ['cred-1', 'non_existent', 'cred-2']);
      }).toThrow('Credential with id non_existent not found');
    });

    it('throws error when last id in array is not found', () => {
      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential],
      ]);

      expect(() => {
        extractCredentials(credentialMap, ['cred-1', 'non_existent']);
      }).toThrow('Credential with id non_existent not found');
    });

    it('throws error with correct id in error message', () => {
      const credentialMap = new Map<string, DcqlCredential>();

      expect(() => {
        extractCredentials(credentialMap, ['missing_id']);
      }).toThrow('Credential with id missing_id not found');
    });
  });

  describe('should handle edge cases', () => {
    it('returns empty array when ids array is empty', () => {
      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential],
      ]);

      const result = extractCredentials(credentialMap, []);

      expect(result).toEqual([]);
    });

    it('handles credentials with undefined claims', () => {
      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential],
      ]);

      const result = extractCredentials(credentialMap, ['cred-1']);

      expect(result).toEqual([credential]);
    });

    it('handles duplicate ids in ids array', () => {
      const credential: DcqlCredential = {
        id: 'cred-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1', credential],
      ]);

      const result = extractCredentials(credentialMap, ['cred-1', 'cred-1']);

      expect(result).toEqual([credential, credential]);
      expect(result.length).toBe(2);
    });

    it('handles large number of ids', () => {
      const credentials: DcqlCredential[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `cred-${i}`,
          format: 'mso_mdoc',
          meta: { doctype_value: `org.iso.18013.5.${i}.mDL` },
          multiple: false,
        })
      );
      const credentialMap = new Map<string, DcqlCredential>(
        credentials.map((credential) => [credential.id, credential])
      );
      const ids = Array.from({ length: 100 }, (_, i) => `cred-${i}`);

      const result = extractCredentials(credentialMap, ids);

      expect(result.length).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(result[i]).toBe(credentials[i]);
      }
    });

    it('handles credentials with empty string id', () => {
      const credential: DcqlCredential = {
        id: '',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([['', credential]]);

      const result = extractCredentials(credentialMap, ['']);

      expect(result).toEqual([credential]);
    });

    it('handles credentials with special characters in id', () => {
      const credential: DcqlCredential = {
        id: 'cred-1_with-special.chars',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credentialMap = new Map<string, DcqlCredential>([
        ['cred-1_with-special.chars', credential],
      ]);

      const result = extractCredentials(credentialMap, [
        'cred-1_with-special.chars',
      ]);

      expect(result).toEqual([credential]);
    });
  });
});
