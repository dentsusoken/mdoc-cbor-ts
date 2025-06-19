import { Sign1 } from '@auth0/cose';
import { IssuerNameSpaces } from '../../../schemas/mdoc';
import {
  IssuerAuth,
  mobileSecurityObjectBytesSchema,
  mobileSecurityObjectSchema,
} from '../../../schemas/mso';
import { extractPublicKey } from './ExtractPublicKey';
import { MSOVerifyHandler } from './MSOVerifyHandler';
import { verifyDigest } from './VerifyDigest';
import { verifyValidityPeriod } from './VerifyValidityPeriod';
import { decode } from '../../../cbor';

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
  ) => Promise<void>;

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
        await new Sign1(...issuerAuth).verify(publicKey);
        await verifyDigest(issuerAuth, issuerNameSpaces);

        const payload = issuerAuth[2];
        const msoByte = mobileSecurityObjectBytesSchema.parse(decode(payload));
        const mso = mobileSecurityObjectSchema.parse(msoByte.data.esMap);
        const { validityInfo } = mso;
        const { validFrom, validUntil } = validityInfo;
        await verifyValidityPeriod(validFrom, validUntil);
      } catch (e) {
        throw e;
      }
    };
  }
}
