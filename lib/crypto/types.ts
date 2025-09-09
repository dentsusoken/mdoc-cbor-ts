import type { JwkObject } from 'jsrsasign';

type ECBase = Extract<JwkObject, { kty: 'EC' }>;

export type ECPublicJWK = Omit<
  Extract<ECBase, { x: string; y: string }>,
  'crv' | 'd'
> & {
  kty: 'EC';
  crv: 'P-256' | 'P-384' | 'P-521';
  x: string;
  y: string;
} & { [prop: string]: unknown };

export type ECPrivateJWK = Omit<Extract<ECBase, { d: string }>, 'crv'> & {
  kty: 'EC';
  crv: 'P-256' | 'P-384' | 'P-521';
  d: string;
} & { [prop: string]: unknown };

export type ECJWK = ECPublicJWK | ECPrivateJWK;
