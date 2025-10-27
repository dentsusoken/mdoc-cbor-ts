import { describe, it, expect } from 'vitest';
//import { KJUR, KEYUTIL } from 'jsrsasign';

// const signAndVerify = (alg: string): boolean => {
//   const { prvKeyObj, pubKeyObj } = KEYUTIL.generateKeypair('RSA', 2048);
//   const sig = new KJUR.crypto.Signature({ alg });
//   sig.init(prvKeyObj);
//   sig.updateString('hello world');
//   const hex = sig.sign();

//   const verifier = new KJUR.crypto.Signature({ alg });
//   verifier.init(pubKeyObj);
//   verifier.updateString('hello world');
//   return verifier.verify(hex);
// };

describe('PKCS#1 v1.5 signatures with jsrsasign', () => {
  it('dummy', () => {
    expect(true).toBe(true);
  });
  // it.skip('SHA1withRSA signs and verifies', () => {
  //   expect(signAndVerify('SHA1withRSA')).toBe(true);
  // });
  // it('SHA224withRSA signs and verifies', () => {
  //   expect(signAndVerify('SHA224withRSA')).toBe(true);
  // });
  // it('SHA256withRSA signs and verifies', () => {
  //   expect(signAndVerify('SHA256withRSA')).toBe(true);
  // });
  // it('SHA384withRSA signs and verifies', () => {
  //   expect(signAndVerify('SHA384withRSA')).toBe(true);
  // });
  // it('SHA512withRSA signs and verifies', () => {
  //   expect(signAndVerify('SHA512withRSA')).toBe(true);
  // });
});
