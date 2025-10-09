import { z } from 'zod';
import { createMDocSchema } from './MDoc';

/**
 * Error message constant for DeviceResponse validation requiring at least one document or documentError.
 */
export const DEVICE_RESPONSE_AT_LEAST_ONE_MESSAGE =
  'DeviceResponse: At least one document or documentError must be provided.';

/**
 * Zod schema for validating a DeviceResponse structure.
 * This schema expects a Map-based input and validates that it conforms to the DeviceResponse specification,
 * requiring at least one of "documents" or "documentErrors" to be present, along with version and status.
 */
export const deviceResponseSchema = createMDocSchema('DeviceResponse');

/**
 * Type representing a DeviceResponse.
 * Contains version, documents or documentErrors, and status information.
 */
export type DeviceResponse = z.output<typeof deviceResponseSchema>;
