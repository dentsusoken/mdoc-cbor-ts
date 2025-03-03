export type Entry<T> = T extends Map<infer K, infer V> ? [K, V] : never;
