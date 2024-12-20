/**
 * Type definition for X.509 certificate encoding formats
 * - 'pem': Privacy Enhanced Mail format (Base64 encoded DER with header and footer)
 * - 'der': Distinguished Encoding Rules format (binary)
 */
export type EncodingType = 'pem' | 'der';
