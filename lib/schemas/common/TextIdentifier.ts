import { z } from 'zod';
import {
  createTextSchema,
  TEXT_EMPTY_MESSAGE_SUFFIX,
  TEXT_INVALID_TYPE_MESSAGE_SUFFIX,
  TEXT_REQUIRED_MESSAGE_SUFFIX,
} from './Text';

/**
 * Identifier schema (string-based)
 * @description
 * Provides a semantic alias for identifier-like string fields such as `DocType`, `NameSpace`, and `DataElementIdentifier`.
 * It delegates to `createTextSchema` for validation and error message formatting.
 *
 * Usage stays consistent with other string identifiers while keeping intent explicit.
 */
export const createTextIdentifierSchema = (target: string): z.ZodType<string> =>
  createTextSchema(target);

// Re-export message suffixes for convenience
export {
  TEXT_EMPTY_MESSAGE_SUFFIX,
  TEXT_INVALID_TYPE_MESSAGE_SUFFIX,
  TEXT_REQUIRED_MESSAGE_SUFFIX,
};


