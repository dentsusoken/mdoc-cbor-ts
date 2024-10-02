import { Crypto } from '@peculiar/webcrypto';
import * as pkijs from 'pkijs';

/**
 * Crypto engine with WebCrypto API.
 * @type {pkijs.CryptoEngine}
 */
export const cryptoEngine = new pkijs.CryptoEngine({ crypto: new Crypto() });
/**
 * Crypto API.
 * @type {Crypto}
 */
export const crypto = cryptoEngine.crypto;
