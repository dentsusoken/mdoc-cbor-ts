import { describe, expect, it } from 'vitest';
import { DateOnly } from '../../cbor';
import { mdlSchema } from './mdlSchema';

describe('mdlSchema', () => {
  const validData = {
    family_name: 'Doe',
    given_name: 'John',
    birth_date: new DateOnly(),
    issue_date: new DateOnly(),
    expiry_date: new DateOnly(),
    issuing_country: 'JPN',
    issuing_authority: 'Police',
    document_number: '123456789',
    portrait: Buffer.from('test-portrait'),
    driving_privileges: [
      new Map<string, unknown>([
        ['vehicle_category_code', 'B'],
        ['issue_date', new DateOnly()],
        ['expiry_date', new DateOnly()],
        ['codes', [{ code: 'A' }]],
      ]),
    ],
    un_distinguishing_sign: 'J',
    administrative_number: 'ADMIN123',
    sex: 1,
    height: 170,
    weight: 70,
    eye_colour: 'BRO',
    hair_colour: 'BLK',
    birth_place: 'Tokyo',
    resident_address: '1-1-1',
    portrait_capture_date: new DateOnly(),
    age_in_years: 30,
    age_birth_year: 1993,
    issuing_jurisdiction: 'Tokyo',
    nationality: 'JPN',
    resident_city: 'Tokyo',
    resident_state: 'Tokyo',
    resident_postal_code: '100-0001',
    resident_country: 'JPN',
    biometrictemplate_xx: Buffer.from('test-template'),
    family_name_national_character: 'ドウ',
    given_name_national_character: 'ジョン',
    signature_usual_mark: Buffer.from('test-signature'),
    // age_over flags (now optional)
    age_over_18: true,
    age_over_20: true,
    age_over_21: true,
  };

  it('should validate valid MDL data', () => {
    const result = mdlSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      const expected = {
        ...validData,
        driving_privileges: validData.driving_privileges.map((priv) =>
          Object.fromEntries(priv)
        ),
      };
      const actual = {
        ...result.data,
        driving_privileges: validData.driving_privileges.map((priv) =>
          Object.fromEntries(priv)
        ),
      };
      expect(actual).toEqual(expected);
    }
  });

  it('should reject invalid document_number', () => {
    const invalidData = {
      ...validData,
      document_number: 123, // number instead of string
    };

    const result = mdlSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid given_name', () => {
    const invalidData = {
      ...validData,
      given_name: 123, // number instead of string
    };

    const result = mdlSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const { given_name, ...invalidData } = validData;
    const result = mdlSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject additional fields', () => {
    const invalidData = {
      ...validData,
      additional_field: 'value',
    };

    const result = mdlSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate age_over flags as optional', () => {
    // Should pass with no age_over flags
    const { age_over_18, age_over_20, age_over_21, ...noAgeFlags } = validData;
    const result = mdlSchema.safeParse(noAgeFlags);
    expect(result.success).toBe(true);

    // Should pass with some age_over flags
    const someAgeFlags = {
      ...validData,
      age_over_18: true,
    };
    const result2 = mdlSchema.safeParse(someAgeFlags);
    expect(result2.success).toBe(true);

    // Should fail with invalid age_over flag type
    const invalidAgeFlags = {
      ...validData,
      age_over_18: 'true', // string instead of boolean
    };
    const invalidResult = mdlSchema.safeParse(invalidAgeFlags);
    expect(invalidResult.success).toBe(false);
  });

  it('should validate driving privileges structure', () => {
    const validPrivileges = {
      ...validData,
      driving_privileges: [
        new Map<string, unknown>([
          ['vehicle_category_code', 'B'],
          ['issue_date', new DateOnly()],
          ['expiry_date', new DateOnly()],
          ['codes', [{ code: 'A', sign: '>', value: '18' }]],
        ]),
      ],
    };

    const result = mdlSchema.safeParse(validPrivileges);
    expect(result.success).toBe(true);

    const invalidPrivileges = {
      ...validData,
      driving_privileges: [
        {
          vehicle_category_code: 123, // number instead of string
          issue_date: new DateOnly(),
          expiry_date: new DateOnly(),
          codes: [{ code: 'A' }],
        },
      ],
    };

    const invalidResult = mdlSchema.safeParse(invalidPrivileges);
    expect(invalidResult.success).toBe(false);
  });
});
