import { Sign1 } from '@auth0/cose';
import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it } from 'vitest';
import { ByteString, encode } from '../../../cbor';
import { DeviceResponse } from '../../../schemas/mdoc';
import { parseMdocString } from './ParseMdocString';

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
