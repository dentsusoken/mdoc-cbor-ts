import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { buildValidityInfo } from '../buildValidityInfo';
import { Document, MDoc, parse } from '@auth0/mdl';
import type { MSO } from '@auth0/mdl/lib/mdoc/model/types';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
} from '@/__tests__/config';

describe('buildValidityInfo', () => {
  describe('with Date objects', () => {
    it('should build validity info with all required fields', () => {
      const signed = new Date('2025-01-01T00:00:00Z');
      const validFrom = new Date('2025-01-01T00:00:00Z');
      const validUntil = new Date('2025-01-02T00:00:00Z'); // +1 day

      const result = buildValidityInfo({
        signed,
        validFrom,
        validUntil,
      });

      expect(result).toBeInstanceOf(Map);
      const signedTag = result.get('signed')!;
      const validFromTag = result.get('validFrom')!;
      const validUntilTag = result.get('validUntil')!;
      expect(signedTag).toBeInstanceOf(Tag);
      expect(signedTag.tag).toBe(0);
      expect(signedTag.value).toBe('2025-01-01T00:00:00Z');
      expect(validFromTag).toBeInstanceOf(Tag);
      expect(validFromTag.tag).toBe(0);
      expect(validFromTag.value).toBe('2025-01-01T00:00:00Z');
      expect(validUntilTag).toBeInstanceOf(Tag);
      expect(validUntilTag.tag).toBe(0);
      expect(validUntilTag.value).toBe('2025-01-02T00:00:00Z');
      expect(result.get('expectedUpdate')).toBeUndefined();
    });

    it('should build validity info with expectedUpdate when provided', () => {
      const signed = new Date('2025-01-01T00:00:00Z');
      const validFrom = new Date('2025-01-01T00:00:00Z');
      const validUntil = new Date('2025-01-02T00:00:00Z'); // +1 day
      const expectedUpdate = new Date('2025-01-01T01:00:00Z'); // +1 hour

      const result = buildValidityInfo({
        signed,
        validFrom,
        validUntil,
        expectedUpdate,
      });

      expect(result).toBeInstanceOf(Map);
      const sTag = result.get('signed')!;
      const vfTag = result.get('validFrom')!;
      const vuTag = result.get('validUntil')!;
      const euTag = result.get('expectedUpdate')!;
      expect(sTag).toBeInstanceOf(Tag);
      expect(sTag.tag).toBe(0);
      expect(sTag.value).toBe('2025-01-01T00:00:00Z');
      expect(vfTag).toBeInstanceOf(Tag);
      expect(vfTag.tag).toBe(0);
      expect(vfTag.value).toBe('2025-01-01T00:00:00Z');
      expect(vuTag).toBeInstanceOf(Tag);
      expect(vuTag.tag).toBe(0);
      expect(vuTag.value).toBe('2025-01-02T00:00:00Z');
      expect(euTag).toBeInstanceOf(Tag);
      expect(euTag.tag).toBe(0);
      expect(euTag.value).toBe('2025-01-01T01:00:00Z');
    });

    it('should handle future validFrom dates', () => {
      const signed = new Date('2025-01-01T00:00:00Z');
      const validFrom = new Date('2025-01-01T02:00:00Z'); // +2 hours
      const validUntil = new Date('2025-01-02T00:00:00Z'); // +1 day

      const result = buildValidityInfo({
        signed,
        validFrom,
        validUntil,
      });

      const s2 = result.get('signed')!;
      const vf2 = result.get('validFrom')!;
      const vu2 = result.get('validUntil')!;
      expect(s2).toBeInstanceOf(Tag);
      expect(s2.tag).toBe(0);
      expect(s2.value).toBe('2025-01-01T00:00:00Z');
      expect(vf2).toBeInstanceOf(Tag);
      expect(vf2.tag).toBe(0);
      expect(vf2.value).toBe('2025-01-01T02:00:00Z');
      expect(vu2).toBeInstanceOf(Tag);
      expect(vu2.tag).toBe(0);
      expect(vu2.value).toBe('2025-01-02T00:00:00Z');
    });

    it('should handle same date for all fields', () => {
      const date = new Date('2025-01-01T00:00:00Z');

      const result = buildValidityInfo({
        signed: date,
        validFrom: date,
        validUntil: date,
        expectedUpdate: date,
      });

      const s3 = result.get('signed')!;
      const vf3 = result.get('validFrom')!;
      const vu3 = result.get('validUntil')!;
      const eu3 = result.get('expectedUpdate')!;
      expect(s3).toBeInstanceOf(Tag);
      expect(s3.tag).toBe(0);
      expect(s3.value).toBe('2025-01-01T00:00:00Z');
      expect(vf3).toBeInstanceOf(Tag);
      expect(vf3.tag).toBe(0);
      expect(vf3.value).toBe('2025-01-01T00:00:00Z');
      expect(vu3).toBeInstanceOf(Tag);
      expect(vu3.tag).toBe(0);
      expect(vu3.value).toBe('2025-01-01T00:00:00Z');
      expect(eu3).toBeInstanceOf(Tag);
      expect(eu3.tag).toBe(0);
      expect(eu3.value).toBe('2025-01-01T00:00:00Z');
    });

    it('should handle different dates for each field', () => {
      const signed = new Date('2030-06-15T12:34:56Z');
      const validFrom = new Date('2030-06-15T14:34:56Z'); // +2 hours
      const validUntil = new Date('2030-06-16T12:34:56Z'); // +1 day
      const expectedUpdate = new Date('2030-06-15T14:04:56Z'); // +1 hour 30 minutes

      const result = buildValidityInfo({
        signed,
        validFrom,
        validUntil,
        expectedUpdate,
      });

      const s4 = result.get('signed')!;
      const vf4 = result.get('validFrom')!;
      const vu4 = result.get('validUntil')!;
      const eu4 = result.get('expectedUpdate')!;
      expect(s4).toBeInstanceOf(Tag);
      expect(s4.tag).toBe(0);
      expect(s4.value).toBe('2030-06-15T12:34:56Z');
      expect(vf4).toBeInstanceOf(Tag);
      expect(vf4.tag).toBe(0);
      expect(vf4.value).toBe('2030-06-15T14:34:56Z');
      expect(vu4).toBeInstanceOf(Tag);
      expect(vu4.tag).toBe(0);
      expect(vu4.value).toBe('2030-06-16T12:34:56Z');
      expect(eu4).toBeInstanceOf(Tag);
      expect(eu4.tag).toBe(0);
      expect(eu4.value).toBe('2030-06-15T14:04:56Z');
    });
  });

  describe('auth0/mdl compatibility', () => {
    it('should produce ValidityInfo structure compatible with auth0/mdl', async () => {
      const { ...publicKeyJWK } = DEVICE_JWK;
      const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

      const signed = new Date('2023-10-24T14:55:18Z');
      const validFrom = new Date('2023-10-24T15:00:18Z'); // +5 minutes
      const validUntil = new Date('2053-10-24T14:55:18Z'); // +30 years
      const expectedUpdate = new Date('2024-10-24T14:55:18Z'); // +1 year

      const document = await new Document('org.iso.18013.5.1.mDL')
        .addIssuerNameSpace('org.iso.18013.5.1', {
          family_name: 'Jones',
          given_name: 'Ava',
        })
        .useDigestAlgorithm('SHA-256')
        .addValidityInfo({
          signed,
          validFrom,
          validUntil,
          expectedUpdate,
        })
        .addDeviceKeyInfo({ deviceKey: publicKeyJWK })
        .sign({
          issuerPrivateKey,
          issuerCertificate: ISSUER_CERTIFICATE,
          alg: 'ES256',
        });

      const mdoc = new MDoc([document]);
      const encoded = mdoc.encode();

      const parsedMDOC = parse(encoded);
      const [parsedDocument] = parsedMDOC.documents;

      // Get auth0/mdl's ValidityInfo
      const mso = parsedDocument.issuerSigned.issuerAuth.decodedPayload as MSO;
      const auth0ValidityInfo = mso.validityInfo;

      expect(auth0ValidityInfo).toBeDefined();

      // Build our ValidityInfo using the same dates
      const ourValidityInfo = buildValidityInfo({
        signed,
        validFrom,
        validUntil,
        expectedUpdate,
      });

      // Verify our structure uses Tag(0)
      const os = ourValidityInfo.get('signed')!;
      const ovf = ourValidityInfo.get('validFrom')!;
      const ovu = ourValidityInfo.get('validUntil')!;
      const oe = ourValidityInfo.get('expectedUpdate')!;
      expect(os).toBeInstanceOf(Tag);
      expect(os.tag).toBe(0);
      expect(ovf).toBeInstanceOf(Tag);
      expect(ovf.tag).toBe(0);
      expect(ovu).toBeInstanceOf(Tag);
      expect(ovu.tag).toBe(0);
      expect(oe).toBeInstanceOf(Tag);
      expect(oe.tag).toBe(0);

      // auth0/mdl decodes ValidityInfo as Date objects
      expect(auth0ValidityInfo.signed).toBeInstanceOf(Date);
      expect(auth0ValidityInfo.validFrom).toBeInstanceOf(Date);
      expect(auth0ValidityInfo.validUntil).toBeInstanceOf(Date);
      expect(auth0ValidityInfo.expectedUpdate).toBeInstanceOf(Date);

      // Verify our Tag(0) values produce parseable dates
      expect(new Date(os.value).getTime()).toBe(signed.getTime());
      expect(new Date(ovf.value).getTime()).toBe(validFrom.getTime());
      expect(new Date(ovu.value).getTime()).toBe(validUntil.getTime());
      expect(new Date(oe.value).getTime()).toBe(expectedUpdate.getTime());

      // Verify auth0/mdl's Date objects match expected values
      expect(auth0ValidityInfo.signed.getTime()).toBe(signed.getTime());
      expect(auth0ValidityInfo.validFrom.getTime()).toBe(validFrom.getTime());
      expect(auth0ValidityInfo.validUntil.getTime()).toBe(validUntil.getTime());
      expect(auth0ValidityInfo.expectedUpdate?.getTime()).toBe(
        expectedUpdate.getTime()
      );

      // Verify both produce the same timestamp
      expect(new Date(os.value).getTime()).toBe(
        auth0ValidityInfo.signed.getTime()
      );
      expect(new Date(ovf.value).getTime()).toBe(
        auth0ValidityInfo.validFrom.getTime()
      );
      expect(new Date(ovu.value).getTime()).toBe(
        auth0ValidityInfo.validUntil.getTime()
      );
      expect(new Date(oe.value).getTime()).toBe(
        auth0ValidityInfo.expectedUpdate?.getTime()
      );
    });

    it('should match auth0/mdl ValidityInfo without expectedUpdate', async () => {
      const { ...publicKeyJWK } = DEVICE_JWK;
      const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

      const signed = new Date('2025-01-01T00:00:00Z');
      const validFrom = new Date('2025-01-01T01:00:00Z'); // +1 hour
      const validUntil = new Date('2026-01-01T00:00:00Z'); // +1 year

      const document = await new Document('org.iso.18013.5.1.mDL')
        .addIssuerNameSpace('org.iso.18013.5.1', {
          family_name: 'Smith',
        })
        .useDigestAlgorithm('SHA-256')
        .addValidityInfo({
          signed,
          validFrom,
          validUntil,
          // No expectedUpdate
        })
        .addDeviceKeyInfo({ deviceKey: publicKeyJWK })
        .sign({
          issuerPrivateKey,
          issuerCertificate: ISSUER_CERTIFICATE,
          alg: 'ES256',
        });

      const mdoc = new MDoc([document]);
      const encoded = mdoc.encode();

      const parsedMDOC = parse(encoded);
      const [parsedDocument] = parsedMDOC.documents;

      // Get auth0/mdl's ValidityInfo
      const mso = parsedDocument.issuerSigned.issuerAuth.decodedPayload as MSO;
      const auth0ValidityInfo = mso.validityInfo;

      // Build our ValidityInfo using the same dates
      const ourValidityInfo = buildValidityInfo({
        signed,
        validFrom,
        validUntil,
        // No expectedUpdate
      });

      // Verify our structure uses Tag(0)
      const os2 = ourValidityInfo.get('signed')!;
      const ovf2 = ourValidityInfo.get('validFrom')!;
      const ovu2 = ourValidityInfo.get('validUntil')!;
      expect(os2).toBeInstanceOf(Tag);
      expect(os2.tag).toBe(0);
      expect(ovf2).toBeInstanceOf(Tag);
      expect(ovf2.tag).toBe(0);
      expect(ovu2).toBeInstanceOf(Tag);
      expect(ovu2.tag).toBe(0);

      // auth0/mdl decodes ValidityInfo as Date objects
      expect(auth0ValidityInfo.signed).toBeInstanceOf(Date);
      expect(auth0ValidityInfo.validFrom).toBeInstanceOf(Date);
      expect(auth0ValidityInfo.validUntil).toBeInstanceOf(Date);

      // Verify our Tag(0) values produce correct timestamps
      expect(new Date(os2.value).getTime()).toBe(signed.getTime());
      expect(new Date(ovf2.value).getTime()).toBe(validFrom.getTime());
      expect(new Date(ovu2.value).getTime()).toBe(validUntil.getTime());

      // Verify auth0/mdl's Date objects match expected values
      expect(auth0ValidityInfo.signed.getTime()).toBe(signed.getTime());
      expect(auth0ValidityInfo.validFrom.getTime()).toBe(validFrom.getTime());
      expect(auth0ValidityInfo.validUntil.getTime()).toBe(validUntil.getTime());

      // Verify both produce the same timestamp
      expect(new Date(os2.value).getTime()).toBe(
        auth0ValidityInfo.signed.getTime()
      );
      expect(new Date(ovf2.value).getTime()).toBe(
        auth0ValidityInfo.validFrom.getTime()
      );
      expect(new Date(ovu2.value).getTime()).toBe(
        auth0ValidityInfo.validUntil.getTime()
      );

      // Verify expectedUpdate is undefined in both
      expect(ourValidityInfo.get('expectedUpdate')).toBeUndefined();
      expect(auth0ValidityInfo.expectedUpdate).toBeUndefined();
    });

    it('should handle various date formats and durations', async () => {
      const { ...publicKeyJWK } = DEVICE_JWK;
      const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

      // Test with different duration patterns
      const testCases = [
        {
          name: 'immediate validity',
          signed: new Date('2024-06-15T12:00:00Z'),
          validFromOffset: 0, // immediate
          validUntilOffset: 24 * 60 * 60 * 1000, // +1 day
        },
        {
          name: 'delayed validity',
          signed: new Date('2024-12-25T00:00:00Z'),
          validFromOffset: 7 * 24 * 60 * 60 * 1000, // +7 days
          validUntilOffset: 365 * 24 * 60 * 60 * 1000, // +1 year
        },
      ];

      for (const testCase of testCases) {
        const { signed, validFromOffset, validUntilOffset } = testCase;
        const validFrom = new Date(signed.getTime() + validFromOffset);
        const validUntil = new Date(signed.getTime() + validUntilOffset);

        const document = await new Document('org.iso.18013.5.1.mDL')
          .addIssuerNameSpace('org.iso.18013.5.1', {
            test_field: testCase.name,
          })
          .useDigestAlgorithm('SHA-256')
          .addValidityInfo({
            signed,
            validFrom,
            validUntil,
          })
          .addDeviceKeyInfo({ deviceKey: publicKeyJWK })
          .sign({
            issuerPrivateKey,
            issuerCertificate: ISSUER_CERTIFICATE,
            alg: 'ES256',
          });

        const mdoc = new MDoc([document]);
        const encoded = mdoc.encode();

        const parsedMDOC = parse(encoded);
        const [parsedDocument] = parsedMDOC.documents;

        // Get auth0/mdl's ValidityInfo
        const mso = parsedDocument.issuerSigned.issuerAuth
          .decodedPayload as MSO;
        const auth0ValidityInfo = mso.validityInfo;

        // Build our ValidityInfo
        const ourValidityInfo = buildValidityInfo({
          signed,
          validFrom,
          validUntil,
        });

        // Verify our structure uses Tag(0)
        const os3 = ourValidityInfo.get('signed')!;
        const ovf3 = ourValidityInfo.get('validFrom')!;
        const ovu3 = ourValidityInfo.get('validUntil')!;
        expect(os3).toBeInstanceOf(Tag);
        expect(os3.tag).toBe(0);
        expect(ovf3).toBeInstanceOf(Tag);
        expect(ovf3.tag).toBe(0);
        expect(ovu3).toBeInstanceOf(Tag);
        expect(ovu3.tag).toBe(0);

        // auth0/mdl decodes ValidityInfo as Date objects
        expect(auth0ValidityInfo.signed).toBeInstanceOf(Date);
        expect(auth0ValidityInfo.validFrom).toBeInstanceOf(Date);
        expect(auth0ValidityInfo.validUntil).toBeInstanceOf(Date);

        // Verify timestamps match between our implementation and auth0/mdl
        expect(new Date(os3.value).getTime()).toBe(
          auth0ValidityInfo.signed.getTime()
        );
        expect(new Date(ovf3.value).getTime()).toBe(
          auth0ValidityInfo.validFrom.getTime()
        );
        expect(new Date(ovu3.value).getTime()).toBe(
          auth0ValidityInfo.validUntil.getTime()
        );
      }
    });
  });
});
