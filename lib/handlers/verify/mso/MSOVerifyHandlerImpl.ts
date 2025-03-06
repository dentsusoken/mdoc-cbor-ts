import { IssuerNameSpaces } from '../../../schemas/mdoc';
import { IssuerAuth } from '../../../schemas/mso';
import { extractPublicKey } from './ExtractPublicKey';
import { MSOVerifyHandler } from './MSOVerifyHandler';
import { verifyDigest } from './VerifyDigest';

/**
 * Implementation of the Mobile Security Object verification handler
 * @description
 * A class that implements the MSO verification process. It verifies both
 * the issuer's authentication signature and the digest values of the name spaces.
 *
 * @example
 * ```typescript
 * const handler = new MSOVerifyHandlerImpl();
 * const isValid = await handler.verify(issuerAuth, issuerNameSpaces);
 * ```
 */
export class MSOVerifyHandlerImpl implements MSOVerifyHandler {
  verify: (
    issuerAuth: IssuerAuth,
    issuerNameSpaces: IssuerNameSpaces
  ) => Promise<boolean>;

  /**
   * Creates a new MSO verification handler
   */
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
