import { Algorithms } from './types';
import { JwsAlgorithms } from '@/jws/types';

export const JWS_TO_COSE_ALGORITHMS: Record<JwsAlgorithms, Algorithms> = {
  [JwsAlgorithms.EdDSA]: Algorithms.EdDSA,
  [JwsAlgorithms.ES256]: Algorithms.ES256,
  [JwsAlgorithms.ES384]: Algorithms.ES384,
  [JwsAlgorithms.ES512]: Algorithms.ES512,
  [JwsAlgorithms.PS256]: Algorithms.PS256,
  [JwsAlgorithms.PS384]: Algorithms.PS384,
  [JwsAlgorithms.PS512]: Algorithms.PS512,
  [JwsAlgorithms.RS256]: Algorithms.RS256,
  [JwsAlgorithms.RS384]: Algorithms.RS384,
  [JwsAlgorithms.RS512]: Algorithms.RS512,
};
