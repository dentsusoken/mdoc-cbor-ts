import { COSEKey, Sign1 } from '@auth0/cose';
import { X509Adapter } from '../../../adapters/X509Adapter';
import { ByteString, encode } from '../../../cbor';
import { Configuration } from '../../../conf/Configuration';
import { IssuerNameSpaces } from '../../../schemas/mdoc';
import { IssuerAuth, MobileSecurityObjectBytes } from '../../../schemas/mso';
import { buildProtectedHeaders } from '../common/BuildProtectedHeaders';
import { buildUnprotectedHeaders } from '../common/BuildUnprotectedHeaders';
import { createMobileSecurityObjectBuilder } from './BuildMobileSecurityObject';
import { createValidityInfoBuilder } from './BuildValidityInfo';
import { createValueDigestsBuilder } from './BuildValueDigests';
import { MSOIssueHandler } from './MSOIssueHandler';

/**
 * Implementation of the Mobile Security Object issue handler
 * @description
 * A class that implements the MSO issue process. It creates Mobile Security
 * Objects with issuer authentication using the provided configuration and
 * X.509 adapter.
 *
 * @example
 * ```typescript
 * const handler = new MSOIssueHandlerImpl(configuration, x509Adapter);
 * const issuerAuth = await handler.issue(docType, nameSpaces, deviceKey);
 * ```
 */
export class MSOIssueHandlerImpl implements MSOIssueHandler {
  #x509Adapter: X509Adapter;
  issue: (
    docType: string,
    nameSpaces: IssuerNameSpaces,
    deviceKey: COSEKey
  ) => Promise<IssuerAuth>;

  /**
   * Creates a new MSO issue handler
   * @param configuration - Configuration settings for the MSO
   * @param x509Adapter - Adapter for handling X.509 certificates and keys
   */
  constructor(configuration: Configuration, x509Adapter: X509Adapter) {
    this.#x509Adapter = x509Adapter;
    const buildValidityInfo = createValidityInfoBuilder({
      configuration,
    });
    const buildValueDigests = createValueDigestsBuilder({
      configuration,
    });

    const buildMobileSecurityObject = createMobileSecurityObjectBuilder({
      configuration,
      buildValueDigests: buildValueDigests,
      buildValidityInfo: buildValidityInfo,
    });

    this.issue = async (
      docType: string,
      nameSpaces: IssuerNameSpaces,
      deviceKey: COSEKey
    ) => {
      const msoBytes: MobileSecurityObjectBytes = new ByteString(
        await buildMobileSecurityObject(docType, nameSpaces, deviceKey)
      );
      const protectedHeaders = buildProtectedHeaders(
        this.#x509Adapter.privateKey
      );
      const unprotectedHeaders = buildUnprotectedHeaders(
        this.#x509Adapter.certificate
      );
      return await Sign1.sign(
        protectedHeaders,
        unprotectedHeaders,
        encode(msoBytes),
        await this.#x509Adapter.privateKey.toKeyLike()
      );
    };
  }
}
