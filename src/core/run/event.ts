// 02 7.4 보물, 7.5 이벤트·런 효과
import { constants, getEvent } from '../../data/index';
import { heal, loseHp } from '../battle/damage';
import { setPhase } from '../phase';
import { requireRun } from '../helpers';
import { nextInt } from '../rng';
import type { GameEvent, GameState, RunEffect } from '../types';
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
    }
  }
}

/** 런 효과 뒤의 국면: 카드 고르기가 생겼으면 reward, 아니면 map */
export function afterRunEffects(state: GameState, events: GameEvent[]): void {
  if (state.phase === 'runLost') return;
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
