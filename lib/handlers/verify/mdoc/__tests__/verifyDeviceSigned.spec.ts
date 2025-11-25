import { describe, it, expect } from 'vitest';
import { verifyDeviceSigned } from '../verifyDeviceSigned';
import { buildDeviceSigned } from '@/handlers/issue/mdoc/buildDeviceSigned';
import { createSignatureCurve } from 'noble-curves-extended';
import { randomBytes } from '@noble/hashes/utils';
import { createTag24 } from '@/cbor/createTag24';
import { SessionTranscript } from '@/mdoc/types';
import { nameSpacesRecordToMap } from '@/mdoc/nameSpacesRecordToMap';
import { DeviceSigned } from '@/schemas/mdoc/DeviceSigned';
import { createDeviceSigned } from '@/schemas/mdoc/DeviceSigned';
import { createDeviceAuth } from '@/schemas/mdoc/DeviceAuth';
import { createTag17 } from '@/cbor/createTag17';
import { ErrorCodeError } from '@/mdoc/ErrorCodeError';

const p256 = createSignatureCurve('P-256', randomBytes);

const buildValidDeviceSigned = (
  sessionTranscript: SessionTranscript,
  docType: string,
  nameSpaces: Map<string, Map<string, unknown>>
): {
  deviceSigned: DeviceSigned;
  deviceJwkPublicKey: ReturnType<typeof p256.toJwkPublicKey>;
} => {
  const privateKey = p256.randomPrivateKey();
  const publicKey = p256.getPublicKey(privateKey);
  const jwkPrivateKey = p256.toJwkPrivateKey(privateKey);
  const jwkPublicKey = p256.toJwkPublicKey(publicKey);

  const nameSpacesBytes = createTag24(nameSpaces);

  const deviceSigned = buildDeviceSigned({
    sessionTranscript,
    docType,
    nameSpacesBytes,
    deviceJwkPrivateKey: jwkPrivateKey,
  });

  return { deviceSigned, deviceJwkPublicKey: jwkPublicKey };
};

describe('verifyDeviceSigned', () => {
  const sessionTranscript: SessionTranscript = [null, null, new Map()];
  const docType = 'org.iso.18013.5.1.mDL';

  describe('success cases', () => {
    it('should verify a valid device-signed object', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Alice',
          age: 30,
        },
      });

      const { deviceSigned, deviceJwkPublicKey } = buildValidDeviceSigned(
        sessionTranscript,
        docType,
        nameSpaces
      );

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType,
          sessionTranscript,
          deviceJwkPublicKey,
        });
      }).not.toThrow();
    });

    it('should verify with different session transcript values', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Bob',
        },
      });

      const sessionTranscriptWithValues: SessionTranscript = [
        new Uint8Array([1, 2, 3]),
        new Uint8Array([4, 5, 6]),
        new Map([['handoverType', 1]]),
      ];

      const { deviceSigned, deviceJwkPublicKey } = buildValidDeviceSigned(
        sessionTranscriptWithValues,
        docType,
        nameSpaces
      );

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType,
          sessionTranscript: sessionTranscriptWithValues,
          deviceJwkPublicKey,
        });
      }).not.toThrow();
    });

    it('should verify with different document types', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.2': {
          given_name: 'Charlie',
        },
      });

      const differentDocType = 'org.iso.18013.5.2.mDL';

      const { deviceSigned, deviceJwkPublicKey } = buildValidDeviceSigned(
        sessionTranscript,
        differentDocType,
        nameSpaces
      );

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType: differentDocType,
          sessionTranscript,
          deviceJwkPublicKey,
        });
      }).not.toThrow();
    });
  });

  describe('error cases', () => {
    it('should throw ErrorCodeError when nameSpaces is missing', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Alice',
        },
      });

      const { deviceSigned: validDeviceSigned, deviceJwkPublicKey } =
        buildValidDeviceSigned(sessionTranscript, docType, nameSpaces);

      // Create a deviceSigned without nameSpaces
      const deviceAuth = validDeviceSigned.get('deviceAuth')!;
      const deviceSignedWithoutNameSpaces = createDeviceSigned([
        ['deviceAuth', deviceAuth],
      ]);

      expect(() => {
        verifyDeviceSigned({
          deviceSigned: deviceSignedWithoutNameSpaces,
          docType,
          sessionTranscript,
          deviceJwkPublicKey,
        });
      }).toThrow(ErrorCodeError);

      expect(() => {
        verifyDeviceSigned({
          deviceSigned: deviceSignedWithoutNameSpaces,
          docType,
          sessionTranscript,
          deviceJwkPublicKey,
        });
      }).toThrow('The device name spaces are missing.');
    });

    it('should throw ErrorCodeError when deviceAuth is missing', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Alice',
        },
      });
      const nameSpacesBytes = createTag24(nameSpaces);

      // Create a deviceSigned without deviceAuth
      const deviceSignedWithoutDeviceAuth = createDeviceSigned([
        ['nameSpaces', nameSpacesBytes],
      ]);

      const privateKey = p256.randomPrivateKey();
      const publicKey = p256.getPublicKey(privateKey);
      const jwkPublicKey = p256.toJwkPublicKey(publicKey);

      expect(() => {
        verifyDeviceSigned({
          deviceSigned: deviceSignedWithoutDeviceAuth,
          docType,
          sessionTranscript,
          deviceJwkPublicKey: jwkPublicKey,
        });
      }).toThrow(ErrorCodeError);

      expect(() => {
        verifyDeviceSigned({
          deviceSigned: deviceSignedWithoutDeviceAuth,
          docType,
          sessionTranscript,
          deviceJwkPublicKey: jwkPublicKey,
        });
      }).toThrow('The device authentication is missing.');
    });

    it('should throw ErrorCodeError when deviceSignature is missing', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Alice',
        },
      });
      const nameSpacesBytes = createTag24(nameSpaces);

      // Create a deviceAuth without deviceSignature
      const deviceAuth = createDeviceAuth([]);

      const deviceSigned = createDeviceSigned([
        ['nameSpaces', nameSpacesBytes],
        ['deviceAuth', deviceAuth],
      ]);

      const privateKey = p256.randomPrivateKey();
      const publicKey = p256.getPublicKey(privateKey);
      const jwkPublicKey = p256.toJwkPublicKey(publicKey);

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType,
          sessionTranscript,
          deviceJwkPublicKey: jwkPublicKey,
        });
      }).toThrow(ErrorCodeError);

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType,
          sessionTranscript,
          deviceJwkPublicKey: jwkPublicKey,
        });
      }).toThrow('The device signature is missing.');
    });

    it('should throw ErrorCodeError when deviceMac is present', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Alice',
        },
      });
      const nameSpacesBytes = createTag24(nameSpaces);

      // Create a deviceAuth with both deviceMac and deviceSignature to trigger DeviceMacNotSupported
      const { deviceSigned: validDeviceSigned } = buildValidDeviceSigned(
        sessionTranscript,
        docType,
        nameSpaces
      );
      const validDeviceAuth = validDeviceSigned.get('deviceAuth')!;
      const deviceSignature = validDeviceAuth.get('deviceSignature')!;

      // Create deviceAuth with both deviceMac and deviceSignature
      const mac0Tuple: [
        Uint8Array,
        Map<number, unknown>,
        Uint8Array,
        Uint8Array,
      ] = [
        new Uint8Array([]),
        new Map<number, unknown>(),
        new Uint8Array([]),
        new Uint8Array([]),
      ];
      const deviceMac = createTag17(mac0Tuple);
      const deviceAuth = createDeviceAuth([
        ['deviceSignature', deviceSignature],
        ['deviceMac', deviceMac],
      ]);

      const deviceSigned = createDeviceSigned([
        ['nameSpaces', nameSpacesBytes],
        ['deviceAuth', deviceAuth],
      ]);

      const { deviceJwkPublicKey } = buildValidDeviceSigned(
        sessionTranscript,
        docType,
        nameSpaces
      );

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType,
          sessionTranscript,
          deviceJwkPublicKey,
        });
      }).toThrow(ErrorCodeError);

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType,
          sessionTranscript,
          deviceJwkPublicKey,
        });
      }).toThrow('The device MAC is not supported.');
    });

    it('should throw ErrorCodeError when Sign1 conversion fails', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Alice',
        },
      });
      const nameSpacesBytes = createTag24(nameSpaces);

      // Create a deviceAuth with Tag 17 instead of Tag 18 to trigger conversion failure
      const mac0Tuple: [
        Uint8Array,
        Map<number, unknown>,
        Uint8Array,
        Uint8Array,
      ] = [
        new Uint8Array([]),
        new Map<number, unknown>(),
        new Uint8Array([]),
        new Uint8Array([]),
      ];
      const invalidTag18 = createTag17(mac0Tuple); // This is Tag 17, not Tag 18
      const deviceAuth = createDeviceAuth([['deviceSignature', invalidTag18]]);

      const deviceSigned = createDeviceSigned([
        ['nameSpaces', nameSpacesBytes],
        ['deviceAuth', deviceAuth],
      ]);

      const privateKey = p256.randomPrivateKey();
      const publicKey = p256.getPublicKey(privateKey);
      const jwkPublicKey = p256.toJwkPublicKey(publicKey);

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType,
          sessionTranscript,
          deviceJwkPublicKey: jwkPublicKey,
        });
      }).toThrow(ErrorCodeError);

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType,
          sessionTranscript,
          deviceJwkPublicKey: jwkPublicKey,
        });
      }).toThrow('Expected Tag(18), but received Tag(17)');
    });

    it('should throw error when signature verification fails', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Alice',
        },
      });

      const { deviceSigned } = buildValidDeviceSigned(
        sessionTranscript,
        docType,
        nameSpaces
      );

      // Use a different public key to cause signature verification failure
      const wrongPrivateKey = p256.randomPrivateKey();
      const wrongPublicKey = p256.toJwkPublicKey(
        p256.getPublicKey(wrongPrivateKey)
      );

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType,
          sessionTranscript,
          deviceJwkPublicKey: wrongPublicKey,
        });
      }).toThrow();
    });

    it('should throw error when deviceSigned has deviceMac present', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Alice',
        },
      });
      const nameSpacesBytes = createTag24(nameSpaces);

      // Create a deviceAuth with both deviceMac and deviceSignature to trigger DeviceMacNotSupported
      const { deviceSigned: validDeviceSigned } = buildValidDeviceSigned(
        sessionTranscript,
        docType,
        nameSpaces
      );
      const validDeviceAuth = validDeviceSigned.get('deviceAuth')!;
      const deviceSignature = validDeviceAuth.get('deviceSignature')!;

      // Create deviceAuth with both deviceMac and deviceSignature
      const mac0Tuple: [
        Uint8Array,
        Map<number, unknown>,
        Uint8Array,
        Uint8Array,
      ] = [
        new Uint8Array([]),
        new Map<number, unknown>(),
        new Uint8Array([]),
        new Uint8Array([]),
      ];
      const deviceMac = createTag17(mac0Tuple);
      const deviceAuth = createDeviceAuth([
        ['deviceSignature', deviceSignature],
        ['deviceMac', deviceMac],
      ]);

      const deviceSigned = createDeviceSigned([
        ['nameSpaces', nameSpacesBytes],
        ['deviceAuth', deviceAuth],
      ]);

      const { deviceJwkPublicKey } = buildValidDeviceSigned(
        sessionTranscript,
        docType,
        nameSpaces
      );

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType,
          sessionTranscript,
          deviceJwkPublicKey,
        });
      }).toThrow(ErrorCodeError);

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType,
          sessionTranscript,
          deviceJwkPublicKey,
        });
      }).toThrow('The device MAC is not supported.');
    });

    it('should throw error when deviceSigned is missing nameSpaces', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Alice',
        },
      });

      const { deviceSigned: validDeviceSigned, deviceJwkPublicKey } =
        buildValidDeviceSigned(sessionTranscript, docType, nameSpaces);

      // Create a deviceSigned without nameSpaces
      const deviceAuth = validDeviceSigned.get('deviceAuth')!;
      const deviceSignedWithoutNameSpaces = createDeviceSigned([
        ['deviceAuth', deviceAuth],
      ]);

      expect(() => {
        verifyDeviceSigned({
          deviceSigned: deviceSignedWithoutNameSpaces,
          docType,
          sessionTranscript,
          deviceJwkPublicKey,
        });
      }).toThrow(ErrorCodeError);
    });

    it('should throw error when deviceSigned is missing deviceAuth', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Alice',
        },
      });
      const nameSpacesBytes = createTag24(nameSpaces);

      // Create a deviceSigned without deviceAuth
      const deviceSignedWithoutDeviceAuth = createDeviceSigned([
        ['nameSpaces', nameSpacesBytes],
      ]);

      const privateKey = p256.randomPrivateKey();
      const publicKey = p256.getPublicKey(privateKey);
      const jwkPublicKey = p256.toJwkPublicKey(publicKey);

      expect(() => {
        verifyDeviceSigned({
          deviceSigned: deviceSignedWithoutDeviceAuth,
          docType,
          sessionTranscript,
          deviceJwkPublicKey: jwkPublicKey,
        });
      }).toThrow(ErrorCodeError);
    });

    it('should throw error when session transcript mismatch', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Alice',
        },
      });

      const originalSessionTranscript: SessionTranscript = [
        null,
        null,
        new Map([['key', 'value']]),
      ];
      const { deviceSigned, deviceJwkPublicKey } = buildValidDeviceSigned(
        originalSessionTranscript,
        docType,
        nameSpaces
      );

      // Use a different session transcript
      const differentSessionTranscript: SessionTranscript = [
        null,
        null,
        new Map([['key', 'different']]),
      ];

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType,
          sessionTranscript: differentSessionTranscript,
          deviceJwkPublicKey,
        });
      }).toThrow();
    });

    it('should throw error when docType mismatch', () => {
      const nameSpaces = nameSpacesRecordToMap({
        'org.iso.18013.5.1': {
          given_name: 'Alice',
        },
      });

      const { deviceSigned, deviceJwkPublicKey } = buildValidDeviceSigned(
        sessionTranscript,
        docType,
        nameSpaces
      );

      // Use a different docType
      const differentDocType = 'org.iso.18013.5.2.mDL';

      expect(() => {
        verifyDeviceSigned({
          deviceSigned,
          docType: differentDocType,
          sessionTranscript,
          deviceJwkPublicKey,
        });
      }).toThrow();
    });
  });
});
