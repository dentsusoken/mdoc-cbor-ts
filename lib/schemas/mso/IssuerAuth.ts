import { Sign1 } from '@auth0/cose';
import { z } from 'zod';

/**
 * Schema for validating number keys in MSO
 * @description
 * Represents a positive integer that can be provided as a number or string.
 * This schema validates and normalizes the key format.
 */
const numberKey = z.union([
  z.number().int().positive(),
  z
    .string()
    .regex(/^\d+$/)
    .transform((s) => Number(s)),
]);

/**
 * Schema for validating number maps in MSO
 * @description
 * Represents a map with number keys that can be provided as an object or Map.
 * This schema validates and normalizes the map format.
 */
const numberMap = z.union([
  z.record(numberKey, z.any()).transform((obj) => {
    const entries: [number, any][] = Object.entries(obj).map(([key, value]) => [
      Number(key),
      value,
    ]);
    return new Map(entries);
  }),
  z.map(numberKey, z.any()),
]);

/**
 * Schema for issuer authentication in MSO
 * @description
 * Represents a COSE_Sign1 signature created by the issuer.
 * This schema validates and transforms COSE_Sign1 objects while preserving their structure.
 *
 * @example
 * ```typescript
 * const sign1 = [protectedHeaders, unprotectedHeaders, payload, signature];
 * const result = issuerAuthSchema.parse(sign1); // Returns Sign1
 * ```
 */
export const issuerAuthSchema = z.array(z.any()).transform((sign1) => {
  const [protectedHeaders, unprotectedHeaders, payload, signature] = sign1;
  const unprotectedHeadersMap = numberMap.parse(unprotectedHeaders);
  return new Sign1(protectedHeaders, unprotectedHeadersMap, payload, signature);
});

/**
 * Type definition for issuer authentication
 * @description
 * Represents a validated COSE_Sign1 signature from the issuer
 *
 * ```cddl
 * IssuerAuth = COSE_Sign1
 * ```
 * @see {@link Sign1}
 */
export type IssuerAuth = z.infer<typeof issuerAuthSchema>;
