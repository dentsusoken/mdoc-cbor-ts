import { HashMap, NameSpace } from '../../schemas';
import { encode, Tag } from 'cbor';

// TODO: アルゴリズムを指定できるようにする
export type HashMapGenerator = (
  data: NameSpace,
  alg?: string
) => Promise<HashMap>;

export const defaultHashMapGenerator: HashMapGenerator = async (
  data,
  alg = 'SHA-256'
) => {
  const hashMap: HashMap = {};
  Object.entries(data).forEach(async ([key, value]) => {
    hashMap[key] = {};
    value.forEach(async (item) => {
      hashMap[key][item.value.digestID] = await crypto.subtle.digest(
        alg,
        encode(new Tag(encode(item.value), 24))
      );
    });
  });
  return hashMap;
};
