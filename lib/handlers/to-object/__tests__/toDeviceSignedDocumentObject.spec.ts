import { describe, it, expect } from 'vitest';
import { toDeviceSignedDocumentObject } from '../toDeviceSignedDocumentObject';
import { createDocument } from '@/schemas/mdoc/Document';
import { createIssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import { createDeviceSigned } from '@/schemas/mdoc/DeviceSigned';
import { createDeviceAuth } from '@/schemas/mdoc/DeviceAuth';
import { createTag24 } from '@/cbor/createTag24';
import { createTag18 } from '@/cbor';
import { createSign1Schema } from '@/schemas/cose/Sign1';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';
import { MdocErrorCode } from '@/mdoc/types';
import { IssuerNameSpaces } from '@/schemas/mdoc/IssuerNameSpaces';
import { Tag } from 'cbor-x';

const issuerAuthSchema = createSign1Schema('IssuerAuth');

describe('toDeviceSignedDocumentObject', () => {
  it('should extract docType, issuerSigned, and deviceSigned from Document', () => {
    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpaces: IssuerNameSpaces = new Map([
      [
        'org.iso.18013.5.1',
        [
          createTag24(
            new Map<string, unknown>([
              ['digestID', 0],
              ['random', new Uint8Array(32)],
              ['elementIdentifier', 'given_name'],
              ['elementValue', 'John'],
            ])
          ) as Tag,
        ],
      ],
    ]);

    const issuerAuth = issuerAuthSchema.parse([
      new Uint8Array([0xa1, 0x01, 0x26]), // protected headers
      new Map<number, unknown>(), // unprotected headers
      new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]), // payload
      new Uint8Array(64), // signature
    ]);

    const issuerSigned = createIssuerSigned([
      ['nameSpaces', nameSpaces],
      ['issuerAuth', issuerAuth],
    ]);

    const deviceNameSpaces = new Map<string, unknown>([
      ['org.iso.18013.5.1', new Map([['given_name', 'John']])],
    ]);
    const deviceNameSpacesTag24 = createTag24(deviceNameSpaces);
    const deviceSignature = createTag18([
      new Uint8Array([0xa1, 0x01, 0x26]), // protected headers
      new Map<number, unknown>(), // unprotected headers
      new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]), // payload
      new Uint8Array(64), // signature
    ]);
    const deviceAuth = createDeviceAuth([['deviceSignature', deviceSignature]]);
    const deviceSigned = createDeviceSigned([
      ['nameSpaces', deviceNameSpacesTag24],
      ['deviceAuth', deviceAuth],
    ]);

    const document = createDocument([
      ['docType', docType],
      ['issuerSigned', issuerSigned],
      ['deviceSigned', deviceSigned],
    ]);

    const result = toDeviceSignedDocumentObject(document);

    expect(result.docType).toBe(docType);
    expect(result.issuerSigned).toBeInstanceOf(Map);
    expect(result.issuerSigned.get('nameSpaces')).toBe(nameSpaces);
    expect(result.issuerSigned.get('issuerAuth')).toBe(issuerAuth);
    expect(result.deviceSigned).toBeInstanceOf(Map);
    expect(result.deviceSigned.get('nameSpaces')).toBe(deviceNameSpacesTag24);
    expect(result.deviceSigned.get('deviceAuth')).toBe(deviceAuth);
  });

  it('should throw ErrorCodeError when docType is missing', () => {
    const nameSpaces: IssuerNameSpaces = new Map([
      [
        'org.iso.18013.5.1',
        [
          createTag24(
            new Map<string, unknown>([
              ['digestID', 0],
              ['random', new Uint8Array(32)],
              ['elementIdentifier', 'given_name'],
              ['elementValue', 'John'],
            ])
          ) as Tag,
        ],
      ],
    ]);

    const issuerAuth = issuerAuthSchema.parse([
      new Uint8Array([0xa1, 0x01, 0x26]),
      new Map<number, unknown>(),
      new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
      new Uint8Array(64),
    ]);

    const issuerSigned = createIssuerSigned([
      ['nameSpaces', nameSpaces],
      ['issuerAuth', issuerAuth],
    ]);

    const deviceNameSpaces = new Map<string, unknown>([
      ['org.iso.18013.5.1', new Map([['given_name', 'John']])],
    ]);
    const deviceNameSpacesTag24 = createTag24(deviceNameSpaces);
    const deviceSignature = createTag18([
      new Uint8Array([0xa1, 0x01, 0x26]),
      new Map<number, unknown>(),
      new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
      new Uint8Array(64),
    ]);
    const deviceAuth = createDeviceAuth([['deviceSignature', deviceSignature]]);
    const deviceSigned = createDeviceSigned([
      ['nameSpaces', deviceNameSpacesTag24],
      ['deviceAuth', deviceAuth],
    ]);

    const document = createDocument([
      ['docType', 'org.iso.18013.5.1.mDL'],
      ['issuerSigned', issuerSigned],
      ['deviceSigned', deviceSigned],
    ]);
    document.delete('docType');

    try {
      toDeviceSignedDocumentObject(document);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.DocTypeMissing);
      expect(err.message).toBe(
        `The document type is missing. - ${MdocErrorCode.DocTypeMissing} - DocTypeMissing`
      );
    }
  });

  it('should throw ErrorCodeError when issuerSigned is missing', () => {
    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpaces: IssuerNameSpaces = new Map([
      [
        'org.iso.18013.5.1',
        [
          createTag24(
            new Map<string, unknown>([
              ['digestID', 0],
              ['random', new Uint8Array(32)],
              ['elementIdentifier', 'given_name'],
              ['elementValue', 'John'],
            ])
          ) as Tag,
        ],
      ],
    ]);

    const issuerAuth = issuerAuthSchema.parse([
      new Uint8Array([0xa1, 0x01, 0x26]), // protected headers
      new Map<number, unknown>(), // unprotected headers
      new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]), // payload
      new Uint8Array(64), // signature
    ]);

    const issuerSigned = createIssuerSigned([
      ['nameSpaces', nameSpaces],
      ['issuerAuth', issuerAuth],
    ]);

    const deviceNameSpaces = new Map<string, unknown>([
      ['org.iso.18013.5.1', new Map([['given_name', 'John']])],
    ]);
    const deviceNameSpacesTag24 = createTag24(deviceNameSpaces);
    const deviceSignature = createTag18([
      new Uint8Array([0xa1, 0x01, 0x26]),
      new Map<number, unknown>(),
      new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
      new Uint8Array(64),
    ]);
    const deviceAuth = createDeviceAuth([['deviceSignature', deviceSignature]]);
    const deviceSigned = createDeviceSigned([
      ['nameSpaces', deviceNameSpacesTag24],
      ['deviceAuth', deviceAuth],
    ]);

    const document = createDocument([
      ['docType', docType],
      ['issuerSigned', issuerSigned],
      ['deviceSigned', deviceSigned],
    ]);
    document.delete('issuerSigned');

    try {
      toDeviceSignedDocumentObject(document);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.IssuerSignedMissing);
      expect(err.message).toBe(
        `The issuer-signed structure is missing. - ${MdocErrorCode.IssuerSignedMissing} - IssuerSignedMissing`
      );
    }
  });

  it('should throw ErrorCodeError when deviceSigned is missing', () => {
    const docType = 'org.iso.18013.5.1.mDL';
    const nameSpaces: IssuerNameSpaces = new Map([
      [
        'org.iso.18013.5.1',
        [
          createTag24(
            new Map<string, unknown>([
              ['digestID', 0],
              ['random', new Uint8Array(32)],
              ['elementIdentifier', 'given_name'],
              ['elementValue', 'John'],
            ])
          ) as Tag,
        ],
      ],
    ]);

    const issuerAuth = issuerAuthSchema.parse([
      new Uint8Array([0xa1, 0x01, 0x26]), // protected headers
      new Map<number, unknown>(), // unprotected headers
      new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]), // payload
      new Uint8Array(64), // signature
    ]);

    const issuerSigned = createIssuerSigned([
      ['nameSpaces', nameSpaces],
      ['issuerAuth', issuerAuth],
    ]);

    const deviceNameSpaces = new Map<string, unknown>([
      ['org.iso.18013.5.1', new Map([['given_name', 'John']])],
    ]);
    const deviceNameSpacesTag24 = createTag24(deviceNameSpaces);
    const deviceSignature = createTag18([
      new Uint8Array([0xa1, 0x01, 0x26]),
      new Map<number, unknown>(),
      new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
      new Uint8Array(64),
    ]);
    const deviceAuth = createDeviceAuth([['deviceSignature', deviceSignature]]);
    const deviceSigned = createDeviceSigned([
      ['nameSpaces', deviceNameSpacesTag24],
      ['deviceAuth', deviceAuth],
    ]);

    const document = createDocument([
      ['docType', docType],
      ['issuerSigned', issuerSigned],
      ['deviceSigned', deviceSigned],
    ]);
    document.delete('deviceSigned');

    try {
      toDeviceSignedDocumentObject(document);
      throw new Error('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorCodeError);
      const err = e as ErrorCodeError;
      expect(err.errorCode).toBe(MdocErrorCode.DeviceSignedMissing);
      expect(err.message).toBe(
        `The device-signed structure is missing. - ${MdocErrorCode.DeviceSignedMissing} - DeviceSignedMissing`
      );
    }
  });
});

