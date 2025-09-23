import { describe, it, expect } from 'vitest';
import { sha512 } from '../sha512';

describe('sha512', () => {
  it('matches Web Crypto SHA-512 for "abc"', async () => {
    const msg = new TextEncoder().encode('abc');
    const ours = sha512(msg);
    const theirsBuf = await crypto.subtle.digest('SHA-512', msg);
    const theirs = new Uint8Array(theirsBuf);
    expect(ours).toEqual(theirs);
  });

  it('matches Web Crypto SHA-512', async () => {
    const data = new TextEncoder().encode('hello world');
    const ours = sha512(data);

    const theirsBuf = await crypto.subtle.digest('SHA-512', data);
    const theirs = new Uint8Array(theirsBuf);

    expect(ours).toEqual(theirs);
  });
});
