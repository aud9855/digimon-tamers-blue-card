// 02 3.5 카드 내기
import { constants } from '../../data/index';
import { cardFace, hasKeyword, requireBattle } from '../helpers';
import { triggerChips } from '../chips';
import type { CardInstance, Effect, GameEvent, GameState } from '../types';
import { runEffects } from './effects';
import { allEnemiesDead, battleStopped, winBattle } from './outcome';

/** 효과 중에 target 'enemy'가 하나라도 있으면 대상이 필요 (조건 효과 안쪽 포함) */
export function effectsNeedTarget(effects: readonly Effect[]): boolean {
  return effects.some((e) => {
    if (e.op === 'damage' || e.op === 'applyStatus') return e.target === 'enemy';
    if (e.op === 'ifStage' || e.op === 'ifEvolvedThisTurn') {
      return effectsNeedTarget(e.then) || effectsNeedTarget(e.else ?? []);
    }
    return false;
  });
}

export function cardNeedsTarget(card: CardInstance): boolean {
  return effectsNeedTarget(cardFace(card).effects);
}

/** 메모리를 cost만큼 써도 되는지 (02 3.6) */
export function canSpendMemory(state: GameState, cost: number): boolean {
  return requireBattle(state).memory - cost >= -constants.MAX_OVERDRAW;
}

/** 대상 없이 낼 수 있는지 (낼 수 있는 조건 중 대상을 뺀 것) */
export function isCardPlayable(state: GameState, card: CardInstance): boolean {
  if (state.phase !== 'battle') return false;
  if (hasKeyword(card, 'unplayable')) return false;
  return canSpendMemory(state, cardFace(card).cost);
}

/** 02 3.5 처리 순서 */
export function playCard(
  state: GameState,
  events: GameEvent[],
  cardUid: number,
  targetIndex: number | undefined,
): void {
  const battle = requireBattle(state);
  const handIndex = battle.hand.findIndex((c) => c.uid === cardUid);
  const card = battle.hand[handIndex];
  if (!card) throw new Error(`손패에 없는 카드: ${cardUid}`);
  const face = cardFace(card);

  // 1.
  battle.memory -= face.cost;
  events.push({ type: 'memoryChanged', memory: battle.memory });
  // 2.
  battle.hand.splice(handIndex, 1);
  events.push(
    targetIndex === undefined
      ? { type: 'cardPlayed', cardUid }
      : { type: 'cardPlayed', cardUid, targetIndex },
  );
  // 3. 패배하면 남은 처리를 모두 멈춤
  runEffects(state, events, face.effects, targetIndex === undefined ? {} : { targetIndex });
  if (battleStopped(state)) return;
  // 4.
  if (face.keywords?.includes('exhaust')) {
    battle.exhaustPile.push(card);
    events.push({ type: 'cardMoved', cardUid, to: 'exhaust' });
  } else {
    battle.discardPile.push(card);
    events.push({ type: 'cardMoved', cardUid, to: 'discard' });
  }
  // 5.
  triggerChips(state, events, 'onCardPlayed');
  if (battleStopped(state)) return;
  // 승리 (02 3.11)
  if (allEnemiesDead(state)) winBattle(state, events);
}
