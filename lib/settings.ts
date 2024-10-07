import { DateTime } from 'luxon';

/**
 * Settings class.
 * This class provides methods to get settings used in the application.
 * The settings are loaded from environment variables.
 * If an environment variable is not set, a default value is used.
 */
export class Settings {
  #env?: Record<string, string>;

  /**
   * Create a new Settings instance.
   * @param {Record<string, string>} env - The environment variables
   */
  constructor(env?: Record<string, string>) {
    this.#env = env;
  }

  private get(key: string, defaultValue: string): string {
    return this.#env?.[key] || defaultValue;
  }

  /**
   * Mapping of COSE key curves to their respective identifiers.
   * These curves are used in cryptographic operations and are considered "hazmat" (hazardous materials)
   * because they should be handled with care due to the security implications of their misuse.
   *
   * @property {string} secp256r1 - Identifier for the secp256r1 curve.
   * @property {string} secp384r1 - Identifier for the secp384r1 curve.
   * @property {string} secp521r1 - Identifier for the secp521r1 curve.
   */
  COSEKEY_HAZMAT_CRV_MAP = {
    secp256r1: 'P-256',
    secp384r1: 'P-384',
    secp521r1: 'P-521',
  };
  /**
   * Mapping of COSE key curves to their respective lengths.
   *
   * @property {number} secp256r1 - Length of the secp256r1 curve.
   * @property {number} secp384r1 - Length of the secp384r1 curve.
   * @property {number} secp521r1 - Length of the secp521r1 curve.
   */
  CRV_LEN_MAP = {
    secp256r1: 32,
    secp384r1: 48,
    secp521r1: 66,
  };
  /**
   * Hash algorithm
   * This is loaded from the environment variable 'TSMDOC_HASHALG'.
   * If the environment variable is not set, it defaults to 'SHA-256'.
   */
  TSMDOC_HASHALG = (): string => this.get('TSMDOC_HASHALG', 'SHA-256');
  /**
   * Expiration delta hours
   * This is loaded from the environment variable 'TSMDOC_EXP_DELTA_HOURS'.
   * If the environment variable is not set, it defaults to 0.
   */
  TSMDOC_EXP_DELTA_HOURS = (): number =>
    Number(this.get('TSMDOC_EXP_DELTA_HOURS', '0'));
  /**
   * Mapping of hash algorithms to their respective identifiers.
   *
   * @property {string} SHA-256 - Identifier for the SHA-256 algorithm.
   * @property {string} SHA-512 - Identifier for the SHA-512 algorithm.
   */
  HASHALG_MAP = {
    'SHA-256': 'sha256',
    'SHA-512': 'sha512',
  };
  /**
   * salt length
   */
  DIGEST_SALT_LENGTH = 32;
  /**
   * The X.509 certificate in DER format.
   * This is loaded from the environment variable 'X509_DER_CERT'.
   * If the environment variable is not set, it defaults to 'undefined'.
   */
  X509_DER_CERT = (): string => this.get('X509_DER_CERT', '');
  /**
   * Country name field of the X.509 certificate.
   * This is loaded from the environment variable 'X509_COUNTRY_NAME'.
   * If the environment variable is not set, it defaults to 'US'.
   */
  X509_COUNTRY_NAME = (): string => this.get('X509_COUNTRY_NAME', 'US');
  /**
   * State or provice name field of the X.509 certificate.
   * This is loaded from the environment variable 'X509_STATE_OR_PROVINCE_NAME'.
   * If the environment variable is not set, it defaults to 'California'.
   */
  X509_STATE_OR_PROVINCE_NAME = (): string =>
    this.get('X509_STATE_OR_PROVINCE_NAME', 'California');
  /**
   * Locality name field of the X.509 certificate.
   * This is loaded from the environment variable 'X509_LOCALITY_NAME'.
   * If the environment variable is not set, it defaults to 'San Francisco'.
   */
  X509_LOCALITY_NAME = (): string =>
    this.get('X509_LOCALITY_NAME', 'San Francisco');
  /**
   * Organization name field of the X.509 certificate.
   * This is loaded from the environment variable 'X509_ORGANIZATION_NAME'.
   * If the environment variable is not set, it defaults to 'My Company'.
   */
  X509_ORGANIZATION_NAME = (): string =>
    this.get('X509_ORGANIZATION_NAME', 'My Company');
  /**
   * Common name field of the X.509 certificate.
   * This is loaded from the environment variable 'X509_COMMON_NAME'.
   * If the environment variable is not set, it defaults to 'mysite.com'.
   */
  X509_COMMON_NAME = (): string => this.get('X509_COMMON_NAME', 'mysite.com');

  /**
   * Not valid before field of the X.509 certificate.
   * This is loaded from the environment variable 'X509_NOT_VALID_BEFORE'.
   * If the environment variable is not set, it defaults to current time.
   */
  X509_NOT_VALID_BEFORE = (): Date =>
    DateTime.fromFormat(
      // TODO - change default date to current date
      this.get('X509_NOT_VALID_BEFORE', `2024-10-03`),
      'yyyy-MM-dd'
    ).toJSDate();
  /**
   * Days until the X.509 certificate expires.
   * This is loaded from the environment variable 'X509_NOT_VALID_AFTER_DAYS'.
   * If the environment variable is not set, it defaults to 10 days.
   */
  X509_NOT_VALID_AFTER_DAYS = (): number =>
    Number(this.get('X509_NOT_VALID_AFTER_DAYS', '10'));
  /**
   * Not valid after field of the X.509 certificate.
   * This is loaded from the environment variable 'X509_NOT_VALID_AFTER'.
   * If the environment variable is not set, it defaults to current time + 10 days.
   */
  X509_NOT_VALID_AFTER = (): Date =>
    DateTime.fromFormat(
      this.get(
        'X509_NOT_VALID_AFTER',
        `${DateTime.now()
          .plus({ days: this.X509_NOT_VALID_AFTER_DAYS() })
          .toFormat('yyyy-MM-dd')}`
      ),
      'yyyy-MM-dd'
    ).toJSDate();
  /**
   * Subject alternative name field of the X.509 certificate.
   * This is loaded from the environment variable 'X509_SAN_URL'.
   * If the environment variable is not set, it defaults to 'https://credential-issuer.oidc-federation.online'.
   */
  X509_SAN_URL = (): string =>
    this.get(
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
  CBORTAGS_ATTR_MAP: Record<string, number> = {
    birth_date: 1004,
    expiry_date: 1004,
    issue_date: 1004,
  };
}
