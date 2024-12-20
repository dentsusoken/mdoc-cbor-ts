import { UnprotectedHeaders, Headers } from '@auth0/cose';
import { X509Generator } from '../../middleware/x509';

export interface UnprotectHeaderGenerator {
  generate(x509Generator: X509Generator): Promise<UnprotectedHeaders>;
}

export const defaultUnprotectHeaderGenerator: UnprotectHeaderGenerator = {
  generate: async (x509Generator: X509Generator) => {
    const cert = await x509Generator.generate('der');
    const unprotectedHeader = new UnprotectedHeaders();
    unprotectedHeader.set(Headers.X5Chain, new Uint8Array(cert));
    return unprotectedHeader;
  },
};
