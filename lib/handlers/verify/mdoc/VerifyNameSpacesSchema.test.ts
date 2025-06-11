import { Sign1 } from '@auth0/cose';
import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ByteString, encode } from '../../../cbor';
import { DeviceResponse } from '../../../schemas/mdoc';
import { createVerifyNameSpacesSchema } from './VerifyNameSpacesSchema';

describe('createVerifyNameSpacesSchema', () => {
  const sign1 = new Sign1(
    new Map(),
    new Map(),
    encode(new ByteString(new TypedMap([]))),
    // @ts-ignore
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
          nameSpaces: new ByteString(new TypedMap()),
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

  const mockSchemas = {
    'org.iso.18013.5.1': z.object({
      'test-element': z.string(),
    }),
  };

  it('should verify valid name spaces', async () => {
    const verifier = createVerifyNameSpacesSchema({
      schemas: mockSchemas,
    });

    const result = await verifier(mockDeviceResponse);

    expect(result).toEqual([
      {
        'org.iso.18013.5.1.mDL': {
          'org.iso.18013.5.1': {
            'test-element': 'test-value',
          },
        },
      },
    ]);
  });

  it('should throw error when no documents found', async () => {
    const verifier = createVerifyNameSpacesSchema({
      schemas: mockSchemas,
    });

    const invalidResponse = {
      ...mockDeviceResponse,
      documents: undefined,
    };

    await expect(verifier(invalidResponse)).rejects.toThrow(
      'No documents found'
    );
  });

  it('should skip namespace without schema', async () => {
    const verifier = createVerifyNameSpacesSchema({
      schemas: mockSchemas,
    });

    const responseWithUnknownNamespace = {
      ...mockDeviceResponse,
      documents: [
        {
          // @ts-ignore
          ...mockDeviceResponse.documents[0],
          issuerSigned: {
            // @ts-ignore
            ...mockDeviceResponse.documents[0].issuerSigned,
            nameSpaces: {
              'unknown.namespace': [
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
          },
        },
      ],
    };

    // @ts-ignore
    const result = await verifier(responseWithUnknownNamespace);

    expect(result).toEqual([
      {
        'org.iso.18013.5.1.mDL': {
          'unknown.namespace': {
            'test-element': 'test-value',
          },
        },
      },
    ]);
  });

  it('should throw error when schema validation fails', async () => {
    const verifier = createVerifyNameSpacesSchema({
      schemas: mockSchemas,
    });

    const responseWithInvalidValue = {
      ...mockDeviceResponse,
      documents: [
        {
          // @ts-ignore
          ...mockDeviceResponse.documents[0],
          issuerSigned: {
            // @ts-ignore
            ...mockDeviceResponse.documents[0].issuerSigned,
            nameSpaces: {
              'org.iso.18013.5.1': [
                {
                  data: {
                    digestID: 0,
                    elementIdentifier: 'test-element',
                    elementValue: 123, // Should be string
                  },
                },
              ],
            },
          },
        },
      ],
    };

    // @ts-ignore
    await expect(verifier(responseWithInvalidValue)).rejects.toThrow();
  });
});
