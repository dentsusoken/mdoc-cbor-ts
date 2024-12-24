import { MsoConfiguration } from './MsoConfiguration';
import { X509Configuration } from './X509Configuration';
import { CryptoConfig } from './CryptoConfig';
import { CborTagMap } from './CborTagMap';

export interface Configuration
  extends MsoConfiguration,
    X509Configuration,
    CryptoConfig,
    CborTagMap {}
