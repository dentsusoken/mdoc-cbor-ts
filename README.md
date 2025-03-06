# mdoc-cbor-ts

A TypeScript implementation for handling Mobile Document (MDOC) issuance and verification according to ISO/IEC 18013-5 standard.

## Overview

This library provides functionality for:

- Issuing MDOCs (Mobile Documents) with issuer-signed and device-signed data
- Verifying MDOCs including MSO signatures and document schemas
- Handling X.509 certificates and keys
- Managing document name spaces and schemas

## Usage

### Issuing MDOCs

```typescript
import { MdocIssueHandlerImpl } from 'mdoc-cbor-ts';
import { Configuration } from 'mdoc-cbor-ts';
import { X509Adapter } from 'mdoc-cbor-ts';
import { COSEKey } from '@auth0/cose';

// Initialize configuration
const configuration = new Configuration({
  // Add your configuration options here
});

// Initialize X509 adapter
const x509Adapter = new X509Adapter({
  // Add your X509 adapter options here
});

// Create MDOC issue handler
const mdocIssueHandler = new MdocIssueHandlerImpl(configuration, x509Adapter);

// Issue MDOC
const deviceKey: COSEKey = {
  // Your device key configuration
};

const mdocData = {
  // Your MDOC data
};

try {
  const deviceResponse = await mdocIssueHandler.issue(mdocData, deviceKey);
  console.log('MDOC issued successfully:', deviceResponse);
} catch (error) {
  console.error('Failed to issue MDOC:', error);
}
```

### Verifying MDOCs

```typescript
import { MdocVerifyHandlerImpl } from 'mdoc-cbor-ts';

// Define name space schemas for document validation
const nameSpaceSchemas = {
  'org.iso.18013.5.1.mDL': {
    // Your mDL name space schema
  },
};

// Create MDOC verification handler
const mdocVerifyHandler = new MdocVerifyHandlerImpl(nameSpaceSchemas);

// Verify MDOC
const mdocString = '...'; // Your MDOC string

try {
  const result = await mdocVerifyHandler.verify(mdocString);
  if (result.valid) {
    console.log('MDOC verification successful');
    console.log('Validated documents:', result.documents);
  } else {
    console.log('MDOC verification failed');
  }
} catch (error) {
  console.error('Verification error:', error);
}
```

## Project Structure

```
lib/
├── adapters/      # Adapters for external services (X.509, etc.)
├── cbor/          # CBOR encoding/decoding utilities
├── conf/          # Configuration management
├── handlers/      # Core handlers for MDOC operations
│   ├── issue/     # MDOC issuance handlers
│   └── verify/    # MDOC verification handlers
└── schemas/       # Document schemas and validators
```

## License

[Add your license information here]
