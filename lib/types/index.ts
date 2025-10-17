/**
 * A function that generates cryptographically secure random bytes.
 *
 * @param byteLength - The number of random bytes to generate. Defaults to 32 if not specified.
 * @returns A Uint8Array containing the generated random bytes.
 */
export type RandomBytes = (byteLength?: number) => Uint8Array;

export type EnumKeys<T extends Record<string, string | number>> = keyof T;

export type EnumStringValues<T extends Record<string, string>> =
  `${T[keyof T]}`;

type StringToNumber<S extends string> = S extends `${infer N extends number}`
  ? N
  : never;

export type EnumNumberValues<T extends Record<string, string | number>> =
  StringToNumber<`${T[keyof T]}`>;
