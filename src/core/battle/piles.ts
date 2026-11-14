// 카드 더미 다루기. drawPile은 배열의 끝이 "맨 위"입니다.
import { constants } from '../../data/index';
import { newCardInstance, requireBattle } from '../helpers';
import { nextInt, shuffle } from '../rng';
import type { CardInstance, GameEvent, GameState } from '../types';
import { handSizeBonus } from '../chips';

/** 02 3.4 뽑기: 한 장씩. 뽑을 더미가 비면 버림 더미를 섞어 채움. 손패가 가득이면 바로 버림 */
export function drawCards(state: GameState, events: GameEvent[], count: number): void {
  const battle = requireBattle(state);
  for (let i = 0; i < count; i++) {
    if (battle.drawPile.length === 0) {
      if (battle.discardPile.length === 0) return;
      battle.drawPile = shuffle(state, 'battle', battle.discardPile);
      battle.discardPile = [];
      events.push({ type: 'deckShuffled' });
    }
    const card = battle.drawPile.pop();
    if (!card) return;
    events.push({ type: 'cardDrawn', cardUid: card.uid });
    putInHandOrDiscard(state, events, card);
  }
}

/** 손패가 HAND_LIMIT장이면 버림 더미로 */
export function putInHandOrDiscard(
  state: GameState,
  events: GameEvent[],
  card: CardInstance,
): 'hand' | 'discard' {
  const battle = requireBattle(state);
  if (battle.hand.length >= constants.HAND_LIMIT) {
    battle.discardPile.push(card);
    events.push({ type: 'cardMoved', cardUid: card.uid, to: 'discard' });
    return 'discard';
  }
  battle.hand.push(card);
  return 'hand';
}

/** 턴 시작에 뽑는 장수 */
export function turnDrawCount(state: GameState): number {
  return constants.HAND_SIZE + handSizeBonus(state);
}

/**
 * 임시 카드를 만들어 넣음 (02 4.3 addCard, 3.10.2 addCard).
 * 'hand'는 손패가 가득이면 버림 더미로 (3.4, 3.7과 같은 규칙). 'draw'는 무작위 위치.
 */
export function createTempCards(
  state: GameState,
  events: GameEvent[],
  cardId: string,
  to: 'hand' | 'discard' | 'draw',
  count: number,
): void {
  const battle = requireBattle(state);
  for (let i = 0; i < count; i++) {
    const card = newCardInstance(state, cardId, false, true);
    if (to === 'hand') {
      const where = battle.hand.length >= constants.HAND_LIMIT ? 'discard' : 'hand';
      if (where === 'hand') battle.hand.push(card);
      else battle.discardPile.push(card);
      events.push({ type: 'cardCreated', cardUid: card.uid, defId: cardId, to: where });
    } else if (to === 'discard') {
      battle.discardPile.push(card);
      events.push({ type: 'cardCreated', cardUid: card.uid, defId: cardId, to: 'discard' });
    } else {
      const position = nextInt(state, 'battle', battle.drawPile.length + 1);
      battle.drawPile.splice(position, 0, card);
      events.push({ type: 'cardCreated', cardUid: card.uid, defId: cardId, to: 'draw' });
    }
  }
}
