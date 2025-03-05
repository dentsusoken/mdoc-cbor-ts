import { IssuerNameSpaces } from '../../../schemas/mdoc';
import { IssuerAuth } from '../../../schemas/mso';

export interface MSOVerifyHandler {
  verify: (
    issuerAuth: IssuerAuth,
    issuerNameSpaces: IssuerNameSpaces
  ) => Promise<boolean>;
}
