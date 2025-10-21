import { z } from 'zod';
import { documentSchema } from './Document';
import { documentErrorSchema } from '@/schemas/error';
import { versionSchema } from '@/schemas/common/Version';
import { createArraySchema } from '@/schemas/common/containers/Array';
import { createStructSchema } from '@/schemas/common/Struct';
import { MDocStatus } from '@/mdoc/types';

/**
 * Generates an error message indicating that at least one document or documentError must be provided.
 * @param target - The target name to include in the error message
 * @returns The formatted error message string
 */
export const mdocAtLeastOneDocumentOrErrorMessage = (target: string): string =>
  `${target}: At least one document or documentError must be provided.`;

/**
 * Creates a Zod schema for an MDoc object with validation.
 * The schema ensures that at least one of documents or documentErrors is provided.
 * @param mdocTarget - The target name used for error messages
 * @returns A Zod schema with refinement validation for MDoc objects
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const createMDocObjectSchema = (mdocTarget: string) => {
  const baseSchema = z.object({
    version: versionSchema,
    documents: createArraySchema({
      target: 'documents',
      itemSchema: documentSchema,
    }).optional(),
    documentErrors: createArraySchema({
      target: 'documentErrors',
      itemSchema: documentErrorSchema,
    }).optional(),
    status: z.nativeEnum(MDocStatus),
  });

  createStructSchema({
    target: mdocTarget,
    objectSchema: createMDocObjectSchema(mdocTarget),
  });

/**
 * Zod schema for validating an MDoc (mobile document) structure.
 * This schema expects a Map-based input and validates that it conforms to the MDoc specification,
 * requiring at least one of "documents" or "documentErrors" to be present, along with version and status.
 */
export const mdocSchema = createMDocSchema('MDoc');

/**
 * Type representing an MDoc (mobile document).
 * Contains version, documents or documentErrors, and status information.
 */
export type MDoc = z.output<ReturnType<typeof createMDocSchema>>;
