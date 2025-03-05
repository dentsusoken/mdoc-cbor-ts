import { Algorithms, COSEKey, Sign1 } from '@auth0/cose';
import crypto from 'crypto';
import { describe, expect, it } from 'vitest';
import { X509Adapter } from '../../../adapters/X509Adapter';
import { ByteString, encode } from '../../../cbor';
import { Configuration } from '../../../conf/Configuration';
import { IssuerNameSpaces } from '../../../schemas/mdoc';
import { MSOIssueHandlerImpl } from './MSOIssueHandlerImpl';

describe('MSOIssueHandlerImpl', async () => {
  const config = new Configuration({
    digestAlgorithm: 'SHA-256',
    validFrom: 0,
    validUntil: 365 * 24 * 60 * 60 * 1000,
    expectedUpdate: 365 * 24 * 60 * 60 * 1000,
  });
  const x509Adapter = await X509Adapter.importJWKPrivateKey({
    kty: 'EC',
    crv: 'P-256',
    d: '2j24AjEPsTO8N9I6gN_WwRel_3c744Mp8P0jkIqIfuE',
    x: 'JUzffSI36_W_nxxY6_byP8swRe6kbIa5bBk4kjnfKlQ',
    y: 'Ok_X4cfR2I7C1BtfpVPz1H1d26FgrE_L3XlkHPJbfDE',
    alg: 'ES256',
    kid: '1234567890',
    use: 'sig',
    x5c: [
      'MIIBfDCCASGgAwIBAgIUEmmlElA5hRjuzPBe8u+gOO/EPVwwCgYIKoZIzj0EAwIwEzERMA8GA1UEAwwIVmVyaWZpZXIwHhcNMjQwODIxMDAzODE4WhcNMjQwOTIwMDAzODE4WjATMREwDwYDVQQDDAhWZXJpZmllcjBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABCVM330iN+v1v58cWOv28j/LMEXupGyGuWwZOJI53ypUOk/X4cfR2I7C1BtfpVPz1H1d26FgrE/L3XlkHPJbfDGjUzBRMB0GA1UdDgQWBBQpvC5mfQK3FJzua7Pk0d00lPQRhDAfBgNVHSMEGDAWgBQpvC5mfQK3FJzua7Pk0d00lPQRhDAPBgNVHRMBAf8EBTADAQH/MAoGCCqGSM49BAMCA0kAMEYCIQCB3AhuOALOaW+5zDgL1mn+U+zGw8WS2zoDZySoC8oCzgIhAKothleK1BWfmpv1Qzy4bQ5+dUj+p2RXjGj/A4zcP/E2',
    ],
  });

  describe('constructor', () => {
    it('should create a MSOIssueHandler instance with issue method', () => {
      const msoIssueHandler = new MSOIssueHandlerImpl(config, x509Adapter);
      expect(msoIssueHandler).toBeDefined();
      expect(msoIssueHandler.issue).toBeDefined();
    });
  });

  describe('issue', () => {
    it('should issue a certificate', async () => {
      const msoIssueHandler = new MSOIssueHandlerImpl(config, x509Adapter);
      const nameSpaces: IssuerNameSpaces = {
        'org.iso.18013.5.1': [
          new ByteString({
            random: Buffer.from(crypto.getRandomValues(new Uint8Array(16))),
            digestID: 38,
            elementValue: 'JAN',
            elementIdentifier: 'given_name',
          }),
        ],
      };
      const { publicKey } = await COSEKey.generate(Algorithms.ES256, {
        crv: 'P-256',
      });
      const issuerAuth = await msoIssueHandler.issue(
        'org.iso.18013.5.1.mDL',
        nameSpaces,
        publicKey
      );
      console.log(
        'issuerAuth :>> ',
        encode(issuerAuth.getContentForEncoding())
      );
      expect(issuerAuth).toBeInstanceOf(Sign1);
    });
  });
});
