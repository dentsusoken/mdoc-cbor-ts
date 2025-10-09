import { z } from 'zod';
import { createMDocSchema } from './MDoc';

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
