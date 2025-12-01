import * as jose from 'jose';
import { MDoc, Document, DeviceResponse } from '@auth0/mdl';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
  PRESENTATION_DEFINITION_1,
} from '@/__tests__/config';
import { calculateOid4vpSessionTranscriptBytes } from './calculateAuth0Oid4vpSessionTranscriptBytes';

const { ...publicKeyJWK } = DEVICE_JWK as jose.JWK;

describe('calculateAuth0Oid4vpSessionTranscriptBytes', () => {
  let mdoc: MDoc;

  const signed = new Date('2023-10-24T14:55:18Z');
  const validUntil = new Date(signed);
  validUntil.setFullYear(signed.getFullYear() + 30);

  beforeAll(async () => {
    const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

    const document = await new Document('org.iso.18013.5.1.mDL')
      .addIssuerNameSpace('org.iso.18013.5.1', {
        family_name: 'Jones',
        given_name: 'Ava',
        birth_date: '2007-03-25',
        issue_date: '2023-09-01',
        expiry_date: '2028-09-30',
        issuing_country: 'US',
        issuing_authority: 'NY DMV',
        document_number: '01-856-5050',
        portrait: 'bstr',
        driving_privileges: [
          {
            vehicle_category_code: 'C',
            issue_date: '2022-09-02',
            expiry_date: '2027-09-20',
          },
        ],
        un_distinguishing_sign: 'tbd-us.ny.dmv',
      })
      .useDigestAlgorithm('SHA-512')
      .addValidityInfo({
        signed,
        validUntil,
      })
      .addDeviceKeyInfo({ deviceKey: publicKeyJWK })
      .sign({
        issuerPrivateKey,
        issuerCertificate: ISSUER_CERTIFICATE,
        alg: 'ES256',
      });

    mdoc = new MDoc([document]);
  });

  it('should generate the same sessionTranscriptBytes as DeviceResponse.usingSessionTranscriptForOID4VP', async () => {
    const verifierNonce = 'abcdefg';
    const mdocNonce = '123456';
    const clientId = 'Cq1anPb8vZU5j5C0d7hcsbuJLBpIawUJIDQRi2Ebwb4';
    const responseUri =
      'http://localhost:4000/api/presentation_request/dc8999df-d6ea-4c84-9985-37a8b81a82ec/callback';

    // Calculate using our function
    const calculatedBytes = calculateOid4vpSessionTranscriptBytes({
      mdocNonce,
      clientId,
      responseUri,
      verifierNonce,
    });

    // Get from DeviceResponse
    const devicePrivateKey = DEVICE_JWK;
    const deviceResponse = await DeviceResponse.from(mdoc)
      .usingPresentationDefinition(PRESENTATION_DEFINITION_1)
      .usingSessionTranscriptForOID4VP(
        mdocNonce,
        clientId,
        responseUri,
        verifierNonce
      )
      .authenticateWithSignature(devicePrivateKey, 'ES256');

    const actualBytes = (
      deviceResponse as unknown as { sessionTranscriptBytes: Uint8Array }
    ).sessionTranscriptBytes;

    // Compare
    expect(Buffer.from(calculatedBytes).toString('hex')).toBe(
      Buffer.from(actualBytes).toString('hex')
    );
    expect(calculatedBytes).toEqual(new Uint8Array(actualBytes));
  });

  it('should generate different bytes when parameters change', () => {
    const params1 = {
      mdocNonce: '123456',
      clientId: 'client1',
      responseUri: 'http://example.com/callback',
      verifierNonce: 'nonce1',
    };

    const params2 = {
      ...params1,
      mdocNonce: 'different',
    };

    const bytes1 = calculateOid4vpSessionTranscriptBytes(params1);
    const bytes2 = calculateOid4vpSessionTranscriptBytes(params2);

    expect(Buffer.from(bytes1).toString('hex')).not.toBe(
      Buffer.from(bytes2).toString('hex')
    );
  });
});
