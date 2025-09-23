import { describe, it, expect } from 'vitest';
import { sha384 } from '../sha384';
import { encodeHex } from 'u8a-utils';

describe('sha384', () => {
  it('hashes known vector "abc"', () => {
    const msg = new TextEncoder().encode('abc');
    const out = sha384(msg);
    expect(encodeHex(out)).toBe(
      'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7'
    );
  });

  it('matches Web Crypto SHA-384', async () => {
    const data = new TextEncoder().encode('hello world');
    const ours = sha384(data);

    const theirsBuf = await crypto.subtle.digest('SHA-384', data);
    const theirs = new Uint8Array(theirsBuf);

    expect(ours).toEqual(theirs);
  });
});
