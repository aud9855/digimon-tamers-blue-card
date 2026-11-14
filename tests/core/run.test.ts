import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { applyAction, getLegalActions, IllegalActionError } from '../../src/core/engine';
import { enterEvent, enterTreasure, runRunEffects } from '../../src/core/run/event';
import { enterRest } from '../../src/core/run/rest';
import { enterShop, removalPrice } from '../../src/core/run/shop';
import type { CardDef, GameEvent, GameState, Pending } from '../../src/core/types';
import { constants, getCard, getCards, getChips, overrideRegistry } from '../../src/data/index';
import { battleOf, eventsOf, makeBattle, play, randomChipIds, startedRun } from '../helpers/battle';
import { baseFixtures } from '../helpers/fixtures';

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry(baseFixtures);
});
afterEach(() => restore());

/** 런을 시작하고 첫 카드 고르기를 건너뛴 지도 국면 */
function mapState(seed = 1): GameState {
  return applyAction(startedRun(seed), { type: 'skipCards' }).state;
}

/** 한 방에 끝나는 전투에서 이김 */
function winBattle(
  kind: 'normal' | 'elite' | 'boss',
  opts: Parameters<typeof makeBattle>[0] = {},
): { state: GameState; events: GameEvent[] } {
  const state = makeBattle({ kind, hand: ['strike'], enemyOverrides: [{ hp: 1 }], ...opts });
  return play(state, 'strike', 0);
}

function rewardOf(state: GameState): Extract<Pending, { kind: 'reward' }> {
  if (state.pending?.kind !== 'reward') throw new Error('카드 고르기가 아님');
  return state.pending;
}

function shopOf(state: GameState): Extract<Pending, { kind: 'shop' }> {
  if (state.pending?.kind !== 'shop') throw new Error('상점이 아님');
  return state.pending;
}

function rarityOf(defId: string): CardDef['rarity'] {
  return getCard(defId).rarity;
}

describe('7.1 전투 보상', () => {
  it('일반: 비트 12~18, 카드 3장 고르기, 칩 없음', () => {
    const bits = new Set<number>();
    for (let seed = 1; seed <= 200; seed++) {
      const { state } = winBattle('normal', { seed });
      expect(state.phase).toBe('reward');
      const b = state.run?.bits ?? -1;
      expect(b).toBeGreaterThanOrEqual(12);
      expect(b).toBeLessThanOrEqual(18);
      bits.add(b);
      expect(state.run?.chips).toEqual([]);
      const offer = rewardOf(state).offers[0];
      expect(offer?.cards).toHaveLength(3);
      for (const c of offer?.cards ?? []) {
        expect(['common', 'uncommon', 'rare']).toContain(rarityOf(c.defId));
        expect(c.upgraded).toBe(false);
      }
    }
    expect(bits.size).toBe(7); // 양끝 포함
  });

  it('강적: 비트 28~35와 가지지 않은 칩 1개', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const { state, events } = winBattle('elite', { seed, chips: ['cube_shield'] });
      const bitsGained = eventsOf(events, 'bitsChanged')[0]?.bits ?? -1;
      expect(bitsGained).toBeGreaterThanOrEqual(28);
      expect(bitsGained).toBeLessThanOrEqual(35);
      expect(state.run?.chips).toHaveLength(2);
      expect(state.run?.chips[1]).not.toBe('cube_shield');
    }
  });

  it('칩을 받을 차례인데 가지지 않은 칩이 없으면 비트 50', () => {
    const allChips = randomChipIds();
    const { state } = winBattle('elite', { seed: 1, chips: allChips });
    expect(state.run?.chips).toEqual(allChips);
    const bits = state.run?.bits ?? 0;
    // 비트 주머니(+5)도 가졌음
    expect(bits).toBeGreaterThanOrEqual(28 + 50 + 5);
    expect(bits).toBeLessThanOrEqual(35 + 50 + 5);
  });

  it('보스 (마지막 막 아님): 비트 60, 희귀 카드 3장, 고르기 뒤 actClear', () => {
    const r2 = overrideRegistry({ constants: { ACT_COUNT: 2 } });
    try {
      const { state } = winBattle('boss');
      expect(state.run?.bits).toBe(60);
      const pending = rewardOf(state);
      expect(pending.afterBoss).toBe(true);
      for (const c of pending.offers[0]?.cards ?? []) expect(rarityOf(c.defId)).toBe('rare');
      const next = applyAction(state, { type: 'skipCards' }).state;
      expect(next.phase).toBe('actClear');
    } finally {
      r2();
    }
  });

  it('보스 (마지막 막): 보상 없이 바로 runWon', () => {
    const { state, events } = winBattle('boss', { act: 3 });
    expect(state.phase).toBe('runWon');
    expect(state.run?.bits).toBe(0);
    expect(eventsOf(events, 'runEnded')[0]?.won).toBe(true);
    expect(getLegalActions(state)).toEqual([]);
  });

  it('카드 고르기에는 같은 카드가 두 번 나오지 않는다', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const ids = rewardOf(winBattle('normal', { seed }).state).offers[0]?.cards.map(
        (c) => c.defId,
      );
      expect(new Set(ids).size).toBe(ids?.length);
    }
  });

  it('희귀도에 카드가 모자라면 낮은 쪽, 그다음 높은 쪽으로 찾고, 어디에도 없으면 비운다', () => {
    // 희귀를 모두 풀에서 빼면 보스 보상(희귀만)은 고급에서 찾음
    const noRare = getCards()
      .filter((c) => c.rarity === 'rare')
      .map((c) => ({ ...c, pool: 'none' as const }));
    const r2 = overrideRegistry({ cards: noRare, constants: { ACT_COUNT: 2 } });
    try {
      const offer = rewardOf(winBattle('boss').state).offers[0];
      expect(offer?.cards).toHaveLength(3);
      for (const c of offer?.cards ?? []) expect(rarityOf(c.defId)).toBe('uncommon');
    } finally {
      r2();
    }
    // 보상 카드가 2장뿐이면 고르기가 2장
    const onlyTwo = getCards()
      .filter((c) => ['common', 'uncommon', 'rare'].includes(c.rarity))
      .slice(2)
      .map((c) => ({ ...c, pool: 'none' as const }));
    const r3 = overrideRegistry({ cards: onlyTwo });
    try {
      expect(rewardOf(winBattle('normal').state).offers[0]?.cards).toHaveLength(2);
    } finally {
      r3();
    }
  });

  it('pickCard는 1장을 덱에, skipCards는 건너뜀. 끝나면 map', () => {
    const { state } = winBattle('normal', { deck: ['strike'] });
    const picked = applyAction(state, { type: 'pickCard', index: 2 }).state;
    expect(picked.run?.deck).toHaveLength(2);
    expect(picked.run?.deck[1]?.defId).toBe(rewardOf(state).offers[0]?.cards[2]?.defId);
    expect(picked.phase).toBe('map');
    expect(picked.pending).toBeNull();
    expect(() => applyAction(state, { type: 'pickCard', index: 3 })).toThrow(IllegalActionError);
  });
});

describe('7.2 상점', () => {
  function shopState(seed = 1, bits = 1000, chips: string[] = []): GameState {
    const state = mapState(seed);
    if (!state.run) throw new Error('런 없음');
    state.run.bits = bits;
    state.run.chips = chips;
    enterShop(state, []);
    return state;
  }

  it('카드 5장(겹치지 않음)과 가지지 않은 칩 2개, 가격은 희귀도별·칩 140', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const shop = shopOf(shopState(seed, 1000, ['cube_shield']));
      expect(shop.cards).toHaveLength(5);
      expect(new Set(shop.cards.map((c) => c.defId)).size).toBe(5);
      const prices: Record<string, number> = { common: 45, uncommon: 70, rare: 130 };
      for (const c of shop.cards) expect(c.price).toBe(prices[rarityOf(c.defId)]);
      expect(shop.chips).toHaveLength(2);
      for (const c of shop.chips) {
        expect(c.price).toBe(140);
        expect(c.chipId).not.toBe('cube_shield');
      }
      expect(new Set(shop.chips.map((c) => c.chipId)).size).toBe(2);
    }
  });

  it('남은 칩이 2개보다 적으면 있는 만큼만', () => {
    const allButOne = randomChipIds().slice(1);
    expect(shopOf(shopState(1, 1000, allButOne)).chips).toHaveLength(1);
  });

  it('사면 비트가 줄고 덱·칩에 들어가며 진열에서 사라짐', () => {
    const state = shopState();
    const shop = shopOf(state);
    const card = shop.cards[0];
    const s1 = applyAction(state, { type: 'shopBuyCard', index: 0 }).state;
    expect(s1.run?.bits).toBe(1000 - (card?.price ?? 0));
    expect(s1.run?.deck.at(-1)?.defId).toBe(card?.defId);
    expect(shopOf(s1).cards[0]?.sold).toBe(true);
    expect(() => applyAction(s1, { type: 'shopBuyCard', index: 0 })).toThrow(IllegalActionError);

    const chip = shop.chips[1];
    const s2 = applyAction(s1, { type: 'shopBuyChip', index: 1 }).state;
    expect(s2.run?.chips).toContain(chip?.chipId);
    expect(shopOf(s2).chips[1]?.sold).toBe(true);
  });

  it('비트가 모자라면 살 수 없다', () => {
    const state = shopState(1, 44);
    const legal = getLegalActions(state);
    expect(legal.filter((a) => a.type === 'shopBuyCard')).toHaveLength(0);
    expect(legal.filter((a) => a.type === 'shopBuyChip')).toHaveLength(0);
    expect(legal.filter((a) => a.type === 'shopRemoveCard')).toHaveLength(0);
    expect(legal).toContainEqual({ type: 'proceed' });
  });

  it('카드 지우기: 60 + 20 × 지운 횟수, 상점 한 곳에서 한 번만', () => {
    const state = shopState();
    expect(removalPrice(state)).toBe(60);
    const uid = state.run?.deck[0]?.uid ?? -1;
    const s1 = applyAction(state, { type: 'shopRemoveCard', cardUid: uid }).state;
    expect(s1.run?.deck.some((c) => c.uid === uid)).toBe(false);
    expect(s1.run?.bits).toBe(940);
    expect(s1.run?.removalsBought).toBe(1);
    expect(getLegalActions(s1).filter((a) => a.type === 'shopRemoveCard')).toHaveLength(0);

    // 다음 상점에서는 80
    const left = applyAction(s1, { type: 'proceed' }).state;
    expect(left.phase).toBe('map');
    enterShop(left, []);
    expect(removalPrice(left)).toBe(80);
  });
});

describe('7.3 휴식', () => {
  function restState(hp: number): GameState {
    const state = mapState();
    if (!state.run) throw new Error('런 없음');
    state.run.hp = hp;
    enterRest(state, []);
    return state;
  }

  it('restHeal: floor(maxHp × 0.3) 회복 (최대 HP까지), 그 뒤 map', () => {
    const healed = applyAction(restState(30), { type: 'restHeal' }).state;
    const maxHp = healed.run?.maxHp ?? 0;
    expect(healed.run?.hp).toBe(30 + Math.floor(maxHp * 0.3));
    expect(healed.phase).toBe('map');
    const capped = applyAction(restState(maxHp - 5), { type: 'restHeal' }).state;
    expect(capped.run?.hp).toBe(maxHp);
  });

  it('restUpgrade: 강화할 수 있는 카드 1장을 강화', () => {
    const state = restState(30);
    const uid = state.run?.deck[0]?.uid ?? -1;
    const next = applyAction(state, { type: 'restUpgrade', cardUid: uid }).state;
    expect(next.run?.deck[0]?.upgraded).toBe(true);
    expect(next.phase).toBe('map');
  });

  it('강화된 카드·저주는 고를 수 없고, 그런 카드뿐이면 회복만 가능', () => {
    const state = restState(30);
    if (!state.run) throw new Error('런 없음');
    for (const c of state.run.deck) c.upgraded = true;
    state.run.deck.push({ uid: 999, defId: 'bug_data', upgraded: false });
    expect(getLegalActions(state)).toEqual([{ type: 'restHeal' }]);
  });
});

describe('7.4 보물', () => {
  it('들어올 때 가지지 않은 칩 1개를 받고, proceed로 map', () => {
    const state = mapState();
    const before = state.run?.chips.length ?? 0;
    enterTreasure(state, []);
    expect(state.phase).toBe('treasure');
    expect(state.run?.chips).toHaveLength(before + 1);
    const next = applyAction(state, { type: 'proceed' }).state;
    expect(next.phase).toBe('map');
  });

  it('칩이 하나도 안 남았으면 비트 50', () => {
    const state = mapState();
    if (!state.run) throw new Error('런 없음');
    state.run.chips = randomChipIds();
    enterTreasure(state, []);
    expect(state.run.bits).toBe(50);
    expect(state.pending).toEqual({ kind: 'treasure', chipId: null });
  });
});

describe('7.5 이벤트와 런 효과', () => {
  it('heal / loseHp / gainBits / addCard', () => {
    const state = mapState();
    if (!state.run) throw new Error('런 없음');
    state.run.hp = 50;
    runRunEffects(
      state,
      [],
      [
        { op: 'heal', amount: 10 },
        { op: 'loseHp', amount: 3 },
        { op: 'gainBits', amount: 25 },
        { op: 'addCard', cardId: 'bug_data' },
      ],
    );
    expect(state.run.hp).toBe(57);
    expect(state.run.bits).toBe(25);
    expect(state.run.deck.at(-1)?.defId).toBe('bug_data');
  });

  it('loseHp로 0 이하가 되면 패배', () => {
    const state = mapState();
    if (!state.run) throw new Error('런 없음');
    state.run.hp = 5;
    enterEvent(state, [], 'card_pile');
    const next = applyAction(state, { type: 'eventChoose', index: 0 }).state;
    expect(next.phase).toBe('runLost');
  });

  it('addRandomCard: 그 희귀도의 카드 1장을 덱에', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const state = mapState(seed);
      enterEvent(state, [], 'calumon_play');
      const next = applyAction(state, { type: 'eventChoose', index: 1 }).state;
      expect(rarityOf(next.run?.deck.at(-1)?.defId ?? '')).toBe('common');
      expect(next.run?.deck).toHaveLength(11);
      expect(next.phase).toBe('map');
    }
  });

  it('offerCards: 카드 고르기를 만들고 reward 국면으로', () => {
    const state = mapState();
    enterEvent(state, [], 'card_pile');
    const next = applyAction(state, { type: 'eventChoose', index: 0 }).state;
    expect(next.phase).toBe('reward');
    expect(next.run?.hp).toBe((next.run?.maxHp ?? 0) - 5);
    expect(rewardOf(next).offers[0]?.cards).toHaveLength(3);
    expect(applyAction(next, { type: 'skipCards' }).state.phase).toBe('map');
  });

  it('offerCards의 rarity와 upgraded', () => {
    const state = mapState();
    runRunEffects(state, [], [{ op: 'offerCards', count: 3, upgraded: true, rarity: 'rare' }]);
    for (const c of rewardOf(state).offers[0]?.cards ?? []) {
      expect(rarityOf(c.defId)).toBe('rare');
      expect(c.upgraded).toBe(true);
    }
  });

  it('addRandomChip: 가지지 않은 칩 1개, 없으면 비트 50', () => {
    const state = mapState();
    const before = state.run?.chips.length ?? 0;
    runRunEffects(state, [], [{ op: 'addRandomChip' }]);
    expect(state.run?.chips).toHaveLength(before + 1);
    if (!state.run) throw new Error('런 없음');
    state.run.chips = randomChipIds();
    runRunEffects(state, [], [{ op: 'addRandomChip' }]);
    expect(state.run.bits).toBe(50);
  });

  it('아무 효과 없는 선택지도 map으로', () => {
    const state = mapState();
    enterEvent(state, [], 'card_pile');
    const next = applyAction(state, { type: 'eventChoose', index: 1 }).state;
    expect(next.phase).toBe('map');
    expect(next.run?.hp).toBe(next.run?.maxHp);
  });
});

describe('7.6 막 넘어가기 (ACT_COUNT 2로 줄여 확인)', () => {
  let restoreAct: () => void;
  beforeEach(() => {
    restoreAct = overrideRegistry({ constants: { ACT_COUNT: 2 } });
  });
  afterEach(() => restoreAct());

  it('보스 뒤 카드 고르기 → actClear → 2막 지도. 단계와 메모리가 오름', () => {
    const { state } = winBattle('boss', { hp: 20, maxHp: 75 });
    expect(state.phase).toBe('reward');
    const cleared = applyAction(state, { type: 'pickCard', index: 0 }).state;
    expect(cleared.phase).toBe('actClear');
    expect(cleared.run?.hp).toBe(20 + Math.floor(75 * 0.5));
    expect(cleared.run?.maxStage).toBe('ultimate');
    expect(cleared.run?.maxMemory).toBe(4);
    // 새로 열린 완전체의 형태 특성을 먼저 고름 (02 12.5)
    expect(getLegalActions(cleared)).toEqual([
      { type: 'chooseFormTrait', index: 0 },
      { type: 'chooseFormTrait', index: 1 },
    ]);
    const traited = applyAction(cleared, { type: 'chooseFormTrait', index: 1 }).state;
    expect(traited.run?.formTraits).toEqual({ ultimate: 'sharp' });
    expect(getLegalActions(traited)).toEqual([{ type: 'proceed' }]);

    const act2 = applyAction(traited, { type: 'proceed' }).state;
    expect(act2.phase).toBe('map');
    expect(act2.run?.act).toBe(2);
    expect(act2.run?.nodeId).toBeNull();
    expect(act2.run?.path).toEqual([]);
    const boss = act2.run?.map.nodes.find((n) => n.type === 'boss');
    expect(boss?.encounterId).toBe('a2_boss_zhuqiaomon');
    expect(boss?.id).toBe('a2_boss');
  });

  it('2막 보스(마지막 막)를 이기면 runWon', () => {
    const { state } = winBattle('boss', { act: 2 });
    expect(state.phase).toBe('runWon');
  });

  it('2막에서는 완전체까지 진화할 수 있다', () => {
    const state = makeBattle({ maxStage: 'ultimate', memory: 3 });
    const s1 = applyAction(state, { type: 'evolve' }).state;
    expect(battleOf(s1).memory).toBe(1); // 성숙기 비용 2
    const s2 = applyAction(s1, { type: 'evolve' }).state;
    expect(battleOf(s2).stage).toBe('ultimate');
    expect(battleOf(s2).memory).toBe(-2); // 완전체 비용 3
  });
});

describe('보상 국면 비트 상수', () => {
  it('상수와 문서 값이 같다', () => {
    expect(constants.BITS_NORMAL).toEqual({ min: 12, max: 18 });
    expect(constants.BITS_ELITE).toEqual({ min: 28, max: 35 });
    expect(constants.NO_CHIP_BITS).toBe(50);
  });
});

describe('12.2 보상 카드가 강화되어 나올 확률', () => {
  function upgradedRatio(act: number): number {
    let upgraded = 0;
    let total = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const offer = rewardOf(winBattle('normal', { seed, act }).state).offers[0];
      for (const c of offer?.cards ?? []) {
        total++;
        if (c.upgraded) upgraded++;
      }
    }
    return upgraded / total;
  }

  it('1막 0%, 2막 약 15%, 3막 약 30%', () => {
    expect(upgradedRatio(1)).toBe(0);
    const act2 = upgradedRatio(2);
    expect(act2).toBeGreaterThan(0.1);
    expect(act2).toBeLessThan(0.2);
    const act3 = upgradedRatio(3);
    expect(act3).toBeGreaterThan(0.24);
    expect(act3).toBeLessThan(0.36);
  });

  it('이벤트의 카드 고르기에는 쓰지 않는다', () => {
    const state = mapState();
    if (!state.run) throw new Error('런 없음');
    state.run.act = 3;
    for (let i = 0; i < 20; i++) {
      runRunEffects(state, [], [{ op: 'offerCards', count: 3 }]);
    }
    const all = rewardOf(state).offers.flatMap((o) => o.cards);
    expect(all.every((c) => !c.upgraded)).toBe(true);
  });
});

describe('숨은 칩과 시작 칩은 무작위로 나오지 않음 (02 12.3, 12.7)', () => {
  it('보물·상점·강적 보상의 칩 후보에서 빠진다', () => {
    const hidden = getChips()
      .filter((c) => c.hidden || c.start)
      .map((c) => c.id);
    expect(hidden.length).toBeGreaterThan(0);
    for (let seed = 1; seed <= 40; seed++) {
      const state = mapState(seed);
      const owned = [...(state.run?.chips ?? [])];
      enterTreasure(state, []);
      enterShop(state, []);
      const shop = shopOf(state);
      const gained = (state.run?.chips ?? []).filter((id) => !owned.includes(id));
      for (const id of [...gained, ...shop.chips.map((c) => c.chipId)]) {
        expect(hidden).not.toContain(id);
      }
    }
  });
});
