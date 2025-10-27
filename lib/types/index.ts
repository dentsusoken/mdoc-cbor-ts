/**
 * A function that generates cryptographically secure random bytes.
 *
 * @param byteLength - The number of random bytes to generate. Defaults to 32 if not specified.
 * @returns A Uint8Array containing the generated random bytes.
 */
export type RandomBytes = (byteLength?: number) => Uint8Array;

/**
 * Gets the type of all keys of a given enum type.
 *
 * @template T - The enum object type.
 * @example
 * enum Example { Foo = 'foo', Bar = 'bar' }
 * type Keys = EnumKeys<typeof Example>; // "Foo" | "Bar"
 */
export type EnumKeys<T extends Record<string, string | number>> = keyof T;

/**
 * Gets the union type of all string values in a string-valued enum type.
 *
 * @template T - The enum object type (whose values are string).
 * @example
 * enum Example { Foo = 'foo', Bar = 'bar' }
 * type Values = EnumStringValues<typeof Example>; // "foo" | "bar"
 */
export type EnumStringValues<T extends Record<string, string>> =
  `${T[keyof T]}`;

/**
 * Internal helper to convert a string to a number type.
 *
 * @template S - The string literal type to convert to a number.
 * @example
 * type N = StringToNumber<'42'>; // 42
 */
type StringToNumber<S extends string> = S extends `${infer N extends number}`
  ? N
  : never;

/**
 * Gets the union type of all number values in a given enum type.
 *
 * @template T - The enum object type (whose values are string or number).
 * @example
 * enum Example { Foo = 1, Bar = 2 }
 * type Values = EnumNumberValues<typeof Example>; // 1 | 2
 */
export type EnumNumberValues<T extends Record<string, string | number>> =
  StringToNumber<`${T[keyof T]}`>;
