import { describe, it, expect } from 'vitest';
import { sha256 } from '../sha256';
import { encodeHex } from 'u8a-utils';

describe('sha256', () => {
  it('hashes known vector "abc"', () => {
    const msg = new TextEncoder().encode('abc');
    const out = sha256(msg);
    expect(encodeHex(out)).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it('matches Web Crypto SHA-256', async () => {
    const data = new TextEncoder().encode('hello world');
    const ours = sha256(data);

    const theirsBuf = await crypto.subtle.digest('SHA-256', data);
    const theirs = new Uint8Array(theirsBuf);

    expect(ours).toEqual(theirs);
  });
});
