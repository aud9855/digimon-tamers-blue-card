// 봇용 카드 값 추정 (게임 규칙이 아니라 봇의 판단). 효과 목록만 보고 대략의 값을 매김.
// greedy의 손 점수표(CARD_SCORES)에 없는 카드(새 카드)가 0점이 되지 않게 하는 데 씀.
// 효과 종류(op)를 새로 더하면 effectValue의 switch가 타입 오류로 알려 줌.
import { unreachable } from '../../core/helpers';
import type { CardDef, Effect } from '../../core/index';

/** 효과 하나의 대략 값 (메모리 1 ≈ 3점 기준) */
export function effectValue(effect: Effect): number {
  switch (effect.op) {
    case 'damage': {
      const hits = effect.hits ?? 1;
      const spread =
        effect.target === 'allEnemies' ? 1.5 : effect.target === 'randomEnemy' ? 0.9 : 1;
      return 0.5 * effect.amount * hits * spread;
    }
    case 'shield':
      return 0.45 * effect.amount;
    case 'draw':
      return 1.5 * effect.count;
    case 'gainMemory':
      return 2.5 * effect.amount;
    case 'heal':
      return 0.4 * effect.amount;
    case 'loseHp':
      return -0.4 * effect.amount;
    case 'applyStatus': {
      const per = effect.status === 'strength' ? 2.5 : 1.2;
      const spread = effect.target === 'allEnemies' ? 1.5 : 1;
      // 자기에게 거는 약화·취약은 손해, 적에게 거는 힘은 손해
      const good = (effect.status === 'strength') === (effect.target === 'self');
      return (good ? 1 : -1) * per * effect.amount * spread;
    }
    case 'freeEvolve':
      return 3;
    case 'addCard':
      // 저주 등을 넣는 카드도 있으니 값을 매기지 않음 (보정은 손 점수로)
      return 0;
    case 'ifStage':
    case 'ifEvolvedThisTurn':
    case 'ifPlayedThisTurn':
      // 조건이 맞을 때와 아닐 때의 가운데
      return (effectsValue(effect.then) + effectsValue(effect.else ?? [])) / 2;
    default:
      return unreachable(effect, '카드 효과');
  }
}

export function effectsValue(effects: readonly Effect[]): number {
  return effects.reduce((sum, e) => sum + effectValue(e), 0);
}

/** 손 점수표(CARD_SCORES)에 맞춘 눈금: 점수 ≈ BASE + 비용당 값 × SLOPE.
 *  2026-11-20에 손 점수표의 카드들로 최소제곱 맞춤 (평균 오차 약 0.8점) */
const SCORE_BASE = 2.9;
const SCORE_SLOPE = 0.62;
/** 효과만으로는 드러나지 않는 것: 기본 카드는 봇이 일부러 낮게, 희귀 카드는 높게 봄 */
const RARITY_BONUS: Record<CardDef['rarity'], number> = {
  basic: -3,
  common: 0,
  uncommon: 0,
  rare: 1.5,
  special: 0,
};

/** 비용 1당 효과 값 */
export function perCostValue(def: CardDef, upgraded = false): number {
  const face = upgraded ? def.upgraded : def.base;
  let value = effectsValue(face.effects);
  // 동료: 자리에 남아 여러 번 돕는 효과
  if (face.companion?.effects) value += 3 * effectsValue(face.companion.effects);
  const evolveDelta = face.companion?.modifiers?.evolveCostDelta ?? 0;
  value += -3 * evolveDelta;
  if (face.keywords?.includes('exhaust')) value *= 0.8;
  return value / Math.max(1, face.cost);
}

/** 카드 한 면의 추정 점수 (1~8, 저주는 -10). 손 점수표와 같은 눈금 */
export function estimateCardScore(def: CardDef, upgraded = false): number {
  if (def.type === 'curse') return -10;
  const raw = SCORE_BASE + perCostValue(def, upgraded) * SCORE_SLOPE + RARITY_BONUS[def.rarity];
  return Math.max(1, Math.min(8, Math.round(raw)));
}
