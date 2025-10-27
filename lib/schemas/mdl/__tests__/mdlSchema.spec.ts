import { describe, expect, it } from 'vitest';
import { Tag } from 'cbor-x';
import { Buffer } from 'node:buffer';
import { z } from 'zod';
import { mdlSchema, Mdl } from '../mdlSchema';

const createMinimalValidMdl = (): Mdl => ({
  family_name: 'DOE',
  given_name: 'JANE',
  birth_date: new Tag('1990-01-01', 1004),
  issue_date: new Tag('2024-01-01', 1004),
  expiry_date: new Tag('2030-01-01', 1004),
  issuing_country: 'US',
  issuing_authority: 'DMV',
  document_number: '1234567',
  portrait: new Uint8Array([1, 2, 3]),
  driving_privileges: [],
  un_distinguishing_sign: 'USA',
});

describe('mdlSchema', () => {
  describe('valid cases', () => {
    it('should accept a minimal valid object and preserve required fields', () => {
      const input = createMinimalValidMdl();
      const result = mdlSchema.parse(input);

      expect(result.birth_date).toEqual(new Tag('1990-01-01', 1004));
      expect(result.issue_date).toEqual(new Tag('2024-01-01', 1004));
      expect(result.expiry_date).toEqual(new Tag('2030-01-01', 1004));
      expect(result.portrait).toEqual(new Uint8Array([1, 2, 3]));
      expect(result.driving_privileges).toEqual([]);
      expect(result.family_name).toBe('DOE');
      expect(result.given_name).toBe('JANE');
      expect(result.issuing_country).toBe('US');
      expect(result.issuing_authority).toBe('DMV');
      expect(result.document_number).toBe('1234567');
      expect(result.un_distinguishing_sign).toBe('USA');
    });

    it('should transform Buffer portrait to Uint8Array', () => {
      const input = {
        ...createMinimalValidMdl(),
        portrait: Buffer.from([9, 8]),
      };
      const result = mdlSchema.parse(input);
      expect(result.portrait).toEqual(new Uint8Array([9, 8]));
    });

    it('should accept a fully populated object and validate optional fields', () => {
      const input: Mdl = {
        ...createMinimalValidMdl(),
        administrative_number: 'ADM-1',
        sex: 1,
        height: 170,
        weight: 65,
        eye_colour: 'blue',
        hair_colour: 'brown',
        birth_place: 'Somewhere',
        resident_address: '123 Main St',
        portrait_capture_date: new Tag('2024-03-20T10:00:00Z', 0),
        age_in_years: 34,
        age_birth_year: 1990,
        age_over_18: true,
        age_over_21: false,
        issuing_jurisdiction: 'US-CA',
        nationality: 'US',
        resident_city: 'Anytown',
        resident_state: 'CA',
        resident_postal_code: '90210',
        resident_country: 'US',
        biometrictemplate_finger: new Uint8Array([1]),
        biometrictemplate_iris: new Uint8Array([2]),
        biometrictemplate_face: new Uint8Array([3]),
        family_name_national_character: 'ＤＯＥ',
        given_name_national_character: 'ＪＡＮＥ',
        signature_usual_mark: new Uint8Array([4]),
      };

      const result = mdlSchema.parse(input);
      // Required fields from minimal
      expect(result.family_name).toBe('DOE');
      expect(result.given_name).toBe('JANE');
      expect(result.birth_date).toEqual(new Tag('1990-01-01', 1004));
      expect(result.issue_date).toEqual(new Tag('2024-01-01', 1004));
      expect(result.expiry_date).toEqual(new Tag('2030-01-01', 1004));
      expect(result.issuing_country).toBe('US');
      expect(result.issuing_authority).toBe('DMV');
      expect(result.document_number).toBe('1234567');
      expect(result.portrait).toEqual(new Uint8Array([1, 2, 3]));
      expect(result.driving_privileges).toEqual([]);
      expect(result.un_distinguishing_sign).toBe('USA');
      // Optional fields set above
      expect(result.administrative_number).toBe('ADM-1');
      expect(result.sex).toBe(1);
      expect(result.height).toBe(170);
      expect(result.weight).toBe(65);
      expect(result.eye_colour).toBe('blue');
      expect(result.hair_colour).toBe('brown');
      expect(result.birth_place).toBe('Somewhere');
      expect(result.resident_address).toBe('123 Main St');
      expect(result.portrait_capture_date).toEqual(
        new Tag('2024-03-20T10:00:00Z', 0)
      );
      expect(result.age_in_years).toBe(34);
      expect(result.age_birth_year).toBe(1990);
      expect(result.age_over_18).toBe(true);
      expect(result.age_over_21).toBe(false);
      expect(result.issuing_jurisdiction).toBe('US-CA');
      expect(result.nationality).toBe('US');
      expect(result.resident_city).toBe('Anytown');
      expect(result.resident_state).toBe('CA');
      expect(result.resident_postal_code).toBe('90210');
      expect(result.resident_country).toBe('US');
      expect(result.biometrictemplate_finger).toEqual(new Uint8Array([1]));
      expect(result.biometrictemplate_iris).toEqual(new Uint8Array([2]));
      expect(result.biometrictemplate_face).toEqual(new Uint8Array([3]));
      expect(result.family_name_national_character).toBe('ＤＯＥ');
      expect(result.given_name_national_character).toBe('ＪＡＮＥ');
      expect(result.signature_usual_mark).toEqual(new Uint8Array([4]));
    });
  });

  describe('missing required fields', () => {
    it('should report missing family_name as required', () => {
      const rest = { ...createMinimalValidMdl() } as Record<string, unknown>;
      delete rest.family_name;
      try {
        mdlSchema.parse(rest as unknown as Record<string, unknown>);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].path).toEqual(['family_name']);
        expect(zerr.issues[0].message).toBe('Required');
      }
    });

    it('should report missing driving_privileges as required', () => {
      const rest = { ...createMinimalValidMdl() } as Record<string, unknown>;
      delete rest.driving_privileges;
      try {
        mdlSchema.parse(rest as unknown as Record<string, unknown>);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].path).toEqual(['driving_privileges']);
        expect(zerr.issues[0].message).toBe('Required');
      }
    });
  });

  describe('type validations', () => {
    it('should reject non-binary portrait with exact message', () => {
      const input = {
        ...createMinimalValidMdl(),
        portrait: 'not-binary' as unknown as Uint8Array,
      };
      try {
        mdlSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].path).toEqual(['portrait']);
        expect(zerr.issues[0].message).toBe(
          'Expected Uint8Array or Buffer, received string'
        );
      }
    });

    it('should reject invalid issuing_jurisdiction format with exact message', () => {
      const input = {
        ...createMinimalValidMdl(),
        issuing_jurisdiction: 'US-CALI',
      };
      try {
        mdlSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].path).toEqual(['issuing_jurisdiction']);
        expect(zerr.issues[0].message).toBe('Must be in ISO 3166-2 format');
      }
    });
  });

  describe('date fields', () => {
    it('should reject invalid birth_date format with exact message', () => {
      const input = {
        ...createMinimalValidMdl(),
        birth_date: new Tag('not-a-date', 1004),
      };
      try {
        mdlSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].path).toEqual(['birth_date']);
        expect(zerr.issues[0].message).toBe(
          'Expected YYYY-MM-DD format, received not-a-date'
        );
      }
    });

    it('should reject invalid portrait_capture_date format with exact message', () => {
      const input = {
        ...createMinimalValidMdl(),
        portrait_capture_date: new Tag('invalid', 0),
      };
      try {
        mdlSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].path).toEqual(['portrait_capture_date']);
        expect(zerr.issues[0].message).toBe(
          'Expected YYYY-MM-DDTHH:MM:SSZ format, received invalid'
        );
      }
    });
  });

  describe('nested arrays and objects', () => {
    it('should reject empty codes array inside driving_privileges', () => {
      const input = {
        ...createMinimalValidMdl(),
        driving_privileges: [
          {
            vehicle_category_code: 'B',
            codes: [],
          },
        ],
      };
      try {
        mdlSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        const issue = zerr.issues[0];
        expect(issue.path).toEqual(['driving_privileges', 0, 'codes']);
        expect(issue.message).toBe('Array must contain at least 1 element(s)');
      }
    });

    it('should accept a driving_privilege entry that is valid', () => {
      const input = {
        ...createMinimalValidMdl(),
        driving_privileges: [
          {
            vehicle_category_code: 'B',
            issue_date: '2022-01-01',
            expiry_date: '2027-01-01',
            codes: [{ code: '78' }],
          },
        ],
      };
      const result = mdlSchema.parse(input);
      const dp = result.driving_privileges[0];
      expect(dp.vehicle_category_code).toBe('B');
      expect(dp.issue_date).toEqual(new Tag('2022-01-01', 1004));
      expect(dp.expiry_date).toEqual(new Tag('2027-01-01', 1004));
      expect(dp.codes).toEqual([{ code: '78' }]);
    });
  });

  describe('refinement rules', () => {
    it('should enforce issuing_jurisdiction country code matches issuing_country', () => {
      const input = {
        ...createMinimalValidMdl(),
        issuing_country: 'GB',
        issuing_jurisdiction: 'US-CA',
      };

      try {
        mdlSchema.parse(input);
        throw new Error('Expected parse to throw');
      } catch (error) {
        expect(error).toBeInstanceOf(z.ZodError);
        const zerr = error as z.ZodError;
        expect(zerr.issues[0].path).toEqual(['issuing_jurisdiction']);
        expect(zerr.issues[0].message).toBe(
          'Country code in issuing_jurisdiction must match issuing_country'
        );
      }
    });

    it('should allow matching issuing_jurisdiction and issuing_country', () => {
      const input = {
        ...createMinimalValidMdl(),
        issuing_country: 'US',
        issuing_jurisdiction: 'US-CA',
      };
      const result = mdlSchema.parse(input);
      expect(result.issuing_jurisdiction).toBe('US-CA');
    });
  });
});
