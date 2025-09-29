import { Headers } from '@/cose/types';

export const buildUnprotectedHeaders = (
  x5c: Uint8Array[]
): Map<number, unknown> => {
  return new Map<number, unknown>([[Headers.X5Chain, x5c]]);
};
