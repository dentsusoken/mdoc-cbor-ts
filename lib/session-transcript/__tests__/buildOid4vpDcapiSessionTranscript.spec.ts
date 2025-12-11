import { describe, expect, it } from 'vitest';
import {
  buildOid4vpDcapiHandoverInfo,
  buildOid4vpDcapiHandover,
  buildOid4vpDcapiSessionTranscript,
} from '../buildOid4vpDcapiSessionTranscript';
import { encodeCbor } from '@/cbor/codec';
import { JwkPublicKey } from '@/jwk/types';
import { encodeHex } from 'u8a-utils';

describe('buildOid4vpDcapiSessionTranscript', () => {
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
  const exampleOrigin = 'https://example.com';
  const exampleNonce = 'exc7gBkxjx1rdc9udRrveKvSsJIq80avlXeLHhGwqtA';

  /**
   * Expected hex values from the specification (non-normative)
   */
  const expectedOpenID4VPDCAPIHandoverInfoHex =
    '837368747470733a2f2f6578616d706c652e636f6d782b6578633767426b786a7831726463397564527276654b7653734a4971383061766c58654c4868477771744158204283ec927ae0f208daaa2d026a814f2b22dca52cf85ffa8f3f8626c6bd669047';

  const expectedOpenID4VPDCAPIHandoverHex =
    '82764f70656e4944345650444341504948616e646f7665725820fbece366f4212f9762c74cfdbf83b8c69e371d5d68cea09cb4c48ca6daab761a';

  const expectedSessionTranscriptHex =
    '83f6f682764f70656e4944345650444341504948616e646f7665725820fbece366f4212f9762c74cfdbf83b8c69e371d5d68cea09cb4c48ca6daab761a';

  describe('buildOid4vpDcapiHandoverInfo', () => {
    it('should build OpenID4VPDCAPIHandoverInfo matching the specification example', () => {
      const handoverInfo = buildOid4vpDcapiHandoverInfo({
        verifierOrigin: exampleOrigin,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
      });

      // Verify structure
      expect(handoverInfo).toHaveLength(3);
      expect(handoverInfo[0]).toBe(exampleOrigin);
      expect(handoverInfo[1]).toBe(exampleNonce);
      expect(handoverInfo[2]).toBeInstanceOf(Uint8Array);

      // Verify CBOR encoding matches expected hex
      const encoded = encodeCbor(handoverInfo);
      const encodedHex = encodeHex(encoded);
      expect(encodedHex).toBe(expectedOpenID4VPDCAPIHandoverInfoHex);
    });

    it('should handle null jwkThumbprint when verifierJwkPublicKey is null', () => {
      const handoverInfo = buildOid4vpDcapiHandoverInfo({
        verifierOrigin: exampleOrigin,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: null,
      });

      expect(handoverInfo[2]).toBeNull();
    });
  });

  describe('buildOid4vpDcapiHandover', () => {
    it('should build OpenID4VPDCAPIHandover matching the specification example', () => {
      const handover = buildOid4vpDcapiHandover({
        verifierOrigin: exampleOrigin,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
      });

      // Verify structure
      expect(handover).toHaveLength(2);
      expect(handover[0]).toBe('OpenID4VPDCAPIHandover');
      expect(handover[1]).toBeInstanceOf(Uint8Array);
      expect(handover[1].length).toBe(32); // SHA-256 produces 32 bytes

      // Verify CBOR encoding matches expected hex
      const encoded = encodeCbor(handover);
      const encodedHex = encodeHex(encoded);
      expect(encodedHex).toBe(expectedOpenID4VPDCAPIHandoverHex);
    });

    it('should produce consistent hash for same input', () => {
      const handover1 = buildOid4vpDcapiHandover({
        verifierOrigin: exampleOrigin,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
      });

      const handover2 = buildOid4vpDcapiHandover({
        verifierOrigin: exampleOrigin,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
      });

      expect(handover1[1]).toEqual(handover2[1]);
    });

    it('should produce different hash for different input', () => {
      const handover1 = buildOid4vpDcapiHandover({
        verifierOrigin: exampleOrigin,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
      });

      const handover2 = buildOid4vpDcapiHandover({
        verifierOrigin: 'https://different.example.com',
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
      });

      expect(handover1[1]).not.toEqual(handover2[1]);
    });
  });

  describe('buildOid4vpDcapiSessionTranscript', () => {
    it('should build SessionTranscript matching the specification example', () => {
      const sessionTranscript = buildOid4vpDcapiSessionTranscript({
        verifierOrigin: exampleOrigin,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
      });

      // Verify structure
      expect(sessionTranscript).toHaveLength(3);
      expect(sessionTranscript[0]).toBeNull(); // DeviceEngagementBytes
      expect(sessionTranscript[1]).toBeNull(); // EReaderKeyBytes
      expect(Array.isArray(sessionTranscript[2])).toBe(true); // Handover
      expect((sessionTranscript[2] as [string, Uint8Array])[0]).toBe(
        'OpenID4VPDCAPIHandover'
      );

      // Verify CBOR encoding matches expected hex
      const encoded = encodeCbor(sessionTranscript);
      const encodedHex = encodeHex(encoded);
      expect(encodedHex).toBe(expectedSessionTranscriptHex);
    });

    it('should have null DeviceEngagementBytes and EReaderKeyBytes', () => {
      const sessionTranscript = buildOid4vpDcapiSessionTranscript({
        verifierOrigin: exampleOrigin,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
      });

      expect(sessionTranscript[0]).toBeNull();
      expect(sessionTranscript[1]).toBeNull();
    });

    it('should have Handover as OpenID4VPDCAPIHandover array structure', () => {
      const sessionTranscript = buildOid4vpDcapiSessionTranscript({
        verifierOrigin: exampleOrigin,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: exampleJwk,
      });

      // Verify the Handover is the OpenID4VPDCAPIHandover structure
      const handover = sessionTranscript[2] as [string, Uint8Array];
      expect(Array.isArray(handover)).toBe(true);
      expect(handover).toHaveLength(2);
      expect(handover[0]).toBe('OpenID4VPDCAPIHandover');
      expect(handover[1]).toBeInstanceOf(Uint8Array);
      expect(handover[1].length).toBe(32); // SHA-256 produces 32 bytes
    });

    it('should handle null verifierJwkPublicKey', () => {
      const sessionTranscript = buildOid4vpDcapiSessionTranscript({
        verifierOrigin: exampleOrigin,
        verifierNonce: exampleNonce,
        verifierJwkPublicKey: null,
      });

      expect(sessionTranscript).toHaveLength(3);
      expect(sessionTranscript[0]).toBeNull();
      expect(sessionTranscript[1]).toBeNull();
      expect(Array.isArray(sessionTranscript[2])).toBe(true);
    });
  });
});
