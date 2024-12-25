import { Sign1 } from '@auth0/cose';
import { MsoIssueHandler } from './MsoIssueHandler';
import { KeyManager } from '../../middleware/keys';
import { X509Generator } from '../../middleware/x509';
import { RawNameSpaces } from '../../schemas';
import {
  createDefaultHashMapGenerator,
  HashMapGenerator,
} from './HashMapGenerator';
import { MsoConfiguration } from '../../conf/MsoConfiguration';
import {
  defaultMsoPayloadGenerator,
  MsoPayloadGenerator,
  defaultProtectHeaderGenerator,
  ProtectHeaderGenerator,
  defaultUnprotectHeaderGenerator,
  UnprotectHeaderGenerator,
} from '.';
import { encode } from 'cbor-x';
import { CryptoConfig } from '../../conf';

export interface MsoIssuerConstructorOpt {
  hashMapGenerator?: HashMapGenerator;
  msoPayloadGenerator?: MsoPayloadGenerator;
  protectHeaderGenerator?: ProtectHeaderGenerator;
  unprotectHeaderGenerator?: UnprotectHeaderGenerator;
}

export type MsoIssuerConfig = MsoConfiguration &
  Pick<CryptoConfig, 'HASH_ALGORITHM'>;

export class MsoIssueHandlerImpl implements MsoIssueHandler {
  #keyManager: KeyManager;
  #x509Generator: X509Generator;
  #hashMapGenerator: HashMapGenerator;
  #msoIssuerConfiguration: MsoIssuerConfig;
  #msoPayloadGenerator: MsoPayloadGenerator;
  #protectHeaderGenerator: ProtectHeaderGenerator;
  #unprotectHeaderGenerator: UnprotectHeaderGenerator;

  constructor(
    keyManager: KeyManager,
    x509Generator: X509Generator,
    msoIssuerConfiguration: MsoIssuerConfig,
    options: MsoIssuerConstructorOpt = {}
  ) {
    this.#keyManager = keyManager;
    this.#x509Generator = x509Generator;
    this.#hashMapGenerator =
      options.hashMapGenerator ??
      createDefaultHashMapGenerator(msoIssuerConfiguration);
    this.#msoIssuerConfiguration = msoIssuerConfiguration;
    this.#msoPayloadGenerator =
      options.msoPayloadGenerator ?? defaultMsoPayloadGenerator;
    this.#protectHeaderGenerator =
      options.protectHeaderGenerator ?? defaultProtectHeaderGenerator;
    this.#unprotectHeaderGenerator =
      options.unprotectHeaderGenerator ?? defaultUnprotectHeaderGenerator;
  }

  async issue(data: RawNameSpaces, validFrom?: Date): Promise<Sign1> {
    const hashMap = await this.#hashMapGenerator(data);
    const payload = await this.#msoPayloadGenerator(
      hashMap,
      this.#msoIssuerConfiguration.EXPIRATION_DELTA_HOURS,
      validFrom
    );

    const { privateKey: coseKey } = await this.#keyManager.getCoseKeyPair();
    const { privateKey: cryptoKey } = await this.#keyManager.getCryptoKeyPair();

    return await Sign1.sign(
      this.#protectHeaderGenerator.generate(coseKey),
      await this.#unprotectHeaderGenerator.generate(this.#x509Generator),
      encode(payload),
      cryptoKey
    );
  }
}
