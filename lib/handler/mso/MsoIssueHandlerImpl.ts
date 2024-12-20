import { Sign1 } from '@auth0/cose';
import { MsoIssueHandler } from './MsoIssueHandler';
import { KeyManager } from '../../middleware/keys';
import { X509Generator } from '../../middleware/x509';
import { NameSpace } from '../../schemas';
import { defaultHashMapGenerator, HashMapGenerator } from './HashMapGenerator';
import { MsoConfiguration } from '../../conf/MsoConfiguration';
import {
  defaultMsoPayloadGenerator,
  MsoPayloadGenerator,
  defaultProtectHeaderGenerator,
  ProtectHeaderGenerator,
  defaultUnprotectHeaderGenerator,
  UnprotectHeaderGenerator,
} from '.';
import { encode } from 'cbor';

export interface MsoIssuerConstructorOpt {
  hashMapGenerator?: HashMapGenerator;
  msoPayloadGenerator?: MsoPayloadGenerator;
  protectHeaderGenerator?: ProtectHeaderGenerator;
  unprotectHeaderGenerator?: UnprotectHeaderGenerator;
}

export class MsoIssueHandlerImpl implements MsoIssueHandler {
  #keyManager: KeyManager;
  #x509Generator: X509Generator;
  #hashMapGenerator: HashMapGenerator;
  #msoConfiguration: MsoConfiguration;
  #msoPayloadGenerator: MsoPayloadGenerator;
  #protectHeaderGenerator: ProtectHeaderGenerator;
  #unprotectHeaderGenerator: UnprotectHeaderGenerator;

  constructor(
    keyManager: KeyManager,
    x509Generator: X509Generator,
    msoConfiguration: MsoConfiguration,
    options: MsoIssuerConstructorOpt = {}
  ) {
    this.#keyManager = keyManager;
    this.#x509Generator = x509Generator;
    this.#hashMapGenerator =
      options.hashMapGenerator ?? defaultHashMapGenerator;
    this.#msoConfiguration = msoConfiguration;
    this.#msoPayloadGenerator =
      options.msoPayloadGenerator ?? defaultMsoPayloadGenerator;
    this.#protectHeaderGenerator =
      options.protectHeaderGenerator ?? defaultProtectHeaderGenerator;
    this.#unprotectHeaderGenerator =
      options.unprotectHeaderGenerator ?? defaultUnprotectHeaderGenerator;
  }

  async issue(data: NameSpace, validFrom?: Date): Promise<Buffer> {
    const hashMap = await this.#hashMapGenerator(data);
    const payload = await this.#msoPayloadGenerator(
      hashMap,
      this.#msoConfiguration.EXPIRATION_DELTA_HOURS,
      validFrom
    );

    const { privateKey: coseKey } = await this.#keyManager.getCoseKeyPair();
    const { privateKey: cryptoKey } = await this.#keyManager.getCryptoKeyPair();

    const sign1 = await Sign1.sign(
      this.#protectHeaderGenerator.generate(coseKey),
      await this.#unprotectHeaderGenerator.generate(this.#x509Generator),
      encode(payload),
      cryptoKey
    );

    return sign1.encode();
  }
}
