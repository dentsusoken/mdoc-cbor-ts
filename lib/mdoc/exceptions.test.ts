import {
  MissingIssuerAuth,
  MissingPrivateKey,
  NoDocumentTypeProvided,
  NoSignedDocumentProvided,
} from './exceptions';

describe('exceptions', () => {
  describe('MissingIssuerAuth', () => {
    it('should be an instance of Error', () => {
      expect(new MissingIssuerAuth()).toBeInstanceOf(Error);
    });
    it("should have a name of 'MissingIssuerAuth'", () => {
      expect(new MissingIssuerAuth().name).toBe('MissingIssuerAuth');
    });
  });
  describe('MissingPrivateKey', () => {
    it('should be an instance of Error', () => {
      expect(new MissingPrivateKey()).toBeInstanceOf(Error);
    });
    it("should have a name of 'MissingPrivateKey'", () => {
      expect(new MissingPrivateKey().name).toBe('MissingPrivateKey');
    });
  });
  describe('NoDocumentTypeProvided', () => {
    it('should be an instance of Error', () => {
      expect(new NoDocumentTypeProvided()).toBeInstanceOf(Error);
    });
    it("should have a name of 'NoDocumentTypeProvided'", () => {
      expect(new NoDocumentTypeProvided().name).toBe('NoDocumentTypeProvided');
    });
  });
  describe('NoSignedDocumentProvided', () => {
    it('should be an instance of Error', () => {
      expect(new NoSignedDocumentProvided()).toBeInstanceOf(Error);
    });
    it("should have a name of 'NoSignedDocumentProvided'", () => {
      expect(new NoSignedDocumentProvided().name).toBe(
        'NoSignedDocumentProvided'
      );
    });
  });
});
