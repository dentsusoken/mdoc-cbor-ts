import { describe, it, expect } from 'vitest';
import { KJUR, KEYUTIL } from 'jsrsasign';
import { generateKeyPair, exportPKCS8, exportSPKI } from 'jose';
import { webcrypto as nodeWebCrypto } from 'node:crypto';

const pemToDer = (pem: string): Uint8Array => {
  const b64 = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
  return new Uint8Array(Buffer.from(b64, 'base64'));
};

const curveToNamedCurve = (
  curve: 'secp256r1' | 'secp384r1' | 'secp521r1'
): 'P-256' | 'P-384' | 'P-521' =>
  curve === 'secp256r1' ? 'P-256' : curve === 'secp384r1' ? 'P-384' : 'P-521';

const algToHash = (
  alg: 'SHA256withECDSA' | 'SHA384withECDSA' | 'SHA512withECDSA'
): 'SHA-256' | 'SHA-384' | 'SHA-512' =>
  alg === 'SHA256withECDSA'
    ? 'SHA-256'
    : alg === 'SHA384withECDSA'
      ? 'SHA-384'
      : 'SHA-512';

const coordLenForCurve = (
  curve: 'secp256r1' | 'secp384r1' | 'secp521r1'
): number => (curve === 'secp256r1' ? 32 : curve === 'secp384r1' ? 48 : 66);

const derEcdsaToRaw = (derSig: Uint8Array, coordLen: number): Uint8Array => {
  let offset = 0;

  const readLen = (buf: Uint8Array, start: number): [number, number] => {
    let i = start;
    const first = buf[i++];
    if ((first & 0x80) === 0) return [first, i];
    const numBytes = first & 0x7f;
    let len = 0;
    for (let k = 0; k < numBytes; k++) {
      len = (len << 8) | buf[i++];
    }
    return [len, i];
  };

  if (derSig[offset++] !== 0x30) throw new Error('Invalid DER: no SEQUENCE');
  const [, /*seqLen*/ afterSeqLen] = readLen(derSig, offset);
  offset = afterSeqLen;

  if (derSig[offset++] !== 0x02) throw new Error('Invalid DER: no INTEGER r');
  const [rLen, afterRLen] = readLen(derSig, offset);
  offset = afterRLen;
  let r = derSig.slice(offset, offset + rLen);
  offset += rLen;

  if (derSig[offset++] !== 0x02) throw new Error('Invalid DER: no INTEGER s');
  const [sLen, afterSLen] = readLen(derSig, offset);
  offset = afterSLen;
  let s = derSig.slice(offset, offset + sLen);
  // Strip leading zeros if present, then left-pad to coordLen
  while (r.length > 0 && r[0] === 0x00) r = r.slice(1);
  while (s.length > 0 && s[0] === 0x00) s = s.slice(1);
  const rOut = new Uint8Array(coordLen);
  const sOut = new Uint8Array(coordLen);
  rOut.set(r, coordLen - r.length);
  sOut.set(s, coordLen - s.length);
  const out = new Uint8Array(coordLen * 2);
  out.set(rOut, 0);
  out.set(sOut, coordLen);
  return out;
};

type Curve = 'secp256r1' | 'secp384r1' | 'secp521r1';
type Alg = 'SHA256withECDSA' | 'SHA384withECDSA' | 'SHA512withECDSA';
// const EC_CURVE = {
//   P256: 'secp256r1',
//   P384: 'secp384r1',
//   P521: 'secp521r1',
// } as const satisfies Record<string, Curve>;

const signWithJsrsasignVerifyWithWebCrypto = async (
  curve: Curve,
  alg: Alg
): Promise<boolean> => {
  let privateKeyPem: string;
  let publicKeyPem: string;
  if (curve === 'secp521r1') {
    const { publicKey, privateKey } = await generateKeyPair('ES512');
    privateKeyPem = await exportPKCS8(privateKey);
    //console.log('privateKeyPem', privateKeyPem);
    publicKeyPem = await exportSPKI(publicKey);
    //console.log('publicKeyPem', publicKeyPem);
  } else {
    const { prvKeyObj, pubKeyObj } = KEYUTIL.generateKeypair('EC', curve);
    privateKeyPem = KEYUTIL.getPEM(prvKeyObj, 'PKCS8PRV');
    publicKeyPem = KEYUTIL.getPEM(pubKeyObj);
  }
  const sig = new KJUR.crypto.Signature({ alg });
  sig.init(privateKeyPem);
  sig.updateString('hello world');
  const derSigHex = sig.sign();

  const spkiDer = pemToDer(publicKeyPem);
  const subtle =
    globalThis.crypto && 'subtle' in globalThis.crypto
      ? globalThis.crypto.subtle
      : nodeWebCrypto.subtle;
  const key = await subtle.importKey(
    'spki',
    spkiDer,
    { name: 'ECDSA', namedCurve: curveToNamedCurve(curve) },
    false,
    ['verify']
  );

  const data = new TextEncoder().encode('hello world');
  const derSig = new Uint8Array(Buffer.from(derSigHex, 'hex'));
  // Try DER first
  let ok = await subtle.verify(
    { name: 'ECDSA', hash: { name: algToHash(alg) } },
    key,
    derSig,
    data
  );
  if (!ok) {
    //Some implementations expect raw (r||s)
    const rawSig = derEcdsaToRaw(derSig, coordLenForCurve(curve));
    ok = await subtle.verify(
      { name: 'ECDSA', hash: { name: algToHash(alg) } },
      key,
      rawSig,
      data
    );
  }
  return ok;
};

describe('ECDSA signatures with jsrsasign verify via Web Crypto', () => {
  it('P-256 (secp256r1) with SHA256 signs and verifies', async () => {
    await expect(
      signWithJsrsasignVerifyWithWebCrypto('secp256r1', 'SHA256withECDSA')
    ).resolves.toBe(true);
  });

  it('P-384 (secp384r1) with SHA384 signs and verifies', async () => {
    await expect(
      signWithJsrsasignVerifyWithWebCrypto('secp384r1', 'SHA384withECDSA')
    ).resolves.toBe(true);
  });

  it('P-521 (secp521r1) with SHA512 signs and verifies', async () => {
    await expect(
      signWithJsrsasignVerifyWithWebCrypto('secp521r1', 'SHA512withECDSA')
    ).resolves.toBe(true);
  });
});
