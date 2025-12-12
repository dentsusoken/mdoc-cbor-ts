# mdoc-cbor-ts

A TypeScript implementation for handling Mobile Document (MDOC) issuance and verification according to ISO/IEC 18013-5 standard.

## Overview

`mdoc-cbor-ts` provides a comprehensive TypeScript library for working with Mobile Documents (mDL/mDOC) as specified in ISO/IEC 18013-5. The library supports both issuance and verification of mobile documents, including device authentication, issuer authentication, and custom namespace handling.

## Features

- **MDOC Issuance**: Build issuer-signed and device-signed documents
- **MDOC Verification**: Verify issuer signatures, device signatures, and document validity
- **CBOR Encoding/Decoding**: Full support for CBOR data structures with ISO/IEC 18013-5 compatibility
- **COSE Operations**: Support for COSE_Sign1 signatures and MAC operations
- **JWK/COSE Conversion**: Convert between JWK and COSE key formats
- **DCQL Support**: Device Credential Query Language (DCQL) selectors and utilities
- **Custom Namespaces**: Define and verify custom namespaces with Zod schemas
- **Session Transcripts**: Build session transcripts for OID4VP (OpenID for Verifiable Presentations)
- **X.509 Certificate Handling**: Support for certificate chain verification
- **Type-Safe**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install @vecrea/mdoc-cbor-ts
```

### Peer Dependencies

This library requires the following peer dependencies:

```bash
npm install @noble/curves @noble/hashes cbor-x jsrsasign noble-curves-extended u8a-utils zod
```

## Usage

### Verifying an MDOC

```typescript
import { verifyDeviceResponse } from '@vecrea/mdoc-cbor-ts';

const deviceResponse = // ... MDOC structure
const sessionTranscript = [null, null, {}];

try {
  verifyDeviceResponse({
    deviceResponse,
    sessionTranscript,
    now: new Date(),
    clockSkew: 60, // seconds
  });
  console.log('Verification successful');
} catch (error) {
  console.error('Verification failed:', error);
}
```

### Verifying Custom Namespaces

See the [Custom Namespace Verification Guide](./docs/how_to_verify_custom_namespace.md) for detailed instructions on verifying custom namespaces with Zod schemas.

### Issuing an MDOC

```typescript
import {
  buildIssuerSigned,
  createTag1004,
  nameSpacesRecordToMap,
  certificatePemToDerBytes,
} from '@vecrea/mdoc-cbor-ts';
import { randomBytes } from '@noble/hashes/utils';

// Prepare name spaces with date values using createTag1004 for date-only fields
const nameSpaces = nameSpacesRecordToMap({
  'org.iso.18013.5.1': {
    family_name: 'Doe',
    given_name: 'John',
    birth_date: createTag1004(new Date('1990-01-01')),
  },
});

// Build issuer-signed structure
const issuerSigned = buildIssuerSigned({
  docType: 'org.iso.18013.5.1.mDL',
  nameSpaces,
  randomBytes,
  deviceJwkPublicKey: devicePublicKeyJWK,
  digestAlgorithm: 'SHA-256',
  signed: new Date(),
  validFrom: new Date(),
  validUntil: new Date('2025-01-01'),
  expectedUpdate: new Date('2024-06-01'),
  x5chain: certificatePemToDerBytes(issuerCertificate),
  issuerJwkPrivateKey: issuerPrivateKeyJWK,
});
```

### Working with CBOR

```typescript
import { encodeCbor, decodeCbor } from '@vecrea/mdoc-cbor-ts';

const data = { name: 'John', age: 30 };
const encoded = encodeCbor(data);
const decoded = decodeCbor(encoded);
```

### Date Handling

The library uses CBOR tags for date values:

- **Tag(0)**: For date-time values (ISO 8601 format: `yyyy-MM-ddTHH:mm:ssZ`)
- **Tag(1004)**: For date-only values (ISO 8601 format: `yyyy-MM-dd`)

```typescript
import { createTag0, createTag1004 } from '@vecrea/mdoc-cbor-ts';

// Date-time (Tag 0)
const dateTime = createTag0(new Date('2024-03-20T15:30:45Z'));

// Date-only (Tag 1004)
const dateOnly = createTag1004(new Date('2024-03-20'));
```

### COSE Signatures

```typescript
import { Sign1, encodeSignature1 } from '@vecrea/mdoc-cbor-ts';

// Create and verify COSE_Sign1 signatures
const sign1 = new Sign1({
  protected: protectedHeaders,
  unprotected: unprotectedHeaders,
  payload: payload,
  signature: signature,
});

const isValid = await sign1.verify(publicKeyJWK, detachedPayload);
```

## API Overview

### Core Modules

- **`cbor`**: CBOR encoding and decoding utilities
- **`cose`**: COSE (CBOR Object Signing and Encryption) operations
- **`handlers`**: High-level handlers for issuance and verification
  - `issue`: Functions for building MDOC structures
  - `verify`: Functions for verifying MDOC structures
  - `to-object`: Converters for extracting structured data
- **`mdoc`**: MDOC-specific utilities and error handling
- **`query-lang`**: DCQL (Device Credential Query Language) support
- **`schemas`**: Zod schemas for MDOC structures
- **`session-transcript`**: Session transcript builders for OID4VP
- **`jwk-to-cose`** / **`cose-to-jwk`**: Key format conversions
- **`x509`**: X.509 certificate utilities

### Error Handling

The library uses `ErrorCodeError` with `MdocErrorCode` enum for structured error reporting:

```typescript
import { ErrorCodeError, MdocErrorCode } from '@vecrea/mdoc-cbor-ts';

try {
  // ... verification code
} catch (error) {
  if (error instanceof ErrorCodeError) {
    console.error('Error code:', error.code);
    console.error('Message:', error.message);
  }
}
```

## Documentation

- [Custom Namespace Verification Guide](./docs/how_to_verify_custom_namespace.md)

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm

### Setup

```bash
npm install
```

### Scripts

- `npm run build` - Build the library
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Testing

Tests are written using Vitest and stored in `__tests__` directories alongside the source files.

## License

Apache-2.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
