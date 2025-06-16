import { Sign1 } from '@auth0/cose';
import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it } from 'vitest';
import { ByteString, encode } from '../../../cbor';
import { DeviceResponse } from '../../../schemas/mdoc';
import { parseMdocString } from './ParseMdocString';

const vp =
  'o2d2ZXJzaW9uYzEuMGlkb2N1bWVudHOCo2dkb2NUeXBldW9yZy5pc28uMTgwMTMuNS4xLm1ETGxpc3N1ZXJTaWduZWSiam5hbWVTcGFjZXOhcW9yZy5pc28uMTgwMTMuNS4xgtgYWFukaGRpZ2VzdElEAWZyYW5kb21QowtJ1ZDcqQFGss1dTyUyu3FlbGVtZW50SWRlbnRpZmllcm9kb2N1bWVudF9udW1iZXJsZWxlbWVudFZhbHVlaDEyMzQ1Njc42BhYUqRoZGlnZXN0SUQCZnJhbmRvbVCTY-HD_ggQUFpbItymW67KcWVsZW1lbnRJZGVudGlmaWVyamdpdmVuX25hbWVsZWxlbWVudFZhbHVlZEluZ2FqaXNzdWVyQXV0aIRDoQEmoRghWQGyMIIBrjCCAVWgAwIBAgIUO4JGOFKhSzaYPysIXdnNmA3kjrswCgYIKoZIzj0EAwIwLTErMCkGA1UEAwwidHcyNC1vYXV0aC1zZXJ2ZXIuYW4uci5hcHBzcG90LmNvbTAeFw0yNDAzMjcwNzM2NDFaFw0zNDAzMjUwNzM2NDFaMC0xKzApBgNVBAMMInR3MjQtb2F1dGgtc2VydmVyLmFuLnIuYXBwc3BvdC5jb20wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAATKHMBkz8Dyo_Ch5_KzRVJP1W0hqg9StzjL3mRLVfQmX-wUMMY91qsuF3iXu-9g9h2ePUHMuVIbhVgtM-932iywo1MwUTAdBgNVHQ4EFgQUUYVneVlglmWCf588GqePoPTyFA4wHwYDVR0jBBgwFoAUUYVneVlglmWCf588GqePoPTyFA4wDwYDVR0TAQH_BAUwAwEB_zAKBggqhkjOPQQDAgNHADBEAiAyGPiRDxjQASnL-p-Ew18nFQAxiy9CQhqiduJ1DA5yFwIgSN-9boIrs1Y8luK_Ev8eFmQx5wPByP97jOJ3tY64DQxZAdnYGFkB1KZndmVyc2lvbmMxLjBvZGlnZXN0QWxnb3JpdGhtZ1NIQS0yNTZsdmFsdWVEaWdlc3RzoXFvcmcuaXNvLjE4MDEzLjUuMaIBWCCKAF-f8rQ2gKlB-SSF-t0FI-8yUavzdbUYvuhS8tCg0QJYIGQSaSXKAuR4ZKqyvkneH6rGcBH5GFbrhk3LJnseYePbbWRldmljZUtleUluZm-iaWRldmljZUtleaYBAgJYJDk0RjU2RjAzLUYzRDctNDIzMy1BREYzLUI0M0FBQkYyNTZGNwMmIAEhWCDpz5GipC9bBR97Nx_CeCDxSGXwMFGNXOuAc3NRpola-iJYIG_mKVS38znfdlSila8OjNL2Ehy4JZs0IzekpgD-Up9ncWtleUF1dGhvcml6YXRpb25zoWpuYW1lU3BhY2VzgXFvcmcuaXNvLjE4MDEzLjUuMWdkb2NUeXBldW9yZy5pc28uMTgwMTMuNS4xLm1ETGx2YWxpZGl0eUluZm-jZnNpZ25lZMB0MjAyNS0wMS0yM1QwMTozNDo1MFppdmFsaWRGcm9twHQyMDI1LTAxLTIzVDAxOjM0OjUwWmp2YWxpZFVudGlswHQyMDI2LTAxLTIzVDAxOjM0OjUwWlhAKoaHmVGYEDy5s-Fz8lhF_X9RUlhOpauZyf35Fj2XG4UfQW6IXjjt16L6jwV0fiMnACIBkdNRjbCdKqtWqAEW42xkZXZpY2VTaWduZWSiam5hbWVTcGFjZXPYGEGgamRldmljZUF1dGihb2RldmljZVNpZ25hdHVyZYRDoQEmoPZYQA5Ej5H9_m8eO3WqIBfBNa8Jc4H39RxumzJ4jCNyOUcnb9MWm-ReZ1mEV8Qk9nD_aHxY1eb76ueUj0LpmkyLchSjZ2RvY1R5cGV1b3JnLmlzby4xODAxMy41LjEubURMbGlzc3VlclNpZ25lZKJqbmFtZVNwYWNlc6Fxb3JnLmlzby4xODAxMy41LjGC2BhYUqRoZGlnZXN0SUQBZnJhbmRvbVBICCy73LGauoNr2yEorhxEcWVsZW1lbnRJZGVudGlmaWVyamdpdmVuX25hbWVsZWxlbWVudFZhbHVlZEluZ2HYGFhbpGhkaWdlc3RJRAJmcmFuZG9tUGEObmK_Xidbxmu_NsY-zZ9xZWxlbWVudElkZW50aWZpZXJvZG9jdW1lbnRfbnVtYmVybGVsZW1lbnRWYWx1ZWgxMjM0NTY3OGppc3N1ZXJBdXRohEOhASahGCFZAbIwggGuMIIBVaADAgECAhQ7gkY4UqFLNpg_Kwhd2c2YDeSOuzAKBggqhkjOPQQDAjAtMSswKQYDVQQDDCJ0dzI0LW9hdXRoLXNlcnZlci5hbi5yLmFwcHNwb3QuY29tMB4XDTI0MDMyNzA3MzY0MVoXDTM0MDMyNTA3MzY0MVowLTErMCkGA1UEAwwidHcyNC1vYXV0aC1zZXJ2ZXIuYW4uci5hcHBzcG90LmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABMocwGTPwPKj8KHn8rNFUk_VbSGqD1K3OMveZEtV9CZf7BQwxj3Wqy4XeJe772D2HZ49Qcy5UhuFWC0z73faLLCjUzBRMB0GA1UdDgQWBBRRhWd5WWCWZYJ_nzwap4-g9PIUDjAfBgNVHSMEGDAWgBRRhWd5WWCWZYJ_nzwap4-g9PIUDjAPBgNVHRMBAf8EBTADAQH_MAoGCCqGSM49BAMCA0cAMEQCIDIY-JEPGNABKcv6n4TDXycVADGLL0JCGqJ24nUMDnIXAiBI371ugiuzVjyW4r8S_x4WZDHnA8HI_3uM4ne1jrgNDFkB2dgYWQHUpmd2ZXJzaW9uYzEuMG9kaWdlc3RBbGdvcml0aG1nU0hBLTI1Nmx2YWx1ZURpZ2VzdHOhcW9yZy5pc28uMTgwMTMuNS4xogFYILojCWXUlx0fS7zNVpvJ9Jk7PwAseycA1Ob5gn_Nmr9RAlggSAvKhaKnD3gVk4ppet0kwsdec7YJERkyRY9lC8O-3wNtZGV2aWNlS2V5SW5mb6JpZGV2aWNlS2V5pgECAlgkRDQzQUVENTgtQjBCOS00RDcyLUE4NkYtRUI5MTc2ODlFQzI3AyYgASFYIO31izt-sZyu_uAfPK8VTmutyp2UStU-g8vl9ye0ET3uIlggDOQq1-DYGndmE3I5j1etFFL_aN7lL04pAmuxyO5k9Shxa2V5QXV0aG9yaXphdGlvbnOham5hbWVTcGFjZXOBcW9yZy5pc28uMTgwMTMuNS4xZ2RvY1R5cGV1b3JnLmlzby4xODAxMy41LjEubURMbHZhbGlkaXR5SW5mb6Nmc2lnbmVkwHQyMDI0LTEyLTA2VDAxOjAzOjQ2Wml2YWxpZEZyb23AdDIwMjQtMTItMDZUMDE6MDM6NDZaanZhbGlkVW50aWzAdDIwMjUtMTItMDZUMDE6MDM6NDZaWECl0Sk2BSw6xqaxdoX0OQ4OdKofNvVnnj22OSbfrJ1fY17qFMPfujDszOvGyJCuI4EDP7t8_Z6wcvo_3PY8JBHrbGRldmljZVNpZ25lZKJqbmFtZVNwYWNlc9gYQaBqZGV2aWNlQXV0aKFvZGV2aWNlU2lnbmF0dXJlhEOhASag9lhA_kxddESGdv4TyqHZhseMMeWKGjzNF2BQAgtn23yiBsnIGTLiJg6Ao5WeepRmgYM3IRSMpG7FW34SzJxTsks7xGZzdGF0dXMA';

describe('parseMdocString', () => {
  const sign1 = new Sign1(
    new Map(),
    new Map(),
    encode(new ByteString(new TypedMap([]))),
    Buffer.from('test-random')
  );
  const mockDeviceResponse: DeviceResponse = {
    version: '1.0',
    documents: [
      {
        docType: 'org.iso.18013.5.1.mDL',
        issuerSigned: {
          nameSpaces: {
            'org.iso.18013.5.1': [
              new ByteString(
                new TypedMap<[any, any]>(
                  Object.entries({
                    digestID: 0,
                    elementIdentifier: 'test-element',
                    elementValue: 'test-value',
                    random: Buffer.from('test-random'),
                  })
                )
              ),
            ],
          },
          // @ts-ignore
          issuerAuth: sign1.getContentForEncoding(),
        },
        deviceSigned: {
          nameSpaces: new ByteString(new TypedMap([])),
          // @ts-ignore
          deviceAuth: {
            // @ts-ignore
            deviceSignature: sign1.getContentForEncoding(),
          },
        },
      },
    ],
    status: 0,
  };

  it('should parse base64url encoded mdoc', () => {
    const mdoc = encode(mockDeviceResponse).toString('base64url');
    const parsed = parseMdocString(vp);

    console.log('parsed :>> ', parsed);

    expect(() => parseMdocString(vp)).not.toThrow();
  });

  it('should parse base64url encoded mdoc', () => {
    const mdoc = encode(mockDeviceResponse).toString('base64url');

    expect(() => parseMdocString(mdoc)).not.toThrow();
  });

  it('should parse base64 encoded mdoc', () => {
    const mdoc = encode(mockDeviceResponse).toString('base64');

    expect(() => parseMdocString(mdoc)).not.toThrow();
  });

  it('should parse hex encoded mdoc', () => {
    const mdoc = encode(mockDeviceResponse).toString('hex');

    expect(() => parseMdocString(mdoc)).not.toThrow();
  });

  it('should parse Uint8Array mdoc', () => {
    const mdocBuffer = encode(mockDeviceResponse);
    const mdoc = new Uint8Array(mdocBuffer);

    expect(() => parseMdocString(mdoc)).not.toThrow();
  });

  it('should parse Buffer mdoc', () => {
    const mdocBuffer = encode(mockDeviceResponse);

    expect(() => parseMdocString(mdocBuffer)).not.toThrow();
  });

  it('should throw error for invalid mdoc string', () => {
    const invalidMdoc = 'invalid-mdoc-string';
    expect(() => parseMdocString(invalidMdoc)).toThrow('Invalid mdoc string');
  });

  it('should throw error for invalid device response', () => {
    const invalidResponse = {
      invalid: 'response',
    };
    const mdoc = Buffer.from(JSON.stringify(invalidResponse)).toString(
      'base64url'
    );
    expect(() => parseMdocString(mdoc)).toThrow();
  });
});
