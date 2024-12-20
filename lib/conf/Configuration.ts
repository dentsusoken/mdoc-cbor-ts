import { MsoConfiguration } from './MsoConfiguration';
import { X509Configuration } from './X509Configuration';

export interface Configuration extends MsoConfiguration, X509Configuration {}
