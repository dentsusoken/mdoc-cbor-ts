/**
 * Invalid Mdoc Exception
 * @extends {Error}
 * @property {string} name - "InvalidMdoc"
 * @property {string} message - Exception message
 * @property {string} stack - Exception stack trace
 */
export class InvalidMdoc extends Error {
  name = 'InvalidMdoc';
}

/**
 *
 * Unsupported Mso Data Format Exception
 * @extends {Error}
 * @property {string} name - "UnsupportedMsoDataFormat"
 * @property {string} message - Exception message
 * @property {string} stack - Exception stack trace
 */
export class UnsupportedMsoDataFormat extends Error {
  name = 'UnsupportedMsoDataFormat';
}

/**
 *
 * Mso Private Key Required Exception
 * @extends {Error}
 * @property {string} name - "MsoPrivateKeyRequired"
 * @property {string} message - Exception message
 * @property {string} stack - Exception stack trace
 */
export class MsoPrivateKeyRequired extends Error {
  name = 'MsoPrivateKeyRequired';
}

/**
 *
 * Mso X509 Chain Not Found Exception
 * @extends {Error}
 * @property {string} name - "MsoX509ChainNotFound"
 * @property {string} message - Exception message
 * @property {string} stack - Exception stack trace
 */
export class MsoX509ChainNotFound extends Error {
  name = 'MsoX509ChainNotFound';
}
