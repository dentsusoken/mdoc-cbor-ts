export interface X509Configuration {
  X509_COUNTRY_NAME: string;
  X509_STATE_OR_PROVINCE_NAME: string;
  X509_LOCALITY_NAME: string;
  X509_ORGANIZATION_NAME: string;
  X509_COMMON_NAME: string;
  X509_NOT_VALID_BEFORE: Date;
  X509_NOT_VALID_AFTER: Date;
  X509_SAN_URL: string;
}
