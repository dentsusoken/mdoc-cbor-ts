import { describe, expect, it } from 'vitest';
import {
  buildOid4vpRedirectHandoverInfo,
  buildOid4vpRedirectHandover,
  buildOid4vpRedirectSessionTranscript,
} from '../buildOid4vpRedirectSessionTranscript';
import { encodeCbor } from '@/cbor/codec';
import { JwkPublicKey } from '@/jwk/types';
import { encodeHex } from 'u8a-utils';

describe('buildOid4vpRedirectSessionTranscript', () => {
  /**
   * Example JWK from the specification (non-normative)
   * Note: use and alg are included in the spec example but may not be part of JwkPublicKey type
   */
  const exampleJwk = {
    kty: 'EC',
    crv: 'P-256',
    x: 'DxiH5Q4Yx3UrukE2lWCErq8N8bqC9CHLLrAwLz5BmE0',
    y: 'XtLM4-3h5o3HUH0MHVJV0kyq0iBlrBwlh8qEDMZ4-Pc',
    use: 'enc',
    alg: 'ECDH-ES',
    kid: '1',
  } as JwkPublicKey & { use?: string; alg?: string };

  /**
   * Example values from the specification (non-normative)
   */
  const exampleClientId = 'x509_san_dns:example.com';
  const exampleNonce = 'exc7gBkxjx1rdc9udRrveKvSsJIq80avlXeLHhGwqtA';
  const exampleResponseUri = 'https://example.com/response';

  /**
   * Expected hex values from the specification (non-normative)
   */
  const expectedOpenID4VPHandoverInfoHex =
    '847818783530395f73616e5f646e733a6578616d706c652e636f6d782b6578633767426b786a7831726463397564527276654b7653734a4971383061766c58654c4868477771744158204283ec927ae0f208daaa2d026a814f2b22dca52cf85ffa8f3f8626c6bd669047781c68747470733a2f2f6578616d706c652e636f6d2f726573706f6e7365';

  const expectedOpenID4VPHandoverHex =
    '82714f70656e494434565048616e646f7665725820048bc053c00442af9b8eed494cefdd9d95240d254b046b11b68013722aad38ac';

  const expectedSessionTranscriptHex =
    '83f6f682714f70656e494434565048616e646f7665725820048bc053c00442af9b8eed494cefdd9d95240d254b046b11b68013722aad38ac';

  describe('buildOid4vpRedirectHandoverInfo', () => {
    it('should build OpenID4VPHandoverInfo matching the specification example', () => {
      const handoverInfo = buildOid4vpRedirectHandoverInfo({
        clientId: exampleClientId,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
        responseUri: exampleResponseUri,
      });

      // Verify structure
      expect(handoverInfo).toHaveLength(4);
      expect(handoverInfo[0]).toBe(exampleClientId);
      expect(handoverInfo[1]).toBe(exampleNonce);
      expect(handoverInfo[2]).toBeInstanceOf(Uint8Array);
      expect(handoverInfo[3]).toBe(exampleResponseUri);

      // Verify CBOR encoding matches expected hex
      const encoded = encodeCbor(handoverInfo);
      const encodedHex = encodeHex(encoded);
      expect(encodedHex).toBe(expectedOpenID4VPHandoverInfoHex);
    });

    it('should handle null jwkThumbprint when verifierJwkPublicKey is null', () => {
      const handoverInfo = buildOid4vpRedirectHandoverInfo({
        clientId: exampleClientId,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: null,
        responseUri: exampleResponseUri,
      });

      expect(handoverInfo[2]).toBeNull();
    });
  });

  describe('buildOid4vpRedirectHandover', () => {
    it('should build OpenID4VPHandover matching the specification example', () => {
      const handover = buildOid4vpRedirectHandover({
        clientId: exampleClientId,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
        responseUri: exampleResponseUri,
      });

      // Verify structure
      expect(handover).toHaveLength(2);
      expect(handover[0]).toBe('OpenID4VPHandover');
      expect(handover[1]).toBeInstanceOf(Uint8Array);
      expect(handover[1].length).toBe(32); // SHA-256 produces 32 bytes

      // Verify CBOR encoding matches expected hex
      const encoded = encodeCbor(handover);
      const encodedHex = encodeHex(encoded);
      expect(encodedHex).toBe(expectedOpenID4VPHandoverHex);
    });

    it('should produce consistent hash for same input', () => {
      const handover1 = buildOid4vpRedirectHandover({
        clientId: exampleClientId,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
        responseUri: exampleResponseUri,
      });

      const handover2 = buildOid4vpRedirectHandover({
        clientId: exampleClientId,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
        responseUri: exampleResponseUri,
      });

      expect(handover1[1]).toEqual(handover2[1]);
    });

    it('should produce different hash for different input', () => {
      const handover1 = buildOid4vpRedirectHandover({
        clientId: exampleClientId,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
        responseUri: exampleResponseUri,
      });

      const handover2 = buildOid4vpRedirectHandover({
        clientId: 'different-client-id',
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
        responseUri: exampleResponseUri,
      });

      expect(handover1[1]).not.toEqual(handover2[1]);
    });
  });

  describe('buildOid4vpRedirectSessionTranscript', () => {
    it('should build SessionTranscript matching the specification example', () => {
      const sessionTranscript = buildOid4vpRedirectSessionTranscript({
        clientId: exampleClientId,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
        responseUri: exampleResponseUri,
      });

      // Verify structure
      expect(sessionTranscript).toHaveLength(3);
      expect(sessionTranscript[0]).toBeNull(); // DeviceEngagementBytes
      expect(sessionTranscript[1]).toBeNull(); // EReaderKeyBytes
      expect(Array.isArray(sessionTranscript[2])).toBe(true); // Handover
      expect((sessionTranscript[2] as [string, Uint8Array])[0]).toBe(
        'OpenID4VPHandover'
      );

      // Verify CBOR encoding matches expected hex
      const encoded = encodeCbor(sessionTranscript);
      const encodedHex = encodeHex(encoded);
      expect(encodedHex).toBe(expectedSessionTranscriptHex);
    });

    it('should have null DeviceEngagementBytes and EReaderKeyBytes', () => {
      const sessionTranscript = buildOid4vpRedirectSessionTranscript({
        clientId: exampleClientId,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
        responseUri: exampleResponseUri,
      });

      expect(sessionTranscript[0]).toBeNull();
      expect(sessionTranscript[1]).toBeNull();
    });

    it('should have Handover as OpenID4VPHandover array structure', () => {
      const sessionTranscript = buildOid4vpRedirectSessionTranscript({
        clientId: exampleClientId,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
        responseUri: exampleResponseUri,
      });

      // Verify the Handover is the OpenID4VPHandover structure
      const handover = sessionTranscript[2] as [string, Uint8Array];
      expect(Array.isArray(handover)).toBe(true);
      expect(handover).toHaveLength(2);
      expect(handover[0]).toBe('OpenID4VPHandover');
      expect(handover[1]).toBeInstanceOf(Uint8Array);
      expect(handover[1].length).toBe(32); // SHA-256 produces 32 bytes
    });

    it('should handle null verifierJwkPublicKey', () => {
      const sessionTranscript = buildOid4vpRedirectSessionTranscript({
        clientId: exampleClientId,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: null,
        responseUri: exampleResponseUri,
      });

      expect(sessionTranscript).toHaveLength(3);
      expect(sessionTranscript[0]).toBeNull();
      expect(sessionTranscript[1]).toBeNull();
      expect(Array.isArray(sessionTranscript[2])).toBe(true);
    });
  });
});
