# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-12

### Added

- Initial release of `@vecrea/mdoc-cbor-ts`
- **MDOC Issuance**: Support for building issuer-signed and device-signed documents according to ISO/IEC 18013-5
- **MDOC Verification**: Comprehensive verification of issuer signatures, device signatures, and document validity
- **CBOR Encoding/Decoding**: Full support for CBOR data structures with ISO/IEC 18013-5 compatibility
- **COSE Operations**: Support for COSE_Sign1 signatures and MAC operations
- **JWK/COSE Conversion**: Utilities to convert between JWK and COSE key formats
- **DCQL Support**: Device Credential Query Language (DCQL) selectors and utilities for querying documents
- **Custom Namespaces**: Ability to define and verify custom namespaces with Zod schemas
- **Session Transcripts**: Build session transcripts for OID4VP (OpenID for Verifiable Presentations)
- **X.509 Certificate Handling**: Support for certificate chain verification
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Structured error reporting with `ErrorCodeError` and `MdocErrorCode` enum
- **Date Handling**: Support for CBOR Tag(0) for date-time values and Tag(1004) for date-only values
- Comprehensive test suite with Vitest
- Documentation including README and custom namespace verification guide
