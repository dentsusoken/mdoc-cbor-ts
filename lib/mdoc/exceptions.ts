/**
 * Missing PrivateKey Exception
 * @extends {Error}
 * @property {string} name - "MissingPrivateKey"
 * @property {string} message - Exception message
 * @property {string} stack - Exception stack trace
 */
export class MissingPrivateKey extends Error {
  name = 'MissingPrivateKey';
}

/**
 *
 * No Document Type Provided Exception
 * @extends {Error}
 * @property {string} name - "NoDocumentTypeProvided"
 * @property {string} message - Exception message
 * @property {string} stack - Exception stack trace
 */
export class NoDocumentTypeProvided extends Error {
  name = 'NoDocumentTypeProvided';
}

/**
 *
 * No Signed Document Provided Exception
 * @extends {Error}
 * @property {string} name - "NoSignedDocumentProvided"
 * @property {string} message - Exception message
 * @property {string} stack - Exception stack trace
 */
export class NoSignedDocumentProvided extends Error {
  name = 'NoSignedDocumentProvided';
}

/**
 *
 * Missing IssuerAuth Chain Not Found Exception
 * @extends {Error}
 * @property {string} name - "MissingIssuerAuth"
 * @property {string} message - Exception message
 * @property {string} stack - Exception stack trace
 */
export class MissingIssuerAuth extends Error {
  name = 'MissingIssuerAuth';
}
