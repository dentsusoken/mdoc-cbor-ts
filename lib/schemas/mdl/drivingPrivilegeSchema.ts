import { z } from 'zod';
import { fullDateSchema } from '@/schemas/cbor/FullDate';

/**
 * Schema for a code within driving privileges.
 * @description
 * Represents a driving privilege code, optionally including a sign and value, as per ISO/ICAO standards.
 *
 * @example
 * ```typescript
 * const code = {
 *   code: "B",
 *   sign: "+",
 *   value: "96"
 * }
 * codeSchema.parse(code); // Valid
 * ```
 */
const codeSchema = z.object({
  /** The driving privilege code (e.g., "B", "BE") */
  code: z.string().min(1),
  /** Optional sign associated with the code (e.g., "+", "-") */
  sign: z.string().optional(),
  /** Optional value associated with the code */
  value: z.string().optional(),
});

/**
 * Schema for the drivingPrivilege object according to ISO 18013-5/ICAO mDL profile.
 * @description
 * Describes a single set of driving privileges, including vehicle category, valid period, and associated codes/modifiers.
 *
 * @example
 * ```typescript
 * const drivingPrivilege = {
 *   vehicle_category_code: "B",
 *   issue_date: "2022-01-01",
 *   expiry_date: "2027-01-01",
 *   codes: [
 *     { code: "78" },
 *     { code: "96", sign: "+", value: "96" }
 *   ]
 * }
 * drivingPrivilegeSchema.parse(drivingPrivilege); // Valid
 * ```
 */
export const drivingPrivilegeSchema = z.object({
  /** The vehicle category code (e.g., "B") */
  vehicle_category_code: z.string().min(1),
  /** Optional date when the privilege was issued */
  issue_date: fullDateSchema.optional(),
  /** Optional date when the privilege expires */
  expiry_date: fullDateSchema.optional(),
  /** Optional non-empty array of codes present for this privilege */
  codes: z.array(codeSchema).nonempty().optional(),
});

/**
 * Type representing the validated driving privilege object.
 */
export type DrivingPrivilege = z.output<typeof drivingPrivilegeSchema>;
