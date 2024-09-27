import { EnvLoader } from './EnvLoader';

/**
 * Mapping of COSE key curves to their respective identifiers.
 * These curves are used in cryptographic operations and are considered "hazmat" (hazardous materials)
 * because they should be handled with care due to the security implications of their misuse.
 *
 * @property {string} secp256r1 - Identifier for the secp256r1 curve.
 * @property {string} secp384r1 - Identifier for the secp384r1 curve.
 * @property {string} secp521r1 - Identifier for the secp521r1 curve.
 */
export const COSEKEY_HAZMAT_CRV_MAP = {
  secp256r1: 'P_256',
  secp384r1: 'P_384',
  secp521r1: 'P_521',
};

/**
 * Mapping of COSE key curves to their respective lengths.
 *
 * @property {number} secp256r1 - Length of the secp256r1 curve.
 * @property {number} secp384r1 - Length of the secp384r1 curve.
 * @property {number} secp521r1 - Length of the secp521r1 curve.
 */
export const CRV_LEN_MAP = {
  secp256r1: 32,
  secp384r1: 48,
  secp521r1: 66,
};

/**
 * Hash algorithm
 * This is loaded from the environment variable 'TSMDOC_HASHALG'.
 * If the environment variable is not set, it defaults to 'SHA-256'.
 */
export const TSMDOC_HASHALG = () =>
  EnvLoader.getEnv('TSMDOC_HASHALG', 'SHA-256');

/**
 * Expiration delta hours
 * This is loaded from the environment variable 'TSMDOC_EXP_DELTA_HOURS'.
 * If the environment variable is not set, it defaults to 0.
 */
export const TSMDOC_EXP_DELTA_HOURS = () =>
  Number(EnvLoader.getEnv('TSMDOC_EXP_DELTA_HOURS', 0));

/**
 * Mapping of hash algorithms to their respective identifiers.
 *
 * @property {string} SHA-256 - Identifier for the SHA-256 algorithm.
 * @property {string} SHA-512 - Identifier for the SHA-512 algorithm.
 */
export const HASHALG_MAP: Record<string, string> = {
  'SHA-256': 'sha256',
  'SHA-512': 'sha512',
};

/**
 * salt length
 */
export const DIGEST_SALT_LENGTH = 32;

/**
 * The X.509 certificate in DER format.
 * This is loaded from the environment variable 'X509_DER_CERT'.
 * If the environment variable is not set, it defaults to 'undefined'.
 */
export const X509_DER_CERT = () => EnvLoader.getEnv('X509_DER_CERT', undefined);

// OR

/**
 * Country name field of the X.509 certificate.
 * This is loaded from the environment variable 'X509_COUNTRY_NAME'.
 * If the environment variable is not set, it defaults to 'US'.
 */
export const X509_COUNTRY_NAME = () =>
  EnvLoader.getEnv('X509_COUNTRY_NAME', 'US');

/**
 * State or provice name field of the X.509 certificate.
 * This is loaded from the environment variable 'X509_STATE_OR_PROVINCE_NAME'.
 * If the environment variable is not set, it defaults to 'California'.
 */
export const X509_STATE_OR_PROVINCE_NAME = () =>
  EnvLoader.getEnv('X509_STATE_OR_PROVINCE_NAME', 'California');

/**
 * Locality name field of the X.509 certificate.
 * This is loaded from the environment variable 'X509_LOCALITY_NAME'.
 * If the environment variable is not set, it defaults to 'San Francisco'.
 */
export const X509_LOCALITY_NAME = () =>
  EnvLoader.getEnv('X509_LOCALITY_NAME', 'San Francisco');

/**
 * Organization name field of the X.509 certificate.
 * This is loaded from the environment variable 'X509_ORGANIZATION_NAME'.
 * If the environment variable is not set, it defaults to 'My Company'.
 */
export const X509_ORGANIZATION_NAME = () =>
  EnvLoader.getEnv('X509_ORGANIZATION_NAME', 'My Company');

/**
 * Common name field of the X.509 certificate.
 * This is loaded from the environment variable 'X509_COMMON_NAME'.
 * If the environment variable is not set, it defaults to 'mysite.com'.
 */
export const X509_COMMON_NAME = () =>
  EnvLoader.getEnv('X509_COMMON_NAME', 'mysite.com');

/**
 * Not valid before field of the X.509 certificate.
 * This is loaded from the environment variable 'X509_NOT_VALID_BEFORE'.
 * If the environment variable is not set, it defaults to current time.
 */
export const X509_NOT_VALID_BEFORE = () =>
  new Date(EnvLoader.getEnv('X509_NOT_VALID_BEFORE', Date.now()));

/**
 * Days until the X.509 certificate expires.
 * This is loaded from the environment variable 'X509_NOT_VALID_AFTER_DAYS'.
 * If the environment variable is not set, it defaults to 10 days.
 */
export const X509_NOT_VALID_AFTER_DAYS = () =>
  Number(EnvLoader.getEnv('X509_NOT_VALID_AFTER_DAYS', 10));

/**
 * Not valid after field of the X.509 certificate.
 * This is loaded from the environment variable 'X509_NOT_VALID_AFTER'.
 * If the environment variable is not set, it defaults to current time + 10 days.
 */
export const X509_NOT_VALID_AFTER = () =>
  new Date(
    EnvLoader.getEnv(
      'X509_NOT_VALID_AFTER',
      Date.now() + X509_NOT_VALID_AFTER_DAYS() * 24 * 60 * 60 * 1000
    )
  );

/**
 * Subject alternative name field of the X.509 certificate.
 * This is loaded from the environment variable 'X509_SAN_URL'.
 * If the environment variable is not set, it defaults to 'https://credential-issuer.oidc-federation.online'.
 */
export const X509_SAN_URL = () =>
  EnvLoader.getEnv(
    'X509_SAN_URL',
    'https://credential-issuer.oidc-federation.online'
  );

/**
 * Mapping of attribute names to their respective CBOR tag numbers.
 * CBOR (Concise Binary Object Representation) is a binary data serialization format.
 * The tag numbers are used to identify the data that follows in CBOR data items.
 *
 * @property {number} birth_date - CBOR tag number for the 'birth_date' attribute.
 * @property {number} expiry_date - CBOR tag number for the 'expiry_date' attribute.
 * @property {number} issue_date - CBOR tag number for the 'issue_date' attribute.
 */
export const CBORTAGS_ATTR_MAP: Record<string, number> = {
  birth_date: 1004,
  expiry_date: 1004,
  issue_date: 1004,
};
