export type KVMap<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];
