import { encode } from 'cbor-x';
import { TypedTag } from '../cbor';

export const formatMsoDateStr = (date: Date) => {
  return date.toISOString()?.split('.')[0] + 'Z';
};

export const encodeMsoDate = (date: Date) => {
  const str = formatMsoDateStr(date);
  return encode(new TypedTag(str, 0));
};
