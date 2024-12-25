import { Algorithms, COSEKey } from '@auth0/cose';
import { Configuration } from '../conf';
import { MdocIssueHandlerImpl } from '../handler/mdoc-issue/MdocIssueHandlerImpl';
import { MsoIssueHandlerImpl } from '../handler/mso-issue';
import { KeyConverterImpl, KeyManagerImpl } from '../middleware/keys';
import { X509GeneratorImpl } from '../middleware/x509';
import { cborSchema } from '../schemas/common/cborSchema';
import { encodedMdocSchema } from '../schemas/mdocSchema';

const data = {
  'org.iso.18013.5.1': {
    expiry_date: '2024-02-22',
    issue_date: '2023-11-14',
    issuing_country: 'IT',
    issuing_authority: 'Gli amici della Salaria',
    family_name: 'Rossi',
    given_name: 'Mario',
    birth_date: '1956-01-12',
  },
};

describe('issue', async () => {
  const config: Configuration = {
    // CBOR Tag Map
    birth_date: 1004,
    expiry_date: 1004,
    issue_date: 1004,
    // Crypto
    HASH_ALGORITHM: 'SHA-256' as const,
    NAMED_CURVE: 'P-256',
    KEY_ALGORITHM: 'ES256',
    SALT_LENGTH: 16,
    // X509
    X509_COUNTRY_NAME: 'JP',
    X509_STATE_OR_PROVINCE_NAME: 'Tokyo',
    X509_LOCALITY_NAME: 'Shinjuku',
    X509_ORGANIZATION_NAME: 'Test',
    X509_COMMON_NAME: 'Test',
    X509_NOT_VALID_AFTER: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    X509_NOT_VALID_BEFORE: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365),
    X509_SAN_URL: 'https://example.com',
    // MSO
    EXPIRATION_DELTA_HOURS: 24,
  };
  const { privateKey } = await COSEKey.generate(Algorithms.ES256, {
    crv: config.NAMED_CURVE,
  });
  const keyConverter = new KeyConverterImpl(config);
  const keyManager = new KeyManagerImpl(privateKey, keyConverter);
  const x509Generator = new X509GeneratorImpl(keyManager, config);
  const msoIssuerHandler = new MsoIssueHandlerImpl(
    keyManager,
    x509Generator,
    config
  );
  const mdocIssuerHandler = new MdocIssueHandlerImpl(msoIssuerHandler, config);
  it('should be able to issue', async () => {
    const result = await mdocIssuerHandler.issue(
      data,
      'org.iso.18013.5.1',
      'base64url'
    );
    console.log('result :>> ', result);
    expect(result).toBeDefined();
    const cbor = cborSchema.parse(result);
    const parsed = encodedMdocSchema.parse(cbor);
    expect(parsed).toBeDefined();
  });
});
