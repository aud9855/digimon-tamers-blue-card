// 02 7.2 상점
import { constants, getCard, getChips } from '../../data/index';
import { setPhase } from '../phase';
import { gainChip, isRandomChip } from '../chips';
import { requireRun } from '../helpers';
import { nextInt } from '../rng';
import type { GameEvent, GameState, Pending } from '../types';
import { addCardToDeck, gainBits, makeCardChoices } from './reward';

type ShopPending = Extract<Pending, { kind: 'shop' }>;

function cardPrice(defId: string): number {
  const price = constants.SHOP_CARD_PRICE[getCard(defId).rarity];
  if (price === undefined) throw new Error(`가격이 없는 카드: ${defId}`);
  return price;
}

/** 들어올 때 reward 난수로 진열을 정함 */
export function enterShop(state: GameState, events: GameEvent[]): void {
  const run = requireRun(state);
  const cards = makeCardChoices(state, 'reward', constants.SHOP_CARD_COUNT, constants.SHOP_WEIGHTS);
  const remaining = getChips().filter((c) => isRandomChip(c) && !run.chips.includes(c.id));
  const chips: ShopPending['chips'] = [];
  for (let i = 0; i < constants.SHOP_CHIP_COUNT && remaining.length > 0; i++) {
    const [pick] = remaining.splice(nextInt(state, 'reward', remaining.length), 1);
    if (pick) chips.push({ chipId: pick.id, price: constants.SHOP_CHIP_PRICE, sold: false });
  }
  state.pending = {
    kind: 'shop',
    cards: cards.map((c) => ({ defId: c.id, price: cardPrice(c.id), sold: false })),
    chips,
    removalUsed: false,
  };
  setPhase(state, events, 'shop');
}

export function requireShop(state: GameState): ShopPending {
  if (state.pending?.kind !== 'shop') throw new Error('상점이 아닙니다');
  return state.pending;
}

export function removalPrice(state: GameState): number {
  return constants.SHOP_REMOVE_BASE + constants.SHOP_REMOVE_STEP * requireRun(state).removalsBought;
}

export function canBuyCard(state: GameState, index: number): boolean {
  if (state.pending?.kind !== 'shop') return false;
  const item = state.pending.cards[index];
  return !!item && !item.sold && requireRun(state).bits >= item.price;
}

export function canBuyChip(state: GameState, index: number): boolean {
  if (state.pending?.kind !== 'shop') return false;
  const item = state.pending.chips[index];
  const run = requireRun(state);
  return !!item && !item.sold && run.bits >= item.price && !run.chips.includes(item.chipId);
}

export function canRemoveCard(state: GameState): boolean {
  if (state.pending?.kind !== 'shop') return false;
  return !state.pending.removalUsed && requireRun(state).bits >= removalPrice(state);
}

export function shopBuyCard(state: GameState, events: GameEvent[], index: number): void {
  const item = requireShop(state).cards[index];
  if (!item) throw new Error(`없는 진열 카드: ${index}`);
  gainBits(state, events, -item.price);
  item.sold = true;
  addCardToDeck(state, events, item.defId, false);
}

export function shopBuyChip(state: GameState, events: GameEvent[], index: number): void {
  const item = requireShop(state).chips[index];
  if (!item) throw new Error(`없는 진열 칩: ${index}`);
  gainBits(state, events, -item.price);
  item.sold = true;
  gainChip(state, events, item.chipId);
}

export function shopRemoveCard(state: GameState, events: GameEvent[], cardUid: number): void {
  const run = requireRun(state);
  const shop = requireShop(state);
  const i = run.deck.findIndex((c) => c.uid === cardUid);
  if (i < 0) throw new Error(`덱에 없는 카드: ${cardUid}`);
  gainBits(state, events, -removalPrice(state));
  run.deck.splice(i, 1);
  run.removalsBought += 1;
  shop.removalUsed = true;
  events.push({ type: 'cardMoved', cardUid, to: 'removed' });
}
