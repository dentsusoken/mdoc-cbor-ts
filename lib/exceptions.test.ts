import {
  InvalidMdoc,
  MsoPrivateKeyRequired,
  MsoX509ChainNotFound,
  UnsupportedMsoDataFormat,
} from './exceptions';

describe('exceptions', () => {
  describe('InvalidMdoc', () => {
    it('should be an instance of Error', () => {
      expect(new InvalidMdoc()).toBeInstanceOf(Error);
    });
    it("should have a name of 'InvalidMdoc'", () => {
      expect(new InvalidMdoc().name).toBe('InvalidMdoc');
    });
  });
  describe('MsoPrivateKeyRequired', () => {
    it('should be an instance of Error', () => {
      expect(new MsoPrivateKeyRequired()).toBeInstanceOf(Error);
    });
    it("should have a name of 'MsoPrivateKeyRequired'", () => {
      expect(new MsoPrivateKeyRequired().name).toBe('MsoPrivateKeyRequired');
    });
  });
  describe('MsoX509ChainNotFound', () => {
    it('should be an instance of Error', () => {
      expect(new MsoX509ChainNotFound()).toBeInstanceOf(Error);
    });
    it("should have a name of 'MsoX509ChainNotFound'", () => {
      expect(new MsoX509ChainNotFound().name).toBe('MsoX509ChainNotFound');
    });
  });
  describe('UnsupportedMsoDataFormat', () => {
    it('should be an instance of Error', () => {
      expect(new UnsupportedMsoDataFormat()).toBeInstanceOf(Error);
    });
    it("should have a name of 'UnsupportedMsoDataFormat'", () => {
      expect(new UnsupportedMsoDataFormat().name).toBe(
        'UnsupportedMsoDataFormat'
      );
    });
  });
});
