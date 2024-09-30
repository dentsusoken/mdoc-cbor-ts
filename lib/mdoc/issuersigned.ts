import { Sign1 } from '@auth0/cose';
import { MsoVerifier } from '../mso/verifier';
import { Dict } from '../types';
import { MissingIssuerAuth } from './exceptions';

/**
 * IssuerSigned is a class that provides methods to handle issuer signed data
 * @property {MsoVerifier} issuerAuth The issuer auth.
 * @property {Dict} nameSpaces The namespaces.
 */
export class IssuerSigned {
  public issuerAuth: MsoVerifier;

  /**
   * Creates an instance of IssuerSigned.
   * @param {Dict} nameSpaces The namespaces.
   * @param {Dict | Uint8Array} issuerAuth The issuer auth.
   * @throws {MissingIssuerAuth} If issuerAuth is not provided.
   */
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
