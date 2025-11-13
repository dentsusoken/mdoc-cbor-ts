import * as jose from 'jose';
import {
  MDoc,
  Document,
  Verifier,
  parse,
  DeviceResponse,
  DeviceSignedDocument,
} from '@auth0/mdl';
import {
  DEVICE_JWK,
  ISSUER_CERTIFICATE,
  ISSUER_PRIVATE_KEY_JWK,
  PRESENTATION_DEFINITION_1,
} from '@/__tests__/config';
import { calculateOid4vpSessionTranscriptBytes } from '@/mdoc/calculateOid4vpSessionTranscriptBytes';
import { encodeDeviceAuthentication } from '@/mdoc/encodeDeviceAuthentication';
import { nameSpacesRecordToMap } from '@/mdoc/nameSpacesRecordToMap';
import { decodeTag24 } from '@/cbor/decodeTag24';
import { SessionTranscript } from '@/mdoc/types';
import { createTag24 } from '@/cbor/createTag24';
import { Sign1 } from '@/cose/Sign1';

const { ...publicKeyJWK } = DEVICE_JWK as jose.JWK;

describe('issuing a device response', () => {
  let encoded: Uint8Array;
  let parsedDocument: DeviceSignedDocument;
  let mdoc: MDoc;

  const signed = new Date('2023-10-24T14:55:18Z');
  const validUntil = new Date(signed);
  validUntil.setFullYear(signed.getFullYear() + 30);

  beforeAll(async () => {
    const issuerPrivateKey = ISSUER_PRIVATE_KEY_JWK;

    // this is the ISSUER side
    {
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
        .addDeviceKeyInfo({ deviceKey: publicKeyJWK })
        .sign({
          issuerPrivateKey,
          issuerCertificate: ISSUER_CERTIFICATE,
          alg: 'ES256',
        });

      mdoc = new MDoc([document]);
    }
  });

  describe('using OID4VP handover', () => {
    const verifierNonce = 'abcdefg';
    const mdocNonce = '123456';
    const clientId = 'Cq1anPb8vZU5j5C0d7hcsbuJLBpIawUJIDQRi2Ebwb4';
    const responseUri =
      'http://localhost:4000/api/presentation_request/dc8999df-d6ea-4c84-9985-37a8b81a82ec/callback';
    const sessionTranscriptBytes = calculateOid4vpSessionTranscriptBytes({
      mdocNonce,
      clientId,
      responseUri,
      verifierNonce,
    });
    const sessionTranscript = decodeTag24<SessionTranscript>(
      sessionTranscriptBytes
    );
    const nameSpaces = nameSpacesRecordToMap({
      'com.foobar-device': { test: 1234 },
    });
    const nameSpacesBytes = createTag24(nameSpaces);
    const detachedPayload = encodeDeviceAuthentication({
      sessionTranscript,
      docType: 'org.iso.18013.5.1.mDL',
      nameSpacesBytes,
    });

    beforeAll(async () => {
      //  This is the Device side
      const devicePrivateKey = DEVICE_JWK;
      const deviceResponseMDoc = await DeviceResponse.from(mdoc)
        .usingPresentationDefinition(PRESENTATION_DEFINITION_1)
        .usingSessionTranscriptForOID4VP(
          mdocNonce,
          clientId,
          responseUri,
          verifierNonce
        )
        .authenticateWithSignature(devicePrivateKey, 'ES256')
        .addDeviceNameSpace('com.foobar-device', { test: 1234 })
        .sign();

      encoded = deviceResponseMDoc.encode();
      const parsedMDOC = parse(encoded);
      [parsedDocument] = parsedMDOC.documents as DeviceSignedDocument[];
    });

    it('should be verifiable', async () => {
      const verifier = new Verifier([ISSUER_CERTIFICATE]);
      await verifier.verify(encoded, {
        encodedSessionTranscript: sessionTranscriptBytes,
      });
    });

    it('should generate the signature without payload', () => {
      expect(
        parsedDocument.deviceSigned.deviceAuth.deviceSignature?.payload
      ).toBeNull();
    });

    it('should verify the signature with the detached payload', async () => {
      //const verifier = new Verifier([ISSUER_CERTIFICATE]);
      const deviceSignature =
        parsedDocument.deviceSigned.deviceAuth.deviceSignature!;
      expect(deviceSignature).toBeDefined();
      expect(deviceSignature?.payload).toBeNull();
      const publicKey = await jose.importJWK(DEVICE_JWK, 'ES256');
      // @ts-expect-error - verify method is not typed
      deviceSignature.verify(publicKey, { detachedPayload });
    });

    it('should verify auth0-generated signature using Sign1 class', async () => {
      const deviceSignature =
        parsedDocument.deviceSigned.deviceAuth.deviceSignature!;
      expect(deviceSignature).toBeDefined();
      const [protectedHeaders, unprotectedHeaders, payload, signature] =
        deviceSignature.getContentForEncoding();

      const sign1 = new Sign1(
        protectedHeaders as Uint8Array,
        unprotectedHeaders as Map<number, unknown>,
        payload as Uint8Array | null,
        signature as Uint8Array
      );

      sign1.verify(DEVICE_JWK, { detachedPayload });
    });
  });
});
