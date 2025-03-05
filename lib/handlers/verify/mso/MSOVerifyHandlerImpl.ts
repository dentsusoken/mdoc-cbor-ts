import { IssuerNameSpaces } from '../../../schemas/mdoc';
import { IssuerAuth } from '../../../schemas/mso';
import { extractPublicKey } from './ExtractPublicKey';
import { MSOVerifyHandler } from './MSOVerifyHandler';
import { verifyDigest } from './VerifyDigest';

export class MSOVerifyHandlerImpl implements MSOVerifyHandler {
  verify: (
    issuerAuth: IssuerAuth,
    issuerNameSpaces: IssuerNameSpaces
  ) => Promise<boolean>;

  constructor() {
    this.verify = async (
      issuerAuth: IssuerAuth,
      issuerNameSpaces: IssuerNameSpaces
    ) => {
      try {
        const publicKey = await extractPublicKey(issuerAuth);
        await issuerAuth.verify(publicKey);
        await verifyDigest(issuerAuth, issuerNameSpaces);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    };
  }
}
