// 02 7.4 보물, 7.5 이벤트·런 효과
import { constants, getEvent } from '../../data/index';
import { heal, loseHp } from '../battle/damage';
import { setPhase } from '../phase';
import { isUpgradable, requireRun, unreachable } from '../helpers';
import { nextInt } from '../rng';
import type { CardInstance, GameEvent, GameState, RunEffect } from '../types';
import {
  addCardToDeck,
  gainBits,
  gainRandomChip,
  makeOffer,
  offerableCards,
  pushOffer,
} from './reward';

/**
 * 런 효과 목록을 차례로 실행 (02 7.5). loseHp로 패배하면 멈춥니다.
 * offerCards는 카드 고르기를 대기열에 넣기만 하고, 국면은 부른 쪽이 정합니다.
 */
export function runRunEffects(
  state: GameState,
  events: GameEvent[],
  effects: readonly RunEffect[],
): void {
  for (const effect of effects) {
    if (state.phase === 'runLost') return;
    switch (effect.op) {
      case 'heal':
        heal(state, events, effect.amount);
        break;
      case 'loseHp':
        loseHp(state, events, effect.amount);
        break;
      case 'gainBits':
        gainBits(state, events, effect.amount);
        break;
      case 'addRandomCard': {
        const candidates = offerableCards(state, effect.rarity);
        const pick = candidates[nextInt(state, 'event', candidates.length)];
        if (!pick) throw new Error(`${effect.rarity} 카드가 없습니다`);
        addCardToDeck(state, events, pick.id, false);
        break;
      }
      case 'offerCards': {
        const weights = effect.rarity ? { [effect.rarity]: 1 } : constants.REWARD_WEIGHTS_NORMAL;
        pushOffer(state, makeOffer(state, effect.count, weights, effect.upgraded ?? false), false);
        break;
      }
      case 'addRandomChip':
        gainRandomChip(state, events, 'event');
        break;
      case 'addCard':
        addCardToDeck(state, events, effect.cardId, false);
        break;
      case 'changeMaxHp':
        changeMaxHp(state, events, effect.amount);
        break;
      case 'removeCard':
      case 'upgradeCard': {
        // 고를 카드가 있으면 고르기 국면 (02 14.2). 이 효과는 선택지의 맨 끝에만 있음
        const mode = effect.op === 'removeCard' ? 'remove' : 'upgrade';
        if (eventCardChoices(state, mode).length > 0) state.pending = { kind: 'eventCard', mode };
        break;
      }
      default:
        unreachable(effect, '런 효과');
    }
  }
}

/** 런 효과 뒤의 국면: 카드 고르기가 생겼으면 reward, 아니면 map */
export function afterRunEffects(state: GameState, events: GameEvent[]): void {
  if (state.phase === 'runLost') return;
  // 카드 고르기 효과: 국면은 event 그대로, 고르면 map으로 (02 14.2)
  if (state.pending?.kind === 'eventCard') return;
  if (state.pending?.kind === 'reward') setPhase(state, events, 'reward');
  else {
    state.pending = null;
    setPhase(state, events, 'map');
  }
}

export function enterEvent(state: GameState, events: GameEvent[], eventId: string): void {
  getEvent(eventId); // 없는 id면 예외
  state.pending = { kind: 'event', eventId };
  setPhase(state, events, 'event');
}

export function eventChoose(state: GameState, events: GameEvent[], index: number): void {
  if (state.pending?.kind !== 'event') throw new Error('이벤트 중이 아닙니다');
  const choice = getEvent(state.pending.eventId).choices[index];
  if (!choice) throw new Error(`없는 선택지: ${index}`);
  state.pending = null;
  runRunEffects(state, events, choice.effects);
  afterRunEffects(state, events);
}

/** 02 7.4: 들어올 때 가지지 않은 칩 중 무작위 1개 */
export function enterTreasure(state: GameState, events: GameEvent[]): void {
  requireRun(state);
  const chipId = gainRandomChip(state, events, 'reward');
  state.pending = { kind: 'treasure', chipId };
  setPhase(state, events, 'treasure');
}

/** 02 14.2 changeMaxHp: 1 아래로는 안 감. 늘면 HP도 같이, 줄면 HP를 새 최대까지 깎음 (패배 없음) */
function changeMaxHp(state: GameState, events: GameEvent[], amount: number): void {
  const run = requireRun(state);
  const before = run.maxHp;
  run.maxHp = Math.max(1, run.maxHp + amount);
  const delta = run.maxHp - before;
  if (delta > 0) run.hp += delta;
  run.hp = Math.min(run.hp, run.maxHp);
  events.push({ type: 'maxHpChanged', maxHp: run.maxHp, hp: run.hp });
}

/** 02 14.2: 이벤트 효과로 고를 수 있는 덱의 카드 */
export function eventCardChoices(state: GameState, mode: 'remove' | 'upgrade'): CardInstance[] {
  const deck = requireRun(state).deck;
  return mode === 'remove' ? deck : deck.filter(isUpgradable);
}

/** 02 14.2: 고른 카드를 지우거나 강화하고 지도로 */
export function eventPickCard(state: GameState, events: GameEvent[], cardUid: number): void {
  if (state.pending?.kind !== 'eventCard') throw new Error('카드 고르기 중이 아닙니다');
  const run = requireRun(state);
  const { mode } = state.pending;
  const card = eventCardChoices(state, mode).find((c) => c.uid === cardUid);
  if (!card) throw new Error(`고를 수 없는 카드: ${cardUid}`);
  if (mode === 'remove') {
    run.deck.splice(run.deck.indexOf(card), 1);
    events.push({ type: 'cardMoved', cardUid, to: 'removed' });
  } else {
    card.upgraded = true;
    events.push({ type: 'cardUpgraded', cardUid });
  }
  state.pending = null;
  setPhase(state, events, 'map');
}
