import { COSEKey, ProtectedHeaders, Headers, COSEKeyParam } from '@auth0/cose';

export interface ProtectHeaderGenerator {
  generate(privateKey: COSEKey): ProtectedHeaders;
}

export const defaultProtectHeaderGenerator: ProtectHeaderGenerator = {
  generate: (privateKey: COSEKey) => {
    const protectedHeader = new ProtectedHeaders();
    protectedHeader.set(
      Headers.Algorithm,
      privateKey.get(COSEKeyParam.Algorithm)!
    );
    protectedHeader.set(Headers.KeyID, privateKey.get(COSEKeyParam.KeyID)!);
    return protectedHeader;
  },
};
