import { z } from 'zod';
import { bytesSchema } from '@/schemas/cbor/Bytes';
import { fullDateSchema } from '@/schemas/cbor/FullDate';
import { drivingPrivilegeSchema } from './drivingPrivilegeSchema';

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
    family_name: z.string().min(1),
    given_name: z.string().min(1),
    birth_date: fullDateSchema,
    issue_date: fullDateSchema,
    expiry_date: fullDateSchema,
    issuing_country: z.string().min(1),
    issuing_authority: z.string(),
    document_number: z.string().min(1),
    portrait: bytesSchema,
    driving_privileges: z.array(drivingPrivilegeSchema),
    un_distinguishing_sign: z.string(),
    administrative_number: z.string(),
    sex: z.number().int().positive(),
    height: z.number().int().positive(),
    weight: z.number().int().positive(),
    eye_colour: z.string(),
    hair_colour: z.string(),
    birth_place: z.string(),
    resident_address: z.string(),
    portrait_capture_date: fullDateSchema,
    age_in_years: z.number().int().positive(),
    age_birth_year: z.number().int().positive(),
    issuing_jurisdiction: z.string(),
    nationality: z.string(),
    resident_city: z.string(),
    resident_state: z.string(),
    resident_postal_code: z.string(),
    resident_country: z.string(),
    biometrictemplate_face: bytesSchema,
    family_name_national_character: z.string(),
    given_name_national_character: z.string(),
    signature_usual_mark: bytesSchema,
  })
  .extend({ ...overAgeSchema.shape })
  .strict();

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
