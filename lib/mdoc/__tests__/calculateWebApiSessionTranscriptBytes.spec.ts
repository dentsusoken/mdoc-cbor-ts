import { randomFillSync } from 'node:crypto';
import * as jose from 'jose';
import { COSEKeyFromJWK } from 'cose-kit';
import { MDoc, Document, DeviceResponse, Verifier } from '@auth0/mdl';
import {
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
  PRESENTATION_DEFINITION_1,
} from '@/__tests__/config';
import { calculateWebApiSessionTranscriptBytes } from '../calculateWebApiSessionTranscriptBytes';

describe('calculateWebApiSessionTranscriptBytes', () => {
  let mdoc: MDoc;
  let devicePrivateKey: jose.JWK;
  let devicePublicJwk: jose.JWK;
  let readerPrivateKey: Uint8Array;
  let readerPublicKey: Uint8Array;

  const signed = new Date('2023-10-24T14:55:18Z');
  const validUntil = new Date(signed);
  validUntil.setFullYear(signed.getFullYear() + 30);

  beforeAll(async () => {
    // Device setup
    {
      const keypair = await jose.generateKeyPair('ECDH-ES', { crv: 'P-256' });
      devicePrivateKey = await jose.exportJWK(keypair.privateKey);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { d, ...pk } = devicePrivateKey;
      devicePublicJwk = pk;
    }

    // Issuer side
    {
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
              issue_date: '2022-09-01',
              expiry_date: '2027-09-30',
            },
          ],
          un_distinguishing_sign: 'tbd-us.ny.dmv',
          sex: 'F',
          height: '5\' 8"',
          weight: '120lb',
          eye_colour: 'brown',
          hair_colour: 'brown',
          resident_addres: '123 Street Rd',
          resident_city: 'Brooklyn',
          resident_state: 'NY',
          resident_postal_code: '19001',
          resident_country: 'US',
          issuing_jurisdiction: 'New York',
        })
        .useDigestAlgorithm('SHA-512')
        .addValidityInfo({
          signed,
          validUntil,
        })
        .addDeviceKeyInfo({ deviceKey: devicePublicJwk })
        .sign({
          issuerPrivateKey,
          issuerCertificate: ISSUER_CERTIFICATE,
          alg: 'ES256',
        });

      mdoc = new MDoc([document]);
    }

    // Verifier side (reader)
    {
      const readerKeypair = await jose.generateKeyPair('ECDH-ES', {
        crv: 'P-256',
      });
      const readerKey = await jose.exportJWK(readerKeypair.privateKey);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { d, ...pubKey } = readerKey;
      readerPrivateKey = COSEKeyFromJWK(readerKey);
      readerPublicKey = COSEKeyFromJWK(pubKey);
    }
  });

  it('should generate the same sessionTranscriptBytes as manual construction', async () => {
    // The actual value for the engagements & the key do not matter,
    // as long as the device and the reader agree on what value to use.
    const eReaderKeyBytes: Buffer = randomFillSync(Buffer.alloc(32));
    const readerEngagementBytes = randomFillSync(Buffer.alloc(32));
    const deviceEngagementBytes = randomFillSync(Buffer.alloc(32));

    // Calculate using our function
    const calculatedBytes = calculateWebApiSessionTranscriptBytes({
      deviceEngagementCbor: deviceEngagementBytes,
      readerEngagementCbor: readerEngagementBytes,
      eReaderKeyCbor: eReaderKeyBytes,
    });

    // Create device response using the calculated bytes
    const deviceResponse = await DeviceResponse.from(mdoc)
      .usingPresentationDefinition(PRESENTATION_DEFINITION_1)
      .usingSessionTranscriptBytes(Buffer.from(calculatedBytes))
      .authenticateWithMAC(devicePrivateKey, readerPublicKey, 'HS256')
      .sign();

    const encoded = deviceResponse.encode();

    // Verify using the same session transcript
    const verifier = new Verifier([ISSUER_CERTIFICATE]);
    await expect(
      verifier.verify(encoded, {
        ephemeralReaderKey: readerPrivateKey,
        encodedSessionTranscript: Buffer.from(calculatedBytes),
      })
    ).resolves.not.toThrow();
  });

  it('should generate different bytes when parameters change', () => {
    const deviceEngagement1 = randomFillSync(Buffer.alloc(32));
    const deviceEngagement2 = randomFillSync(Buffer.alloc(32));
    const readerEngagement = randomFillSync(Buffer.alloc(32));
    const eReaderKey = randomFillSync(Buffer.alloc(32));

    const bytes1 = calculateWebApiSessionTranscriptBytes({
      deviceEngagementCbor: deviceEngagement1,
      readerEngagementCbor: readerEngagement,
      eReaderKeyCbor: eReaderKey,
    });

    const bytes2 = calculateWebApiSessionTranscriptBytes({
      deviceEngagementCbor: deviceEngagement2,
      readerEngagementCbor: readerEngagement,
      eReaderKeyCbor: eReaderKey,
    });

    expect(Buffer.from(bytes1).toString('hex')).not.toBe(
      Buffer.from(bytes2).toString('hex')
    );
  });

  it('should fail verification with different session transcript', async () => {
    const eReaderKeyBytes: Buffer = randomFillSync(Buffer.alloc(32));
    const readerEngagementBytes = randomFillSync(Buffer.alloc(32));
    const deviceEngagementBytes = randomFillSync(Buffer.alloc(32));

    // Create device response with one session transcript
    const sessionTranscript1 = calculateWebApiSessionTranscriptBytes({
      deviceEngagementCbor: deviceEngagementBytes,
      readerEngagementCbor: readerEngagementBytes,
      eReaderKeyCbor: eReaderKeyBytes,
    });

    const deviceResponse = await DeviceResponse.from(mdoc)
      .usingPresentationDefinition(PRESENTATION_DEFINITION_1)
      .usingSessionTranscriptBytes(Buffer.from(sessionTranscript1))
      .authenticateWithMAC(devicePrivateKey, readerPublicKey, 'HS256')
      .sign();

    const encoded = deviceResponse.encode();

    // Try to verify with different device engagement
    const differentDeviceEngagement = randomFillSync(Buffer.alloc(32));
    const sessionTranscript2 = calculateWebApiSessionTranscriptBytes({
      deviceEngagementCbor: differentDeviceEngagement,
      readerEngagementCbor: readerEngagementBytes,
      eReaderKeyCbor: eReaderKeyBytes,
    });

    const verifier = new Verifier([ISSUER_CERTIFICATE]);
    await expect(
      verifier.verify(encoded, {
        ephemeralReaderKey: readerPrivateKey,
        encodedSessionTranscript: Buffer.from(sessionTranscript2),
      })
    ).rejects.toThrow();
  });
});
