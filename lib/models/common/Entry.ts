export type Entry<T> = T extends Record<infer K, infer V> ? [K, V] : never;
