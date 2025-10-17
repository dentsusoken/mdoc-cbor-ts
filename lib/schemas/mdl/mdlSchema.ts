import { z } from 'zod';
import { createBytesSchema } from '@/schemas/cbor/Bytes';
import { fullDateSchema } from '@/index';
import { createRequiredSchema } from '@/schemas/common/Required';

/**
 * Schema for driving privilege codes
 * @description
 * Represents a code that indicates a specific driving privilege or restriction.
 * This schema validates the structure of driving privilege codes including the code itself
 * and optional sign and value.
 *
 * @example
 * ```typescript
 * const code = {
 *   code: "A",
 *   sign: ">",
 *   value: "18"
 * };
 * const result = codeSchema.parse(code);
 * ```
 */
export const codeSchema = z.object({
  code: z.string(),
  sign: z.string().optional(),
  value: z.string().optional(),
});

/**
 * Schema for driving privileges
 * @description
 * Represents a set of driving privileges for a specific vehicle category.
 * This schema validates the structure of driving privileges including vehicle category,
 * issue and expiry dates, and associated codes.
 *
 * @example
 * ```typescript
 * const privileges = {
 *   vehicle_category_code: "B",
 *   issue_date: new DateOnly(),
 *   expiry_date: new DateOnly(),
 *   codes: [{ code: "A" }]
 * };
 * const result = drivingPrivilegesSchema.parse(privileges);
 * ```
 */
export const drivingPrivilegesSchema = z
  .map(z.string(), z.unknown())
  .transform((v) => {
    return z
      .object({
        vehicle_category_code: z.string(),
        issue_date: createRequiredSchema('issue_date')
          .pipe(fullDateSchema)
          .optional(),
        expiry_date: createRequiredSchema('expiry_date')
          .pipe(fullDateSchema)
          .optional(),
        codes: z.array(codeSchema).optional(),
      })
      .parse(Object.fromEntries(v));
  });

/**
 * Schema for age verification flags
 * @description
 * Represents a set of boolean flags indicating whether the holder is over specific ages.
 * This schema validates that each age flag is a boolean value.
 *
 * @example
 * ```typescript
 * const ageFlags = {
 *   age_over_18: true,
 *   age_over_21: true
 * };
 * const result = overAgeSchema.parse(ageFlags);
 * ```
 */
export const overAgeSchema = z
  .object({
    age_over_00: z.boolean(),
    age_over_01: z.boolean(),
    age_over_02: z.boolean(),
    age_over_03: z.boolean(),
    age_over_04: z.boolean(),
    age_over_05: z.boolean(),
    age_over_06: z.boolean(),
    age_over_07: z.boolean(),
    age_over_08: z.boolean(),
    age_over_09: z.boolean(),
    age_over_10: z.boolean(),
    age_over_11: z.boolean(),
    age_over_12: z.boolean(),
    age_over_13: z.boolean(),
    age_over_14: z.boolean(),
    age_over_15: z.boolean(),
    age_over_16: z.boolean(),
    age_over_17: z.boolean(),
    age_over_18: z.boolean(),
    age_over_19: z.boolean(),
    age_over_20: z.boolean(),
    age_over_21: z.boolean(),
    age_over_22: z.boolean(),
    age_over_23: z.boolean(),
    age_over_24: z.boolean(),
    age_over_25: z.boolean(),
    age_over_26: z.boolean(),
    age_over_27: z.boolean(),
    age_over_28: z.boolean(),
    age_over_29: z.boolean(),
    age_over_30: z.boolean(),
    age_over_31: z.boolean(),
    age_over_32: z.boolean(),
    age_over_33: z.boolean(),
    age_over_34: z.boolean(),
    age_over_35: z.boolean(),
    age_over_36: z.boolean(),
    age_over_37: z.boolean(),
    age_over_38: z.boolean(),
    age_over_39: z.boolean(),
    age_over_40: z.boolean(),
    age_over_41: z.boolean(),
    age_over_42: z.boolean(),
    age_over_43: z.boolean(),
    age_over_44: z.boolean(),
    age_over_45: z.boolean(),
    age_over_46: z.boolean(),
    age_over_47: z.boolean(),
    age_over_48: z.boolean(),
    age_over_49: z.boolean(),
    age_over_50: z.boolean(),
    age_over_51: z.boolean(),
    age_over_52: z.boolean(),
    age_over_53: z.boolean(),
    age_over_54: z.boolean(),
    age_over_55: z.boolean(),
    age_over_56: z.boolean(),
    age_over_57: z.boolean(),
    age_over_58: z.boolean(),
    age_over_59: z.boolean(),
    age_over_60: z.boolean(),
    age_over_61: z.boolean(),
    age_over_62: z.boolean(),
    age_over_63: z.boolean(),
    age_over_64: z.boolean(),
    age_over_65: z.boolean(),
    age_over_66: z.boolean(),
    age_over_67: z.boolean(),
    age_over_68: z.boolean(),
    age_over_69: z.boolean(),
    age_over_70: z.boolean(),
    age_over_71: z.boolean(),
    age_over_72: z.boolean(),
    age_over_73: z.boolean(),
    age_over_74: z.boolean(),
    age_over_75: z.boolean(),
    age_over_76: z.boolean(),
    age_over_77: z.boolean(),
    age_over_78: z.boolean(),
    age_over_79: z.boolean(),
    age_over_80: z.boolean(),
    age_over_81: z.boolean(),
    age_over_82: z.boolean(),
    age_over_83: z.boolean(),
    age_over_84: z.boolean(),
    age_over_85: z.boolean(),
    age_over_86: z.boolean(),
    age_over_87: z.boolean(),
    age_over_88: z.boolean(),
    age_over_89: z.boolean(),
    age_over_90: z.boolean(),
    age_over_91: z.boolean(),
    age_over_92: z.boolean(),
    age_over_93: z.boolean(),
    age_over_94: z.boolean(),
    age_over_95: z.boolean(),
    age_over_96: z.boolean(),
    age_over_97: z.boolean(),
    age_over_98: z.boolean(),
    age_over_99: z.boolean(),
  })
  .partial();

/**
 * Schema for Mobile Driving License (MDL)
 * @description
 * Represents a complete Mobile Driving License document according to ISO 18013-5.
 * This schema validates all required fields including personal information, document details,
 * driving privileges, and biometric data.
 *
 * @example
 * ```typescript
 * const mdl = {
 *   family_name: "Doe",
 *   given_name: "John",
 *   birth_date: new DateOnly(),
 *   issue_date: new DateOnly(),
 *   expiry_date: new DateOnly(),
 *   // ... other required fields ...
 * };
 * const result = mdlSchema.parse(mdl);
 * ```
 */
export const mdlSchema = z
  .object({
    family_name: z.string(),
    given_name: z.string(),
    birth_date: createRequiredSchema('birth_date').pipe(fullDateSchema),
    issue_date: createRequiredSchema('issue_date').pipe(fullDateSchema),
    expiry_date: createRequiredSchema('expiry_date').pipe(fullDateSchema),
    issuing_country: z.string(),
    issuing_authority: z.string(),
    document_number: z.string(),
    portrait: createBytesSchema('portrait'),
    driving_privileges: z.array(drivingPrivilegesSchema),
    un_distinguishing_sign: z.string(),
    administrative_number: z.string(),
    sex: z.number().int().positive(),
    height: z.number().int().positive(),
    weight: z.number().int().positive(),
    eye_colour: z.string(),
    hair_colour: z.string(),
    birth_place: z.string(),
    resident_address: z.string(),
    portrait_capture_date: createRequiredSchema('portrait_capture_date').pipe(
      fullDateSchema
    ),
    age_in_years: z.number().int().positive(),
    age_birth_year: z.number().int().positive(),
    issuing_jurisdiction: z.string(),
    nationality: z.string(),
    resident_city: z.string(),
    resident_state: z.string(),
    resident_postal_code: z.string(),
    resident_country: z.string(),
    biometrictemplate_face: createBytesSchema('biometrictemplate_face'),
    family_name_national_character: z.string(),
    given_name_national_character: z.string(),
    signature_usual_mark: createBytesSchema('signature_usual_mark'),
  })
  .extend({ ...overAgeSchema.shape })
  .strict();

/**
 * Type definition for driving privileges
 * @description
 * Represents a validated set of driving privileges for a specific vehicle category
 *
 * ```cddl
 * DrivingPrivilege = {
 *  "vehicle_category_code": tstr,
 *  ? "issue_date": time,
 *  ? "expiry_date": time,
 *  "codes": [+ Code]
 * }
 * ```
 * @see {@link codeSchema}
 */
export type DrivingPrivilege = z.infer<typeof drivingPrivilegesSchema>;

/**
 * Type definition for Mobile Driving License
 * @description
 * Represents a validated Mobile Driving License document structure
 *
 * ```cddl
 * MDL = {
 *  "family_name": tstr,
 *  "given_name": tstr,
 *  "birth_date": time,
 *  "issue_date": time,
 *  "expiry_date": time,
 *  "issuing_country": tstr,
 *  "issuing_authority": tstr,
 *  "document_number": tstr,
 *  "portrait": bstr,
 *  "driving_privileges": [+ DrivingPrivileges],
 *  "un_distinguishing_sign": tstr,
 *  "administrative_number": tstr,
 *  "sex": uint,
 *  "height": uint,
 *  "weight": uint,
 *  "eye_colour": tstr,
 *  "hair_colour": tstr,
 *  "birth_place": tstr,
 *  "resident_address": tstr,
 *  "portrait_capture_date": date,
 *  "age_in_years": uint,
 *  "age_birth_year": uint,
 *  "issuing_jurisdiction": tstr,
 *  "nationality": tstr,
 *  "resident_city": tstr,
 *  "resident_state": tstr,
 *  "resident_postal_code": tstr,
 *  "resident_country": tstr,
 *  "biometrictemplate_xx": bstr,
 *  "family_name_national_character": tstr,
 *  "given_name_national_character": tstr,
 *  "signature_usual_mark": bstr,
 * }
 * ```
 */
export type Mdl = z.infer<typeof mdlSchema>;
