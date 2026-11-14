// 파트너 형태 (02 9.1)
import type { FormDef } from '../core/types';

export const forms = [
  {
    id: 'guilmon',
    name: '길몬',
    line: 'guilmon',
    stage: 'rookie',
    attribute: 'virus',
    tempHp: 0,
    power: 0,
  },
  {
    id: 'growlmon',
    name: '그라우몬',
    line: 'guilmon',
    stage: 'champion',
    attribute: 'virus',
    tempHp: 5,
    power: 1,
    signatureCardId: 'exhaust_flame',
  },
] satisfies FormDef[];
