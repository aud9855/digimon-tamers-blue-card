// 막별 전투 배경 (04 B1). 직접 그린 도트이고, 다시 그리려면 scripts/art/battle-bg.mjs
import act1 from './stage/bg-act1.png';
import act2 from './stage/bg-act2.png';
import act3 from './stage/bg-act3.png';

const BACKGROUNDS = [act1, act2, act3] as const;

/** 막 번호(1부터) → 배경 주소. 막이 더 늘어나면 마지막 배경을 씀 */
export function battleBackground(act: number): string {
  return BACKGROUNDS[Math.min(BACKGROUNDS.length, Math.max(1, act)) - 1]!;
}
