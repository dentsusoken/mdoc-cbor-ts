import { COSEKey, ProtectedHeaders, Headers, COSEKeyParam } from '@auth0/cose';

export interface ProtectHeaderGenerator {
  generate(privateKey: COSEKey): ProtectedHeaders;
}

export const defaultProtectHeaderGenerator: ProtectHeaderGenerator = {
  generate: (privateKey: COSEKey) => {
    const algorithm = privateKey.get(COSEKeyParam.Algorithm);
    const keyId = privateKey.get(COSEKeyParam.KeyID);

    if (!algorithm) {
      throw new Error('Algorithm is required');
    }
    if (!keyId) {
      throw new Error('KeyID is required');
    }

    const protectedHeader = new ProtectedHeaders();
    protectedHeader.set(Headers.Algorithm, algorithm);
    protectedHeader.set(Headers.KeyID, keyId);

    return protectedHeader;
  },
};
