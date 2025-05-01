import {
  COSEKey,
  COSEKeyParam,
  Headers,
  ProtectedHeaders,
  Sign1,
  UnprotectedHeaders,
} from '@auth0/cose';
import { TypedMap } from '@jfromaniello/typedmap';
import { X509Adapter } from '../adapters';
import { ByteString, DateTime, encode } from '../cbor';
import { Configuration } from '../conf';
import { IssuerNameSpaces } from '../schemas/mdoc';
import {
  IssuerAuth,
  issuerAuthSchema,
  MobileSecurityObject,
  MobileSecurityObjectBytes,
  ValidityInfo,
  ValueDigests,
} from '../schemas/mso';
import { KVMap } from '../types';
import { calculateDigest } from '../utils/calculateDigest';

export class MSOIssuer {
  #x509Adapter: X509Adapter;
  #configuration: Configuration;

  constructor(configuration: Configuration, x509Adapter: X509Adapter) {
    this.#configuration = configuration;
    this.#x509Adapter = x509Adapter;
  }

  async calculateValueDigests(
    nameSpaces: IssuerNameSpaces
  ): Promise<ValueDigests> {
    const valueDigests: ValueDigests = {};
    Object.entries(nameSpaces).forEach(([nameSpace, issuerSignedItem]) => {
      valueDigests[nameSpace] = {};
      issuerSignedItem.forEach(async (bs) => {
        valueDigests[nameSpace][bs.data.get('digestID')!] =
          await calculateDigest(this.#configuration.digestAlgorithm, bs);
      });
    });
    return valueDigests;
  }

  prepareValidityInfo(): ValidityInfo {
    const { validFrom, validUntil, expectedUpdate } = this.#configuration;
    const now = DateTime.now();

    const validityInfo: ValidityInfo = {
      signed: new DateTime(now),
      validFrom: new DateTime(now + validFrom),
      validUntil: new DateTime(now + validUntil),
    };

    if (expectedUpdate) {
      validityInfo.expectedUpdate = new DateTime(now + expectedUpdate);
    }

    return validityInfo;
  }

  prepareHeaders() {
    const { certificate, privateKey } = this.#x509Adapter;
    const alg = privateKey.get(COSEKeyParam.Algorithm);
    const kid = privateKey.get(COSEKeyParam.KeyID);

    if (!alg) {
      throw new Error('Signing Key must have alg claim.');
    }
    if (!kid) {
      throw new Error('Signing Key must have kid claim.');
    }

    const protectedHeaders = new ProtectedHeaders([
      [Headers.Algorithm, alg],
      [Headers.KeyID, kid],
    ]);
    const unprotectedHeaders = new UnprotectedHeaders([
      [Headers.X5Chain, new Uint8Array(certificate.raw)],
    ]);

    return {
      protectedHeaders,
      unprotectedHeaders,
    };
  }

  async issue(
    docType: string,
    nameSpaces: IssuerNameSpaces,
    deviceKey: COSEKey
  ): Promise<IssuerAuth> {
    const mso = new TypedMap<KVMap<MobileSecurityObject>>();
    mso.set('version', '1.0');
    mso.set('docType', docType);
    mso.set('digestAlgorithm', this.#configuration.digestAlgorithm);
    mso.set('valueDigests', await this.calculateValueDigests(nameSpaces));
    mso.set('validityInfo', this.prepareValidityInfo());
    mso.set('deviceKeyInfo', { deviceKey: Object.fromEntries(deviceKey) });

    const msoBytes: MobileSecurityObjectBytes = new ByteString(mso);

    const { protectedHeaders, unprotectedHeaders } = this.prepareHeaders();

    const sign1 = await Sign1.sign(
      protectedHeaders,
      unprotectedHeaders,
      encode(msoBytes),
      await this.#x509Adapter.privateKey.toKeyLike()
    );

    return issuerAuthSchema.parse(sign1.getContentForEncoding());
  }
}
