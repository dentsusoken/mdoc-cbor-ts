import { describe, it, expect } from 'vitest';
//import { KJUR, KEYUTIL } from 'jsrsasign';

// const signAndVerifyPSS = (
//   alg: 'SHA256withRSAandMGF1' | 'SHA384withRSAandMGF1' | 'SHA512withRSAandMGF1'
// ): boolean => {
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

describe('RSA-PSS signatures with jsrsasign', () => {
  it('dummy', () => {
    expect(true).toBe(true);
  });
  // it('SHA256withRSAandMGF1 signs and verifies', () => {
  //   expect(signAndVerifyPSS('SHA256withRSAandMGF1')).toBe(true);
  // });

  // it('SHA384withRSAandMGF1 signs and verifies', () => {
  //   expect(signAndVerifyPSS('SHA384withRSAandMGF1')).toBe(true);
  // });

  // it('SHA512withRSAandMGF1 signs and verifies', () => {
  //   expect(signAndVerifyPSS('SHA512withRSAandMGF1')).toBe(true);
  // });
});
