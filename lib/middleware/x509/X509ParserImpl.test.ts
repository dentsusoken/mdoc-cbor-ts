import { describe, it, expect, beforeEach, vi } from 'vitest';
import { X509ParserImpl } from './X509ParserImpl';
import * as x509 from '@peculiar/x509';
import { Buffer } from 'node:buffer';

const mockCertificate = {
  subject: { commonName: 'example.com' },
  issuer: { commonName: 'example.com' },
  notBefore: new Date(),
  notAfter: new Date(),
} as unknown as x509.X509Certificate;

vi.mock('@peculiar/x509', () => {
  return {
    X509Certificate: vi.fn().mockImplementation(() => mockCertificate),
  };
});

describe('X509ParserImpl', () => {
  let parser: X509ParserImpl;

  beforeEach(() => {
    parser = new X509ParserImpl();
  });

  it('should parse PEM certificate', () => {
    const pemCert =
      '-----BEGIN CERTIFICATE-----\nMIIB...\n-----END CERTIFICATE-----';
    const result = parser.parse(pemCert);
    expect(result).toBe(mockCertificate);
    expect(x509.X509Certificate).toHaveBeenCalledWith(pemCert);
  });

  it('should parse DER certificate', () => {
    const derCert = new ArrayBuffer(0);
    const result = parser.parse(derCert);
    expect(result).toBe(mockCertificate);
    expect(x509.X509Certificate).toHaveBeenCalledWith(derCert);
  });

  it('should parse Uint8Array certificate', () => {
    const uint8Cert = new Uint8Array(0);
    const result = parser.parse(uint8Cert);
    expect(result).toBe(mockCertificate);
    expect(x509.X509Certificate).toHaveBeenCalledWith(uint8Cert);
  });

  it('should parse Buffer certificate', () => {
    const bufferCert = Buffer.from([]);
    const result = parser.parse(bufferCert);
    expect(result).toBe(mockCertificate);
    expect(x509.X509Certificate).toHaveBeenCalledWith(bufferCert);
  });

  it('should throw error for invalid certificate', () => {
    vi.mocked(x509.X509Certificate).mockImplementationOnce(() => {
      throw new Error('Invalid certificate');
    });

    expect(() => parser.parse('invalid')).toThrow('Invalid certificate');
  });
});
