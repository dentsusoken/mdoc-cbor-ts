import { z } from 'zod';

/**
 * Zod schema for validating ISO 3166-1 alpha-2 country codes.
 *
 * Ensures the string is exactly two uppercase English letters, suitable for use as a country code.
 *
 * @example
 * countryCodeSchema.parse("US"); // Valid
 * countryCodeSchema.parse("gb"); // Throws ZodError: Must contain only uppercase letters
 * countryCodeSchema.parse("USA"); // Throws ZodError: Must be a 2-letter country code
 */
export const countryCodeSchema = z
  .string()
  .length(2, 'Must be a 2-letter country code')
  .regex(/^[A-Z]{2}$/, 'Must contain only uppercase letters');
