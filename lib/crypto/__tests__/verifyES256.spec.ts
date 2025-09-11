import { describe, it, expect } from 'vitest';
import { generateP256KeyPair } from '../generateP256KeyPair';
import { signES256 } from '../signES256';
import { verifyES256 } from '../verifyES256';
import { importEcPrivateKeyFromJwk } from '../importEcPrivateKeyFromJwk';

const derToRawP256 = (der: Uint8Array): Uint8Array => {
  let i = 0;
  const readLen = (): number => {
    const first = der[i++];
    if ((first & 0x80) === 0) return first;
    const n = first & 0x7f;
    let len = 0;
    for (let k = 0; k < n; k++) len = (len << 8) | der[i++];
    return len;
  };
  if (der[i++] !== 0x30) throw new Error('Bad DER: SEQ');
  void readLen();
  if (der[i++] !== 0x02) throw new Error('Bad DER: r');
  const rLen = readLen();
  let r = der.slice(i, i + rLen);
  i += rLen;
  if (der[i++] !== 0x02) throw new Error('Bad DER: s');
  const sLen = readLen();
  let s = der.slice(i, i + sLen);
  while (r.length > 0 && r[0] === 0x00) r = r.slice(1);
  while (s.length > 0 && s[0] === 0x00) s = s.slice(1);
  const coordLen = 32;
  const rOut = new Uint8Array(coordLen);
  const sOut = new Uint8Array(coordLen);
  rOut.set(r, coordLen - r.length);
  sOut.set(s, coordLen - s.length);
  const out = new Uint8Array(coordLen * 2);
  out.set(rOut, 0);
  out.set(sOut, coordLen);
  return out;
};

describe('verifyES256', () => {
  it('verifies signature created by signES256', () => {
    const { privateJwk: privateKeyJwk, publicJwk: publicKeyJwk } =
      generateP256KeyPair();
    const data = new TextEncoder().encode('hello world');
    const sigConcat = signES256({ privateKeyJwk, data });
    const ok = verifyES256({ publicKeyJwk, data, signature: sigConcat });
    expect(ok).toBe(true);
  });

  it('verifies signature created by Web Crypto', async () => {
    const { privateJwk: privateKeyJwk, publicJwk: publicKeyJwk } =
      generateP256KeyPair();
    const data = new TextEncoder().encode('hello world');

    const privateKey = await importEcPrivateKeyFromJwk(privateKeyJwk);
    const derSig = new Uint8Array(
      await crypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        privateKey,
        data
      )
    );
    const concatSig = derToRawP256(derSig);

    const ok = verifyES256({ publicKeyJwk, data, signature: concatSig });
    expect(ok).toBe(true);
  });
});
