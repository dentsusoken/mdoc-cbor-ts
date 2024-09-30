import { Sign1 } from '@auth0/cose';
import { MsoVerifier } from '../mso/verifier';
import { Dict } from '../types';
import { MissingIssuerAuth } from './exceptions';

export class IssuerSigned {
  public issuerAuth: MsoVerifier;

  constructor(public nameSpaces: Dict, issuerAuth: Dict | Uint8Array) {
    if (!issuerAuth) {
      throw new MissingIssuerAuth('issuerAuth must be provided');
    }
    if (issuerAuth instanceof Uint8Array) {
      this.issuerAuth = new MsoVerifier(issuerAuth);
    } else {
      this.issuerAuth = new MsoVerifier(
        Object.values(issuerAuth) as ConstructorParameters<typeof Sign1>
      );
    }
  }
}
