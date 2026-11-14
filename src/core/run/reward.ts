// 02 7.1 전투 보상, 카드 고르기
import { constants, getCards, getChips } from '../../data/index';
import type { RarityWeights } from '../../data/constants';
import { setPhase } from '../phase';
import { battleBitsBonus, gainChip } from '../chips';
import { newCardInstance, requireRun } from '../helpers';
import { nextInt, weightedPick } from '../rng';
import type {
  BattleState,
  CardDef,
  CardOffer,
  GameEvent,
  GameState,
  Rarity,
  RngStream,
} from '../types';
import { enterActClear } from './act';

const OFFER_RARITIES: Rarity[] = ['common', 'uncommon', 'rare'];

/** 보상·상점에 나올 수 있는 카드 (02 4.1) */
export function offerableCards(state: GameState, rarity: Rarity): CardDef[] {
  const run = requireRun(state);
  return getCards().filter(
    (c) => c.rarity === rarity && (c.pool === run.tamerId || c.pool === 'neutral'),
  );
}

/** 희귀도를 못 찾았을 때 찾는 순서: 고른 것 → 낮은 쪽으로 → 그다음 높은 쪽으로 (02 7.1 3번) */
function rarityFallbackOrder(chosen: Rarity): Rarity[] {
  const i = OFFER_RARITIES.indexOf(chosen);
  const lower = OFFER_RARITIES.slice(0, i + 1).reverse();
  const higher = OFFER_RARITIES.slice(i + 1);
  return [...lower, ...higher];
}

/** 02 7.1 "카드 고르기 만들기". 같은 카드는 한 번만 나옴 */
export function makeCardChoices(
  state: GameState,
  stream: RngStream,
  count: number,
  weights: RarityWeights,
): CardDef[] {
  const entries = OFFER_RARITIES.map((r) => ({ item: r, weight: weights[r] ?? 0 })).filter(
    (e) => e.weight > 0,
  );
  const chosen: CardDef[] = [];
  for (let n = 0; n < count; n++) {
    const rarity = weightedPick(state, stream, entries);
    for (const r of rarityFallbackOrder(rarity)) {
      const candidates = offerableCards(state, r).filter((c) => !chosen.includes(c));
      if (candidates.length > 0) {
        const pick = candidates[nextInt(state, stream, candidates.length)];
        if (pick) chosen.push(pick);
        break;
      }
    }
  }
  return chosen;
}

export function makeOffer(
  state: GameState,
  count: number,
  weights: RarityWeights,
  upgraded: boolean,
): CardOffer {
  return {
    cards: makeCardChoices(state, 'reward', count, weights).map((c) => ({
      defId: c.id,
      upgraded,
    })),
  };
}

/** 대기 중인 카드 고르기에 하나를 더하고 reward 국면으로 */
export function pushOffer(state: GameState, offer: CardOffer, afterBoss: boolean): void {
  if (state.pending?.kind === 'reward') {
    state.pending.offers.push(offer);
  } else {
    state.pending = { kind: 'reward', offers: [offer], afterBoss };
  }
}

export function gainBits(state: GameState, events: GameEvent[], amount: number): void {
  const run = requireRun(state);
  run.bits += amount;
  events.push({ type: 'bitsChanged', bits: run.bits });
}

/** 가지지 않은 칩 중 무작위 1개. 없으면 비트 NO_CHIP_BITS (02 7.1). 받은 칩 id를 돌려줌 */
export function gainRandomChip(
  state: GameState,
  events: GameEvent[],
  stream: RngStream,
): string | null {
  const run = requireRun(state);
  const candidates = getChips().filter((c) => !run.chips.includes(c.id));
  const pick = candidates[candidates.length > 0 ? nextInt(state, stream, candidates.length) : 0];
  if (!pick) {
    gainBits(state, events, constants.NO_CHIP_BITS);
    return null;
  }
  gainChip(state, events, pick.id);
  return pick.id;
}

/** 덱에 카드 1장 */
export function addCardToDeck(
  state: GameState,
  events: GameEvent[],
  defId: string,
  upgraded: boolean,
): void {
  const run = requireRun(state);
  const card = newCardInstance(state, defId, upgraded);
  run.deck.push(card);
  events.push({ type: 'cardGained', cardUid: card.uid, defId });
}

function rollBits(state: GameState, range: { min: number; max: number }): number {
  return range.min + nextInt(state, 'reward', range.max - range.min + 1);
}

/**
 * 전투 보상의 카드 고르기 (02 7.1). 막에 따라 카드마다 강화되어 나올 수 있음 (02 12.2).
 * 확률이 0이면 난수를 쓰지 않습니다.
 */
function battleOffer(state: GameState, weights: RarityWeights): CardOffer {
  const offer = makeOffer(state, constants.CARD_OFFER_SIZE, weights, false);
  const chance = constants.UPGRADE_CHANCE[requireRun(state).act] ?? 0;
  if (chance > 0) {
    for (const card of offer.cards) {
      if (nextInt(state, 'reward', 100) < chance) card.upgraded = true;
    }
  }
  return offer;
}

/** 전투 승리 뒤 (02 7.1). 비트와 칩은 들어올 때 바로 받음 */
export function enterBattleReward(
  state: GameState,
  events: GameEvent[],
  kind: BattleState['kind'],
): void {
  const run = requireRun(state);

  if (kind === 'boss' && run.act >= constants.ACT_COUNT) {
    // 마지막 막 보스: 보상 없이 바로 승리
    state.pending = null;
    setPhase(state, events, 'runWon');
    events.push({ type: 'runEnded', won: true });
    return;
  }

  const bonus = battleBitsBonus(state);
  if (kind === 'normal') {
    gainBits(state, events, rollBits(state, constants.BITS_NORMAL) + bonus);
    pushOffer(state, battleOffer(state, constants.REWARD_WEIGHTS_NORMAL), false);
  } else if (kind === 'elite') {
    gainBits(state, events, rollBits(state, constants.BITS_ELITE) + bonus);
    gainRandomChip(state, events, 'reward');
    pushOffer(state, battleOffer(state, constants.REWARD_WEIGHTS_ELITE), false);
  } else {
    gainBits(state, events, rollBits(state, constants.BITS_BOSS) + bonus);
    pushOffer(state, battleOffer(state, constants.REWARD_WEIGHTS_BOSS), true);
  }
  setPhase(state, events, 'reward');
}

/** 고르기 하나를 끝냄. 남은 고르기가 없으면 map (보스 뒤면 actClear) */
function finishOffer(state: GameState, events: GameEvent[]): void {
  const pending = state.pending;
  if (pending?.kind !== 'reward') throw new Error('카드 고르기 중이 아닙니다');
  pending.offers.shift();
  if (pending.offers.length > 0) return;
  state.pending = null;
  if (pending.afterBoss) enterActClear(state, events);
  else setPhase(state, events, 'map');
}

export function pickCard(state: GameState, events: GameEvent[], index: number): void {
  const pending = state.pending;
  const choice = pending?.kind === 'reward' ? pending.offers[0]?.cards[index] : undefined;
  if (!choice) throw new Error(`고를 수 없는 카드: ${index}`);
  addCardToDeck(state, events, choice.defId, choice.upgraded);
  finishOffer(state, events);
}

export function skipCards(state: GameState, events: GameEvent[]): void {
  finishOffer(state, events);
}
