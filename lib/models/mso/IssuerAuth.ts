import { Sign1 } from '@auth0/cose';
import { z } from 'zod';

const numberKey = z.union([
  z.number().int().positive(),
  z
    .string()
    .regex(/^\d+$/)
    .transform((s) => Number(s)),
]);

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

export const issuerAuthSchema = z.array(z.any()).transform((sign1) => {
  const [protectedHeaders, unprotectedHeaders, payload, signature] = sign1;
  const unprotectedHeadersMap = numberMap.parse(unprotectedHeaders);
  return new Sign1(protectedHeaders, unprotectedHeadersMap, payload, signature);
});

/**
 * ```cddl
 * IssuerAuth = COSE_Sign1
 * ```
 * @see {@link Sign1}
 */
export type IssuerAuth = z.infer<typeof issuerAuthSchema>;
