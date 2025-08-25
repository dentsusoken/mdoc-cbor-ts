import { z } from 'zod';
import { createRequiredSchema } from './Required';

/**
 * Creates an error message for invalid record types
 * @description
 * Generates a standardized error message when a record validation fails due to invalid type.
 * The message indicates the expected target name and that the value should be a record.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = recordInvalidTypeMessage('DeviceNameSpaces');
 * // Returns: "DeviceNameSpaces: Expected a record { NonEmptyText => any }, but received a different type. Please provide a record."
 * ```
 */
export const recordInvalidTypeMessage = (target: string): string =>
  `${target}: Expected a record { NonEmptyText => any }, but received a different type. Please provide a record.`;

/**
 * Creates an error message for empty record validation
 * @description
 * Generates a standardized error message when a record validation fails because
 * the record is empty but non-empty records are required.
 *
 * @param target - The name of the target schema being validated
 * @returns A formatted error message string
 *
 * @example
 * ```typescript
 * const message = recordEmptyMessage('DeviceNameSpaces');
 * // Returns: "DeviceNameSpaces: At least one entry must be provided. The record cannot be empty."
 * ```
 */
export const recordEmptyMessage = (target: string): string =>
  `${target}: At least one entry must be provided. The record cannot be empty.`;

/**
 * Parameters for creating a record schema
 * @description
 * Configuration object used to create a record schema with validation rules.
 * The key schema must be one of the supported Zod key types for records.
 *
 * @template KS - Key schema type, must extend ZodString, ZodNumber, or ZodSymbol
 * @template V - Value type that will be validated by the value schema
 */
type RecordSchemaParams<KS extends z.ZodTypeAny, V> = {
  /** Name used in error messages (e.g., "DeviceNameSpaces", "Headers") */
  target: string;
  /** Zod schema for validating record keys */
  keySchema: KS;
  /** Zod schema for validating record values */
  valueSchema: z.ZodType<V>;
  /** When true, allows an empty record (default: false) */
  allowEmpty?: boolean;
};

/**
 * Creates the inner record schema with validation
 * @description
 * Internal function that creates a Zod record schema with custom validation rules.
 * Validates that the input is a record type and optionally enforces non-empty records.
 *
 * @template KS - Key schema type (may be ZodString/ZodNumber/ZodSymbol or effects thereof)
 * @template V - Value type that will be validated by the value schema
 *
 * @param params - Configuration object for the record schema
 * @returns A Zod schema that validates Record<K, V> structures
 */
const createRecordInnerSchema = <KS extends z.ZodTypeAny, V>({
  target,
  keySchema,
  valueSchema,
  allowEmpty = false,
}: RecordSchemaParams<KS, V>): z.ZodType<Record<z.infer<KS>, V>> =>
  z
    .record(
      keySchema as unknown as z.ZodString | z.ZodNumber | z.ZodSymbol,
      valueSchema,
      {
        invalid_type_error: recordInvalidTypeMessage(target),
      }
    )
    .refine(
      (data) => {
        return allowEmpty || Object.keys(data).length > 0;
      },
      {
        message: recordEmptyMessage(target),
      }
    );

/**
 * Builds a record schema with optional non-empty enforcement
 * @description
 * Returns a Zod schema that validates a required Record<K, V> structure, where each
 * key and value is validated by the provided schemas. By default, the record must be
 * non-empty; set `allowEmpty: true` to allow empty records. All validation error
 * messages are prefixed with the provided `target` and use the message constants
 * exported from this module.
 *
 * Validation rules:
 * - Requires a Record type with a target-prefixed invalid type message
 * - Requires presence with a target-prefixed required message
 * - Enforces non-empty by default; pass `allowEmpty: true` to allow empty Record
 * - Each key must satisfy the provided `keySchema`
 * - Each value must satisfy the provided `valueSchema`
 *
 * ```cddl
 * Record = { NonEmptyText => any }
 * ```
 *
 * @param target - Prefix used in error messages (e.g., "DeviceNameSpaces", "Headers")
 * @param keySchema - Zod schema for validating record keys
 * @param valueSchema - Zod schema for validating record values
 * @param allowEmpty - When true, allows an empty record (default: false)
 * @returns A Zod schema that validates Record<K, V> structures
 *
 * @example
 * ```typescript
 * const nameSpacesSchema = createRecordSchema({
 *   target: 'DeviceNameSpaces',
 *   keySchema: z.string(),
 *   valueSchema: z.any(),
 * });
 * const result = nameSpacesSchema.parse({ key: 'value' }); // Record<string, any>
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (empty record is not allowed)
 * // Message: "Headers: At least one entry must be provided. The record cannot be empty."
 * const schema = createRecordSchema({
 *   target: 'Headers',
 *   keySchema: z.string(),
 *   valueSchema: z.string(),
 * });
 * schema.parse({});
 * ```
 *
 * @example
 * ```typescript
 * // Allows empty record with allowEmpty
 * const schema = createRecordSchema({
 *   target: 'Headers',
 *   keySchema: z.string(),
 *   valueSchema: z.string(),
 *   allowEmpty: true,
 * });
 * const result = schema.parse({}); // Record<string, string>
 * ```
 *
 * @example
 * ```typescript
 * // Throws ZodError (invalid type)
 * // Message: "Headers: Expected a record { NonEmptyText => any }, but received a different type. Please provide a record."
 * const schema = createRecordSchema({
 *   target: 'Headers',
 *   keySchema: z.string(),
 *   valueSchema: z.string(),
 * });
 * // @ts-expect-error
 * schema.parse(new Map([['key', 'value']])); // Map instead of Record
 * ```
 */
export const createRecordSchema = <KS extends z.ZodTypeAny, V>({
  target,
  keySchema,
  valueSchema,
  allowEmpty = false,
}: RecordSchemaParams<KS, V>): z.ZodType<Record<z.infer<KS>, V>> =>
  createRequiredSchema(target).pipe(
    createRecordInnerSchema({ target, keySchema, valueSchema, allowEmpty })
  );
