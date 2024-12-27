import { MsoVerifyHandler, MsoVerifyResult } from './MsoVerifyHandler';
import { RawIssuerSigned } from '../../schemas/issuerSignedSchema';
import { X509Parser } from '../../middleware/x509';
import {
  createDefaultVerifySignatureHandler,
  VerifySignatureHandler,
} from './VerifySignatureHandler';

import {
  defaultVerifyDigestHandler,
  VerifyDigestHandler,
} from './VerifyDigestHandler';

export interface MsoVerifyHandlerOpt {
  verifySignatureHandler?: VerifySignatureHandler;
  verifyDigestHandler?: VerifyDigestHandler;
}

export class MsoVerifyHandlerImpl implements MsoVerifyHandler {
  #x509Parser: X509Parser;
  #verifySignatureHandler: VerifySignatureHandler;
  #verifyDigestHandler: VerifyDigestHandler;

  constructor(x509Parser: X509Parser, opt: MsoVerifyHandlerOpt = {}) {
    if (!x509Parser) {
      throw new Error('X509Parser is required');
    }
    this.#x509Parser = x509Parser;
    this.#verifySignatureHandler =
      opt.verifySignatureHandler ??
      createDefaultVerifySignatureHandler(x509Parser);
    this.#verifyDigestHandler =
      opt.verifyDigestHandler ?? defaultVerifyDigestHandler;
  }

  async verify(issuerSigned: RawIssuerSigned): Promise<MsoVerifyResult> {
    try {
      if (!issuerSigned?.issuerAuth) {
        throw new Error('Invalid issuerSigned: issuerAuth is required');
      }

      if (!issuerSigned?.nameSpaces) {
        throw new Error('Invalid issuerSigned: nameSpaces is required');
      }

      await this.#verifySignatureHandler(issuerSigned.issuerAuth);
      await this.#verifyDigestHandler(
        issuerSigned.issuerAuth,
        issuerSigned.nameSpaces
      );

      return { verified: true };
    } catch (error) {
      if (error instanceof Error) {
        return { verified: false, error };
      }
      return { verified: false, error: new Error('Unknown error') };
    }
  }
}
