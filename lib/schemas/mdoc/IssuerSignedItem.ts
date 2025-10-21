import { z } from 'zod';
import { bytesSchema } from '@/schemas/cbor/Bytes';
import { createStrictMapSchema } from '@/schemas/containers/StrictMap';
import { createStrictMap } from '@/strict-map';

/**
 * Entries for the IssuerSignedItem schema in mdoc.
 * @description
 * Defines the keys and their schemas for a single issuer-signed data element.
 *
 * - `"digestID"` is defined directly as a non-negative integer: `z.number().int().nonnegative()`
 * - `"random"` is defined as a byte string (`bytesSchema`)
 * - `"elementIdentifier"` is defined directly as a non-empty string: `z.string().min(1)`
 * - `"elementValue"` is defined as any value: `z.unknown()`
 *
 * NOTE: `digestID`, `elementIdentifier`, and `elementValue` are defined inline (directly and not via imported schemas).
 *
 * ```cddl
 * IssuerSignedItem = {
 *   "digestID": uint,
 *   "random": bstr,
 *   "elementIdentifier": DataElementIdentifier,
 *   "elementValue": DataElementValue
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Use with createStrictMap for type safety.
 * const item = createIssuerSignedItem([
 *   ['digestID', 1],
 *   ['random', new Uint8Array([1,2,3])],
 *   ['elementIdentifier', 'given_name'],
 *   ['elementValue', 'John']
 * ]);
 * ```
 */
export const issuerSignedItemEntries = [
  ['digestID', z.number().int().nonnegative()],
  ['random', bytesSchema],
  ['elementIdentifier', z.string().min(1)],
  ['elementValue', z.unknown()],
] as const;

/**
 * Strict type helper for constructing an IssuerSignedItem Map.
 * @description
 * Use when creating IssuerSignedItem objects as an array of entries.
 *
 * @example
 * ```typescript
 * const item = createIssuerSignedItem([
 *   ['digestID', 1],
 *   ['random', new Uint8Array([1, 2, 3])],
 *   ['elementIdentifier', 'given_name'],
 *   ['elementValue', 'John']
 * ]);
 * ```
 */
export const createIssuerSignedItem = createStrictMap<
  typeof issuerSignedItemEntries
>;

/**
 * Zod schema for issuer-signed items in mdoc.
 * @description
 * Accepts a `Map` (<string, unknown>) only with the exact required keys.
 * Keys and values must conform to the inline definitions above.
 *
 * Validates:
 *   - digestID: integer, nonnegative
 *   - random: byte string
 *   - elementIdentifier: non-empty string
 *   - elementValue: unknown
 *
 * @example
 * ```typescript
 * const item = new Map([
 *   ['digestID', 1],
 *   ['random', new Uint8Array([1,2,3])],
 *   ['elementIdentifier', 'given_name'],
 *   ['elementValue', 'John']
 * ]);
 * const parsed = issuerSignedItemSchema.parse(item); // Returns IssuerSignedItem
 * ```
 */
export const issuerSignedItemSchema = createStrictMapSchema({
  target: 'IssuerSignedItem',
  entries: issuerSignedItemEntries,
});

/**
 * TypeScript type for an IssuerSignedItem in mdoc.
 * @description
 * Represents the output structure conforming to the issuerSignedItemSchema.
 */
export type IssuerSignedItem = z.output<typeof issuerSignedItemSchema>;
