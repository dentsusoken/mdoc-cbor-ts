import { Algorithms, COSEKey, COSEKeyParam, KeyType, Sign1 } from '@auth0/cose';
import { TypedMap } from '@jfromaniello/typedmap';
import { describe, expect, it, vi } from 'vitest';
import { ByteString, DateTime, encode } from '../../../cbor';
import { IssuerNameSpaces, IssuerSignedItemBytes } from '../../../schemas/mdoc';
import { IssuerAuth, MobileSecurityObjectBytes } from '../../../schemas/mso';
import { calculateDigest } from '../../../utils/calculateDigest';
import { verifyDigest } from './VerifyDigest';

// Mock calculateDigest at the top level with a simple implementation
vi.mock('../../../utils/calculateDigest', () => ({
  calculateDigest: vi.fn(),
}));

describe('verifyDigest', () => {
  const TEST_DIGEST = Buffer.from('test-digest');
  const DIFFERENT_DIGEST = Buffer.from('different-digest');

  // Setup test data
  const testElement: IssuerSignedItemBytes = new ByteString(
    new TypedMap([
      ['digestID', 0],
      ['elementIdentifier', 'test-element'],
      ['elementValue', 'test-value'],
      ['random', Buffer.from('test-random')],
    ])
  );

  const issuerNameSpaces: IssuerNameSpaces = {
    'org.iso.18013.5.1': [testElement],
  };

  // Create mock MSO
  const mso: MobileSecurityObjectBytes = new ByteString(
    new TypedMap([
      ['version', '1.0'],
      ['digestAlgorithm', 'SHA-256'],
      [
        'valueDigests',
        {
          'org.iso.18013.5.1': {
            0: TEST_DIGEST,
          },
        },
      ],
      [
        'deviceKeyInfo',
        {
          deviceKey: Object.fromEntries(
            new COSEKey([
              [COSEKeyParam.KeyType, KeyType.EC],
              [COSEKeyParam.Algorithm, Algorithms.ES256],
              [COSEKeyParam.x, Buffer.from('test-x')],
              [COSEKeyParam.y, Buffer.from('test-y')],
            ]).esMap
          ),
        },
      ],
      ['docType', 'org.iso.18013.5.1.mDL'],
      [
        'validityInfo',
        {
          signed: new DateTime(),
          validFrom: new DateTime(),
          validUntil: new DateTime(),
        },
      ],
    ])
  );

  // new ByteString({
  //   version: '1.0',
  //   digestAlgorithm: 'SHA-256',
  //   valueDigests: {
  //     'org.iso.18013.5.1': {
  //       0: TEST_DIGEST,
  //     },
  //   },
  //   deviceKeyInfo: {
  //     deviceKey: new COSEKey([
  //       [COSEKeyParam.KeyType, KeyType.EC],
  //       [COSEKeyParam.Algorithm, Algorithms.ES256],
  //       [COSEKeyParam.x, Buffer.from('test-x')],
  //       [COSEKeyParam.y, Buffer.from('test-y')],
  //     ]),
  //   },
  //   docType: 'org.iso.18013.5.1.mDL',
  //   validityInfo: {
  //     signed: new DateTime(),
  //     validFrom: new DateTime(),
  //     validUntil: new DateTime(),
  //   },
  // });

  // Create mock issuerAuth
  const issuerAuth = new Sign1(
    new Map(),
    new Map(),
    encode(mso),
    Buffer.from('test-signature')
  ).getContentForEncoding() as IssuerAuth;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(calculateDigest).mockResolvedValue(TEST_DIGEST);
    vi.stubGlobal('decode', vi.fn().mockReturnValue(mso));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should verify valid digest', async () => {
    const now = Date.now();
    const validFrom = new DateTime(now - 60 * 60 * 1000); // 1 hour ago
    const validUntil = new DateTime(now + 60 * 60 * 1000); // 1 hour later
    const msoValid: MobileSecurityObjectBytes = new ByteString(
      new TypedMap([
        ...mso.data.esMap,
        [
          'validityInfo',
          {
            signed: new DateTime(),
            validFrom,
            validUntil,
          },
        ],
      ])
    );
    const issuerAuthValid = new Sign1(
      new Map(),
      new Map(),
      encode(msoValid),
      Buffer.from('test-signature')
    ).getContentForEncoding() as IssuerAuth;
    vi.stubGlobal('decode', vi.fn().mockReturnValue(msoValid));

    await verifyDigest(issuerAuthValid, issuerNameSpaces);
    expect(calculateDigest).toHaveBeenCalledWith('SHA-256', testElement);
  });

  it('should treat MSO as always valid if validFrom and validUntil are the same', async () => {
    const now = Date.now();
    const sameDate = new DateTime(now);

    const msoSameValidity: MobileSecurityObjectBytes = new ByteString(
      new TypedMap([
        ...mso.data.esMap,
        [
          'validityInfo',
          {
            signed: new DateTime(),
            validFrom: sameDate,
            validUntil: sameDate,
          },
        ],
      ])
    );
    const issuerAuthSameValidity = new Sign1(
      new Map(),
      new Map(),
      encode(msoSameValidity),
      Buffer.from('test-signature')
    ).getContentForEncoding() as IssuerAuth;

    vi.stubGlobal('decode', vi.fn().mockReturnValue(msoSameValidity));
    await verifyDigest(issuerAuthSameValidity, issuerNameSpaces);
    expect(calculateDigest).toHaveBeenCalledWith('SHA-256', testElement);
  });

  it('should throw error when digest mismatch', async () => {
    vi.mocked(calculateDigest).mockResolvedValueOnce(DIFFERENT_DIGEST);

    const now = Date.now();
    const validFrom = new DateTime(now - 60 * 60 * 1000); // 1 hour ago
    const validUntil = new DateTime(now + 60 * 60 * 1000); // 1 hour later
    const msoMismatch: MobileSecurityObjectBytes = new ByteString(
      new TypedMap([
        ...mso.data.esMap,
        [
          'validityInfo',
          {
            signed: new DateTime(),
            validFrom,
            validUntil,
          },
        ],
      ])
    );
    const issuerAuthMismatch = new Sign1(
      new Map(),
      new Map(),
      encode(msoMismatch),
      Buffer.from('test-signature')
    ).getContentForEncoding() as IssuerAuth;
    vi.stubGlobal('decode', vi.fn().mockReturnValue(msoMismatch));

    await expect(
      verifyDigest(issuerAuthMismatch, issuerNameSpaces)
    ).rejects.toThrow('Digest mismatch for org.iso.18013.5.1, DigestID: 0');
  });

  it('should throw error if MSO is not yet valid (vaildFrom in future)', async () => {
    const futureDate = new DateTime(Date.now() + 60 * 60 * 1000);
    const msoFuture: MobileSecurityObjectBytes = new ByteString(
      new TypedMap([
        ...mso.data.esMap,
        [
          'validityInfo',
          {
            signed: new DateTime(),
            validFrom: futureDate,
            validUntil: new DateTime(Date.now() + 2 * 60 * 60 * 1000),
          },
        ],
      ])
    );
    const issuerAuthFuture = new Sign1(
      new Map(),
      new Map(),
      encode(msoFuture),
      Buffer.from('test-signature')
    ).getContentForEncoding() as IssuerAuth;

    vi.stubGlobal('decode', vi.fn().mockReturnValue(msoFuture));
    await expect(
      verifyDigest(issuerAuthFuture, issuerNameSpaces)
    ).rejects.toThrow('MSO is not valid at the current time');
  });

  it('should throw error if MSO is expired (validUntil in past)', async () => {
    const validFrom = new DateTime(Date.now() - 2 * 60 * 60 * 1000);
    const validUntil = new DateTime(Date.now() - 60 * 60 * 1000);
    const msoPast: MobileSecurityObjectBytes = new ByteString(
      new TypedMap([
        ...mso.data.esMap,
        [
          'validityInfo',
          {
            signed: new DateTime(),
            validFrom,
            validUntil,
          },
        ],
      ])
    );
    const issuerAuthPast = new Sign1(
      new Map(),
      new Map(),
      encode(msoPast),
      Buffer.from('test-signature')
    ).getContentForEncoding() as IssuerAuth;
    vi.stubGlobal('decode', vi.fn().mockReturnValue(msoPast));
    await expect(
      verifyDigest(issuerAuthPast, issuerNameSpaces)
    ).rejects.toThrow('MSO is not valid at the current time');
  });

  // it('should handle multiple namespaces', async () => {
  //   const testElement2 = new ByteString({
  //     digestID: 0,
  //     elementIdentifier: 'test-element-2',
  //     elementValue: 'test-value-2',
  //     random: Buffer.from('test-random-2'),
  //   });

  //   const multiNameSpaces: IssuerNameSpaces = {
  //     'org.iso.18013.5.1': [testElement],
  //     'org.iso.18013.5.2': [testElement2],
  //   };

  //   const multiMso = new ByteString({
  //     ...mso,
  //     valueDigests: {
  //       'org.iso.18013.5.1': { 0: TEST_DIGEST },
  //       'org.iso.18013.5.2': { 0: TEST_DIGEST },
  //     },
  //   });

  //   const multiIssuerAuth = new Sign1(
  //     new Map(),
  //     new Map(),
  //     encode(multiMso),
  //     Buffer.from('test-signature')
  //   );

  //   vi.stubGlobal('decode', vi.fn().mockReturnValue(multiMso));

  //   await verifyDigest(multiIssuerAuth, multiNameSpaces);
  //   expect(calculateDigest).toHaveBeenCalledTimes(2);
  // });

  // it('should handle multiple elements in namespace', async () => {
  //   const testElement2 = new ByteString({
  //     digestID: 1,
  //     elementIdentifier: 'test-element-2',
  //     elementValue: 'test-value-2',
  //     random: Buffer.from('test-random-2'),
  //   });

  //   const multiElements: IssuerNameSpaces = {
  //     'org.iso.18013.5.1': [testElement, testElement2],
  //   };

  //   const multiElementMso = new ByteString({
  //     ...mso,
  //     valueDigests: {
  //       'org.iso.18013.5.1': {
  //         0: TEST_DIGEST,
  //         1: TEST_DIGEST,
  //       },
  //     },
  //   });

  //   const multiElementIssuerAuth = new Sign1(
  //     new Map(),
  //     new Map(),
  //     encode(multiElementMso),
  //     Buffer.from('test-signature')
  //   );

  //   vi.stubGlobal('decode', vi.fn().mockReturnValue(multiElementMso));

  //   await verifyDigest(multiElementIssuerAuth, multiElements);
  //   expect(calculateDigest).toHaveBeenCalledTimes(2);
  // });
});
