import { Decoder, Encoder, Options } from 'cbor-x';

export * from './ByteString';
export * from './DateOnly';
export * from './DateTime';

const encoderDefaults: Options = {
  tagUint8Array: false,
  useRecords: false,
  mapsAsObjects: true,
  // @ts-ignore
  useTag259ForMaps: false,
};
export const encode = (
  input: unknown,
  options: Options = encoderDefaults
): Buffer => {
  const params = { ...encoderDefaults, ...options };
  const enc = new Encoder(params);
  return enc.encode(input);
};

export const decode = (
  obj: Uint8Array | Buffer,
  options: Options = encoderDefaults
): unknown => {
  const params = { ...encoderDefaults, ...options };
  const dec = new Decoder(params);
  return dec.decode(obj);
};
