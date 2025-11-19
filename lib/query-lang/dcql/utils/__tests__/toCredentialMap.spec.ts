import { describe, it, expect } from 'vitest';
import { toCredentialMap } from '../toCredentialMap';
import { DcqlCredential } from '../../schemas/DcqlCredential';

describe('toCredentialMap', () => {
  describe('should return empty map for empty array', () => {
    it('returns empty map when credentials array is empty', () => {
      const credentials: DcqlCredential[] = [];

      const result = toCredentialMap(credentials);

      expect(result.size).toBe(0);
    });
  });

  describe('should include all credentials', () => {
    it('returns map with single credential when array contains one credential', () => {
      const credential: DcqlCredential = {
        id: 'credential-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credentials: DcqlCredential[] = [credential];

      const result = toCredentialMap(credentials);

      expect(result.size).toBe(1);
      expect(result.get('credential-1')).toBe(credential);
    });

    it('returns map with multiple credentials when array contains multiple credentials', () => {
      const credential1: DcqlCredential = {
        id: 'credential-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credential2: DcqlCredential = {
        id: 'credential-2',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
        multiple: false,
      };
      const credentials: DcqlCredential[] = [credential1, credential2];

      const result = toCredentialMap(credentials);

      expect(result.size).toBe(2);
      expect(result.get('credential-1')).toBe(credential1);
      expect(result.get('credential-2')).toBe(credential2);
    });

    it('includes credentials with claims property', () => {
      const credential: DcqlCredential = {
        id: 'credential-1',
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
      const credentials: DcqlCredential[] = [credential];

      const result = toCredentialMap(credentials);

      expect(result.size).toBe(1);
      expect(result.get('credential-1')).toBe(credential);
    });

    it('includes credentials with claim_sets property', () => {
      const credential: DcqlCredential = {
        id: 'credential-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        claims: [
          {
            id: 'claim1',
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
        claim_sets: [['claim1']],
        multiple: false,
      };
      const credentials: DcqlCredential[] = [credential];

      const result = toCredentialMap(credentials);

      expect(result.size).toBe(1);
      expect(result.get('credential-1')).toBe(credential);
    });

    it('includes credentials with multiple set to true', () => {
      const credential: DcqlCredential = {
        id: 'credential-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: true,
      };
      const credentials: DcqlCredential[] = [credential];

      const result = toCredentialMap(credentials);

      expect(result.size).toBe(1);
      expect(result.get('credential-1')).toBe(credential);
    });

    it('includes credentials with all optional properties', () => {
      const credential: DcqlCredential = {
        id: 'credential-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        claims: [
          {
            id: 'claim1',
            path: ['org.iso.18013.5.1', 'given_name'],
            intent_to_retain: false,
          },
        ],
        claim_sets: [['claim1']],
        multiple: true,
      };
      const credentials: DcqlCredential[] = [credential];

      const result = toCredentialMap(credentials);

      expect(result.size).toBe(1);
      expect(result.get('credential-1')).toBe(credential);
    });
  });

  describe('should handle duplicate ids', () => {
    it('overwrites previous credential when multiple credentials have the same id', () => {
      const credential1: DcqlCredential = {
        id: 'credential-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credential2: DcqlCredential = {
        id: 'credential-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
        multiple: true,
      };
      const credentials: DcqlCredential[] = [credential1, credential2];

      const result = toCredentialMap(credentials);

      expect(result.size).toBe(1);
      expect(result.get('credential-1')).toBe(credential2); // Last one wins
    });
  });

  describe('should handle edge cases', () => {
    it('handles credentials with empty string id', () => {
      const credential: DcqlCredential = {
        id: '',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credentials: DcqlCredential[] = [credential];

      const result = toCredentialMap(credentials);

      // Empty string id is still included (unlike toClaimMap)
      expect(result.size).toBe(1);
      expect(result.get('')).toBe(credential);
    });

    it('handles credentials with various claim properties', () => {
      const credential: DcqlCredential = {
        id: 'credential-1',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        claims: [
          {
            id: 'claim1',
            path: ['org.iso.18013.5.1', 'given_name'],
            values: ['John', 'Jane'],
            intent_to_retain: true,
          },
          {
            path: ['org.iso.18013.5.1', 'family_name'],
            intent_to_retain: false,
          },
        ],
        multiple: false,
      };
      const credentials: DcqlCredential[] = [credential];

      const result = toCredentialMap(credentials);

      expect(result.size).toBe(1);
      expect(result.get('credential-1')).toBe(credential);
    });

    it('handles large number of credentials', () => {
      const credentials: DcqlCredential[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `credential-${i}`,
          format: 'mso_mdoc',
          meta: { doctype_value: `org.iso.18013.5.${i}.mDL` },
          multiple: false,
        })
      );

      const result = toCredentialMap(credentials);

      expect(result.size).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(result.get(`credential-${i}`)).toBe(credentials[i]);
      }
    });

    it('handles credentials with special characters in id', () => {
      const credential1: DcqlCredential = {
        id: 'credential-with-dashes',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.1.mDL' },
        multiple: false,
      };
      const credential2: DcqlCredential = {
        id: 'credential_with_underscores',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.2.mDL' },
        multiple: false,
      };
      const credential3: DcqlCredential = {
        id: 'credential.with.dots',
        format: 'mso_mdoc',
        meta: { doctype_value: 'org.iso.18013.5.3.mDL' },
        multiple: false,
      };
      const credentials: DcqlCredential[] = [
        credential1,
        credential2,
        credential3,
      ];

      const result = toCredentialMap(credentials);

      expect(result.size).toBe(3);
      expect(result.get('credential-with-dashes')).toBe(credential1);
      expect(result.get('credential_with_underscores')).toBe(credential2);
      expect(result.get('credential.with.dots')).toBe(credential3);
    });
  });
});
