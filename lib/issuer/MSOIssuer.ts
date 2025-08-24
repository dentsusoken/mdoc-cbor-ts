import {
  COSEKey,
  COSEKeyParam,
  Headers,
  ProtectedHeaders,
  Sign1,
  UnprotectedHeaders,
} from '@auth0/cose';
import { X509Adapter } from '../adapters';
import { decodeCbor, encodeCbor } from '@/cbor/codec';
import { Configuration } from '@/conf/Configuration';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { ValueDigests } from '@/schemas/mso/ValueDigests';
import { ValidityInfo } from '@/schemas/mso/ValidityInfo';
import { IssuerAuth, issuerAuthSchema } from '@/schemas/mso/IssuerAuth';
import { calculateDigest } from '@/utils/calculateDigest';
import { toISODateTimeString } from '@/utils/toISODateTimeString';
import { createTag24 } from '@/cbor/createTag24';

/**
 * MSO (Mobile Security Object) Issuer for creating and signing mobile documents
 * @description
 * The MSOIssuer class handles the creation and signing of Mobile Security Objects
 * for mobile documents (mDL). It manages the calculation of value digests,
 * preparation of validity information, and the creation of issuer authentication
 * structures using COSE signing.
 */
export class MSOIssuer {
  #x509Adapter: X509Adapter;
  #configuration: Configuration;

  /**
   * Creates a new MSOIssuer instance
   * @param configuration - The configuration object containing digest algorithm and validity periods
   * @param x509Adapter - The X.509 adapter for certificate and private key operations
   */
  constructor(configuration: Configuration, x509Adapter: X509Adapter) {
    this.#configuration = configuration;
    this.#x509Adapter = x509Adapter;
  }

  /**
   * Calculates MSO ValueDigests for provided issuer-signed namespaces.
   * @description
   * Iterates over each namespace and its issuer-signed items (Tag 24), decodes
   * the embedded IssuerSignedItem to read `digestID`, then computes the digest
   * of the Tag 24 value and builds a Map<NameSpace, Map<DigestID, Digest>>.
   * @param nameSpaces - The issuer namespaces containing signed items
   * @returns A promise that resolves to the calculated value digests
   */
  calculateValueDigests = async (
    nameSpaces: IssuerNameSpaces
  ): Promise<ValueDigests> => {
    const valueDigests: ValueDigests = new Map<
      string,
      Map<number, Uint8Array>
    >();

    for (const [nameSpace, issuerSignedItemTags] of nameSpaces) {
      const digestMap = new Map<number, Uint8Array>();

      for (const tag of issuerSignedItemTags) {
        const issuerSignedItem = decodeCbor(tag.value) as Map<string, unknown>;

        const digestID = issuerSignedItem.get('digestID') as number;
        const digest = await calculateDigest(
          this.#configuration.digestAlgorithm,
          tag
        );
        digestMap.set(digestID, digest);
      }

      valueDigests.set(nameSpace, digestMap);
    }

    return valueDigests;
  };

  /**
   * Prepares validity information for the MSO
   * @description
   * Creates a ValidityInfo object with signed timestamp, valid from/until dates,
   * and optional expected update time based on the current time and configuration.
   * @returns The prepared validity information
   */
  prepareValidityInfo = (): ValidityInfo => {
    const { validFrom, validUntil, expectedUpdate } = this.#configuration;
    const now = Date.now();

    const validityInfo: ValidityInfo = {
      signed: toISODateTimeString(new Date(now)),
      validFrom: toISODateTimeString(new Date(now + validFrom)),
      validUntil: toISODateTimeString(new Date(now + validUntil)),
    };

    if (expectedUpdate) {
      validityInfo.expectedUpdate = toISODateTimeString(
        new Date(now + expectedUpdate)
      );
    }

    return validityInfo;
  };

  /**
   * Prepares COSE headers for signing
   * @description
   * Creates protected and unprotected headers for COSE signing, including
   * algorithm, key ID (if available), and X.509 certificate chain.
   * @returns An object containing the prepared protected and unprotected headers
   * @throws {Error} If the signing key doesn't have an algorithm claim
   */
  prepareHeaders = (): {
    protectedHeaders: ProtectedHeaders;
    unprotectedHeaders: UnprotectedHeaders;
  } => {
    const { certificate, privateKey } = this.#x509Adapter;
    const alg = privateKey.get(COSEKeyParam.Algorithm);
    const kid = privateKey.get(COSEKeyParam.KeyID);

    const protectedHeadersData: [number, number | Uint8Array][] = [];

    if (!alg) {
      throw new Error('Signing Key must have alg claim.');
    }
    protectedHeadersData.push([Headers.Algorithm, alg]);

    if (kid) {
      protectedHeadersData.push([Headers.KeyID, kid]);
    }

    const protectedHeaders = new ProtectedHeaders(protectedHeadersData);
    const unprotectedHeaders = new UnprotectedHeaders([
      [Headers.X5Chain, new Uint8Array(certificate.raw)],
    ]);

    return {
      protectedHeaders,
      unprotectedHeaders,
    };
  };

  /**
   * Builds and signs an IssuerAuth structure
   * @description
   * Creates a complete Mobile Security Object (MSO) with all required fields,
   * wraps it in a CBOR Tag 24, and signs it using COSE_Sign1 to produce
   * an IssuerAuth structure for mobile document authentication.
   * @param docType - The document type identifier
   * @param nameSpaces - The issuer namespaces containing signed items
   * @param deviceKey - The device's public key for authentication
   * @returns A promise that resolves to the signed IssuerAuth structure
   */
  buildIssuerAuth = async (
    docType: string,
    nameSpaces: IssuerNameSpaces,
    deviceKey: COSEKey
  ): Promise<IssuerAuth> => {
    const mso = new Map<string, unknown>();
    mso.set('version', '1.0');
    mso.set('docType', docType);
    mso.set('digestAlgorithm', this.#configuration.digestAlgorithm);
    mso.set('valueDigests', await this.calculateValueDigests(nameSpaces));
    mso.set('validityInfo', this.prepareValidityInfo());
    mso.set('deviceKeyInfo', { deviceKey });

    const msoBytes = createTag24(mso);

    const { protectedHeaders, unprotectedHeaders } = this.prepareHeaders();

    const sign1 = await Sign1.sign(
      protectedHeaders,
      unprotectedHeaders,
      encodeCbor(msoBytes),
      await this.#x509Adapter.privateKey.toKeyLike()
    );

    return issuerAuthSchema.parse(sign1.getContentForEncoding());
  };
}
