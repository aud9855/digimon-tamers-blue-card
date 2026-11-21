// 02 15.1 변이 카드: 흐름, 효과 계산(해저드와 함께), 난수 줄기 따로, 옛 저장
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { enemyHitDamage } from '../../src/core/battle/damage';
import { startBattle } from '../../src/core/battle/start';
import { turnDrawCount } from '../../src/core/battle/piles';
import { battleBitsBonus, evolveCostDelta, handSizeBonus } from '../../src/core/chips';
import {
  applyAction,
  cloneState,
  createInitialState,
  defaultUnlocks,
  describeMutation,
  fullUnlocks,
  getLegalActions,
  type GameEvent,
  type GameState,
  type MutationDef,
  type MutationEffect,
} from '../../src/core/index';
import { describeMutationEffect } from '../../src/core/describe';
import { enterBattleReward } from '../../src/core/run/reward';
import { enterShop, removalPrice } from '../../src/core/run/shop';
import {
  constants,
  getChip,
  getEnemy,
  getMutation,
  getMutations,
  getTamer,
  overrideRegistry,
} from '../../src/data/index';
import { runOne } from '../../src/sim/runner';
import { parseSavedGame } from '../../src/ui/save';
import { eventsOf, makeBattle } from '../helpers/battle';

/** 판을 시작하고 시작 칩을 골라 변이 국면에 선 상태 */
function atMutation(seed = 1, tamerId: 'takato' | 'henry' = 'henry', hazard = 0): GameState {
  const action =
    hazard > 0
      ? ({ type: 'startRun', tamerId, hazard } as const)
      : ({ type: 'startRun', tamerId } as const);
  const s = applyAction(createInitialState(seed, fullUnlocks()), action).state;
  return applyAction(s, { type: 'chooseStartChip', index: 0 }).state;
}

/** 변이 국면에서 그 id를 고른 상태 (후보에 없으면 pending을 바꿔 고름: 테스트 전용) */
function withMutation(base: GameState, mutationId: string): GameState {
  const s = cloneState(base);
  if (s.pending?.kind !== 'mutation') throw new Error('변이 국면이 아님');
  s.pending.mutationIds = [mutationId];
  return applyAction(s, { type: 'chooseMutation', index: 0 }).state;
}

function skip(base: GameState): GameState {
  return applyAction(base, { type: 'skipMutation' }).state;
}

/** 지도에 선 상태의 run 해저드·변이만 바꾼 복사본 */
function runWith(state: GameState, opts: { hazard?: number; mutation?: string | null }) {
  const s = cloneState(state);
  if (!s.run) throw new Error('run 없음');
  if (opts.hazard !== undefined) s.run.hazard = opts.hazard;
  if (opts.mutation !== undefined) s.run.mutation = opts.mutation;
  return s;
}

describe('변이 고르기 흐름 (02 15.1)', () => {
  it('시작 칩 다음 국면은 mutation이고, 후보 3개 고르기와 건너뛰기만 할 수 있음', () => {
    const s = atMutation();
    expect(s.phase).toBe('mutation');
    if (s.pending?.kind !== 'mutation') throw new Error('pending 아님');
    const ids = s.pending.mutationIds;
    expect(ids).toHaveLength(constants.MUTATION_CHOICES);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(() => getMutation(id)).not.toThrow();
    expect(getLegalActions(s)).toEqual([
      { type: 'chooseMutation', index: 0 },
      { type: 'chooseMutation', index: 1 },
      { type: 'chooseMutation', index: 2 },
      { type: 'skipMutation' },
    ]);
    expect(() => applyAction(s, { type: 'chooseMutation', index: 3 })).toThrow();
    expect(() => applyAction(s, { type: 'proceed' })).toThrow();
  });

  it('고르면 run.mutation에 적고 mutationChosen, 그다음 지도', () => {
    const s = atMutation();
    if (s.pending?.kind !== 'mutation') throw new Error('pending 아님');
    const id = s.pending.mutationIds[1];
    const { state, events } = applyAction(s, { type: 'chooseMutation', index: 1 });
    expect(state.run?.mutation).toBe(id);
    expect(eventsOf(events, 'mutationChosen')).toEqual([
      { type: 'mutationChosen', mutationId: id },
    ]);
    expect(state.phase).toBe('map');
    expect(state.pending).toBeNull();
  });

  it('건너뛰면 null, 오유민은 테이머 특성(카드 고르기) 뒤 지도', () => {
    const { state, events } = applyAction(atMutation(1, 'takato'), { type: 'skipMutation' });
    expect(state.run?.mutation).toBeNull();
    expect(eventsOf(events, 'mutationChosen')).toEqual([
      { type: 'mutationChosen', mutationId: null },
    ]);
    expect(state.phase).toBe('reward');
    expect(applyAction(state, { type: 'skipCards' }).state.phase).toBe('map');
  });

  it('시작 칩 후보가 없으면 startRun 바로 뒤가 mutation', () => {
    const unlocks = { ...fullUnlocks(), startChips: [] };
    const s = applyAction(createInitialState(1, unlocks), {
      type: 'startRun',
      tamerId: 'henry',
    }).state;
    expect(s.phase).toBe('mutation');
  });

  it('후보는 mutation 흐름으로 섞은 앞의 3개: 같은 시드면 같고, 시드마다 고루 나옴', () => {
    expect(atMutation(5).pending).toEqual(atMutation(5).pending);
    const seen = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) {
      const p = atMutation(seed).pending;
      if (p?.kind === 'mutation') p.mutationIds.forEach((id) => seen.add(id));
    }
    expect(seen.size).toBe(getMutations().length);
  });
});

describe('난수 줄기가 따로 (02 15.1: 건너뛴 판은 변이 규칙이 없던 때와 같음)', () => {
  it('변이 국면은 mutation 줄기만 쓰고 다른 줄기는 그대로', () => {
    const s0 = applyAction(createInitialState(9, fullUnlocks()), {
      type: 'startRun',
      tamerId: 'rika',
    }).state;
    const s1 = applyAction(s0, { type: 'chooseStartChip', index: 0 }).state;
    const { mutation: m0, ...others0 } = s0.rng;
    const { mutation: m1, ...others1 } = s1.rng;
    expect(others1).toEqual(others0);
    expect(m1).not.toBe(m0);
  });

  it('mutation 줄기 값이 달라도 건너뛰면 판이 같음', () => {
    const s0 = applyAction(createInitialState(9, fullUnlocks()), {
      type: 'startRun',
      tamerId: 'takato',
    }).state;
    const other = cloneState(s0);
    other.rng.mutation = (other.rng.mutation + 12345) >>> 0;
    const a = skip(applyAction(s0, { type: 'chooseStartChip', index: 0 }).state);
    const b = skip(applyAction(other, { type: 'chooseStartChip', index: 0 }).state);
    expect(b.run).toEqual(a.run);
    const { mutation: _a, ...ra } = a.rng;
    const { mutation: _b, ...rb } = b.rng;
    expect([_a === _b, rb]).toEqual([false, ra]);
  });

  it('봇: 후보에 없는 변이를 정하면 건너뛰고, 변이 없는 판과 마지막 상태까지 같음', () => {
    // 시드 12345(골든)의 후보에 없는 변이를 찾음
    const s = applyAction(createInitialState(12345, fullUnlocks()), {
      type: 'startRun',
      tamerId: 'takato',
    }).state;
    const offered = applyAction(s, { type: 'chooseStartChip', index: 0 }).state.pending;
    if (offered?.kind !== 'mutation') throw new Error('변이 국면 아님');
    const missing = getMutations().find((m) => !offered.mutationIds.includes(m.id));
    if (!missing) throw new Error('후보 밖 변이가 없음');
    const base = runOne(12345, { policy: 'greedy', tamerId: 'takato', evolve: 'asap' });
    const forced = runOne(12345, {
      policy: 'greedy',
      tamerId: 'takato',
      evolve: 'asap',
      mutation: missing.id,
    });
    expect(forced.finalState).toEqual(base.finalState);
    expect(base.finalState.run?.mutation).toBeNull();
  });

  it('봇: 후보에 든 변이를 정하면 고름', () => {
    const s = atMutation(12345, 'takato');
    if (s.pending?.kind !== 'mutation') throw new Error('변이 국면 아님');
    const id = s.pending.mutationIds[2] ?? '';
    const record = runOne(12345, {
      policy: 'greedy',
      tamerId: 'takato',
      evolve: 'asap',
      mutation: id,
    });
    expect(record.finalState.run?.mutation).toBe(id);
  });
});

describe('변이 효과 계산 (02 15.1, 해저드 13.6 뒤)', () => {
  // 효과 하나씩 시험하는 변이 (테스트 전용)
  const probes: MutationDef[] = [
    { id: 't_hp_up', name: '시험', good: [{ op: 'maxHp', amount: 20 }], bad: [] },
    { id: 't_hp_down', name: '시험', good: [], bad: [{ op: 'maxHp', amount: -500 }] },
    { id: 't_bits_down', name: '시험', good: [], bad: [{ op: 'startBits', amount: -50 }] },
    { id: 't_reward_down', name: '시험', good: [], bad: [{ op: 'rewardCards', amount: -5 }] },
  ];
  let restore: () => void;
  beforeEach(() => {
    restore = overrideRegistry({ mutations: probes });
  });
  afterEach(() => restore());

  const onMap = skip(atMutation(3, 'henry'));
  const chipBonus = (s: GameState) =>
    (s.run?.chips ?? []).reduce((sum, id) => sum + (getChip(id).modifiers?.maxHpBonus ?? 0), 0);

  it('enemyHpPct: 해저드 1·9 뒤 floor(maxHp × (100 + pct) / 100), hp = maxHp', () => {
    const enemyAt = (
      hazard: number,
      mutation: string | null,
      enc: string,
      kind: 'normal' | 'boss',
    ) => {
      const s = runWith(onMap, { hazard, mutation });
      startBattle(s, [], enc, kind);
      return s.battle?.enemies[0];
    };
    const goblin = getEnemy('goblimon').maxHp;
    const boss = getEnemy('mihiramon').maxHp;
    // 해저드 없음
    expect(enemyAt(0, 'weak_wilds', 'a1_easy_goblimon', 'normal')).toMatchObject({
      maxHp: Math.floor((goblin * 85) / 100),
      hp: Math.floor((goblin * 85) / 100),
    });
    expect(enemyAt(0, 'wide_hand', 'a1_easy_goblimon', 'normal')?.maxHp).toBe(
      Math.floor((goblin * 115) / 100),
    );
    // 해저드 1과 함께: 해저드로 내림한 값에 다시 곱하고 내림
    const h1 = Math.floor((goblin * 110) / 100);
    expect(enemyAt(1, 'bit_hunter', 'a1_easy_goblimon', 'normal')?.maxHp).toBe(
      Math.floor((h1 * 110) / 100),
    );
    // 해저드 9 보스와 함께
    const h9 = Math.floor((boss * 110 * 110) / 10000);
    expect(enemyAt(9, 'weak_wilds', 'a1_boss_mihiramon', 'boss')).toMatchObject({
      maxHp: Math.floor((h9 * 85) / 100),
      hp: Math.floor((h9 * 85) / 100),
    });
    // 변이 없음은 그대로
    expect(enemyAt(0, null, 'a1_easy_goblimon', 'normal')?.maxHp).toBe(goblin);
  });

  it('enemyDamagePct: 3.8의 mult에 × (100 + pct) / 100, 해저드 6과 곱함, 내림은 한 번', () => {
    const dmg = (hazard: number, mutation?: string) =>
      enemyHitDamage(
        makeBattle({ hazard, enemies: ['goblimon'], ...(mutation ? { mutation } : {}) }),
        20,
        0,
      ).damage;
    const base = dmg(0);
    // 길몬(바이러스)과 고부리몬(바이러스): 속성 배율 1
    expect(base).toBe(20);
    expect(dmg(0, 'tough_body')).toBe(Math.floor(20 * 1.1));
    expect(dmg(0, 'quiet_night')).toBe(Math.floor(20 * 0.88));
    expect(dmg(6, 'tough_body')).toBe(
      Math.floor(20 * constants.HAZARD_ENEMY_DAMAGE_MULT * 1.1 + 1e-9),
    );
    expect(dmg(6, 'quiet_night')).toBe(
      Math.floor(20 * constants.HAZARD_ENEMY_DAMAGE_MULT * 0.88 + 1e-9),
    );
  });

  it('maxHp: 해저드 4 뒤 max(1, maxHp + amount), 칩의 maxHpBonus는 그 뒤, hp = maxHp', () => {
    const tamer = getTamer('henry');
    for (const hazard of [0, 4]) {
      const base = hazard >= 4 ? Math.floor((tamer.maxHp * 90) / 100) : tamer.maxHp;
      // 시작 칩 2번(비트 스캐너, maxHpBonus +10)과 함께
      const start = applyAction(
        applyAction(
          // 처음 해금 상태: 시작 칩이 데이터 순서대로 3개라 2번이 비트 스캐너
          createInitialState(1, { ...defaultUnlocks(), hazard: 10 }),
          hazard > 0
            ? { type: 'startRun', tamerId: 'henry', hazard }
            : { type: 'startRun', tamerId: 'henry' },
        ).state,
        { type: 'chooseStartChip', index: 2 },
      ).state;
      const bonus = chipBonus(start);
      expect(bonus).toBeGreaterThan(0);
      const plus = withMutation(start, 't_hp_up').run;
      expect(plus?.maxHp).toBe(base + 20 + bonus);
      expect(plus?.hp).toBe(plus?.maxHp);
      const rush = withMutation(start, 'rush_evolve').run;
      expect(rush?.maxHp).toBe(base - 12 + bonus);
      // 1 아래로 안 감: 칩 보너스는 그 뒤에 더함
      expect(withMutation(start, 't_hp_down').run?.maxHp).toBe(1 + bonus);
    }
  });

  it('startBits: 시작 비트에 더함, 0 아래로 안 감', () => {
    const start = atMutation(1, 'henry');
    const before = start.run?.bits ?? 0;
    const { state, events } = (() => {
      const s = cloneState(start);
      if (s.pending?.kind !== 'mutation') throw new Error('변이 국면 아님');
      s.pending.mutationIds = ['fat_wallet'];
      return applyAction(s, { type: 'chooseMutation', index: 0 });
    })();
    expect(state.run?.bits).toBe(before + 150);
    expect(eventsOf(events, 'bitsChanged').at(-1)?.bits).toBe(before + 150);
    expect(withMutation(start, 't_bits_down').run?.bits).toBe(0);
  });

  it('shopPricePct: 해저드 8 뒤 floor(가격 × (100 + pct) / 100) (카드·칩·카드 지우기)', () => {
    const shop = (hazard: number, mutation: string | null) => {
      const s = runWith(onMap, { hazard, mutation });
      enterShop(s, []);
      if (s.pending?.kind !== 'shop') throw new Error('상점 아님');
      return { pending: s.pending, removal: removalPrice(s) };
    };
    for (const hazard of [0, 8]) {
      const plain = shop(hazard, null);
      const fat = shop(hazard, 'fat_wallet');
      plain.pending.cards.forEach((c, i) =>
        expect(fat.pending.cards[i]?.price).toBe(Math.floor((c.price * 130) / 100)),
      );
      plain.pending.chips.forEach((c, i) =>
        expect(fat.pending.chips[i]?.price).toBe(Math.floor((c.price * 130) / 100)),
      );
      expect(fat.removal).toBe(Math.floor((plain.removal * 130) / 100));
    }
    // 해저드 8과 함께: 해저드로 내림한 값에 다시
    const h8 = Math.floor((constants.SHOP_CHIP_PRICE * 120) / 100);
    expect(shop(8, 'fat_wallet').pending.chips[0]?.price).toBe(Math.floor((h8 * 130) / 100));
  });

  it('rewardCards: 해저드 10 뒤에 더함, 1 이상', () => {
    const offer = (hazard: number, mutation: string | null) => {
      const s = runWith(onMap, { hazard, mutation });
      const events: GameEvent[] = [];
      enterBattleReward(s, events, 'normal');
      if (s.pending?.kind !== 'reward') throw new Error('보상 아님');
      return s.pending.offers.at(-1)?.cards.length;
    };
    expect(offer(0, 'many_choices')).toBe(constants.CARD_OFFER_SIZE + 1);
    expect(offer(0, 'weak_wilds')).toBe(constants.CARD_OFFER_SIZE - 1);
    expect(offer(10, 'many_choices')).toBe(constants.HAZARD_REWARD_OFFER_SIZE + 1);
    expect(offer(10, 'weak_wilds')).toBe(constants.HAZARD_REWARD_OFFER_SIZE - 1);
    expect(offer(10, 't_reward_down')).toBe(constants.MUTATION_MIN_REWARD_CARDS);
  });

  it('modifiers: 칩 보정 합에 evolveCostDelta·handSizeBonus·battleBitsBonus로 더해짐', () => {
    const at = (mutation?: string) =>
      makeBattle({
        chips: ['bit_scanner'],
        enemies: ['goblimon'],
        ...(mutation ? { mutation } : {}),
      });
    const plain = at();
    expect(evolveCostDelta(at('rush_evolve'))).toBe(evolveCostDelta(plain) - 1);
    expect(handSizeBonus(at('wide_hand'))).toBe(handSizeBonus(plain) + 1);
    expect(turnDrawCount(at('wide_hand'))).toBe(turnDrawCount(plain) + 1);
    expect(turnDrawCount(at('quiet_night'))).toBe(turnDrawCount(plain) - 1);
    // 칩(비트 스캐너 +10)과 함께 더함
    expect(battleBitsBonus(plain)).toBe(10);
    expect(battleBitsBonus(at('bit_hunter'))).toBe(25);
    // 실제 전투 보상 비트에도
    const bits = (mutation: string | null) => {
      const s = runWith(onMap, { mutation });
      const before = s.run?.bits ?? 0;
      enterBattleReward(s, [], 'boss');
      return (s.run?.bits ?? 0) - before;
    };
    expect(bits('bit_hunter')).toBe(bits(null) + 15);
  });
});

describe('변이 설명 글 (02 15.1)', () => {
  it('모든 변이에 좋은 점·나쁜 점 글이 있음', () => {
    for (const m of getMutations()) {
      const text = describeMutation(m.id);
      expect(text.good.length).toBeGreaterThan(0);
      expect(text.bad.length).toBeGreaterThan(0);
      expect(`${text.good}${text.bad}`).not.toContain('undefined');
    }
  });

  it('표의 글과 같음', () => {
    expect(describeMutation('weak_wilds')).toEqual({
      good: '모든 적 최대 HP -15%',
      bad: '전투 보상 카드 고르기 -1장',
    });
    expect(describeMutation('rush_evolve')).toEqual({ good: '진화 비용 -1', bad: '최대 HP -12' });
    expect(describeMutation('fat_wallet')).toEqual({
      good: '시작 비트 +150',
      bad: '상점 가격 +30%',
    });
    expect(describeMutation('quiet_night')).toEqual({
      good: '적의 공격 피해 -12%',
      bad: '턴 시작에 뽑는 카드 -1장',
    });
  });
});

// 효과 종류마다 처리·설명이 있는지 (effect-coverage와 같은 방식).
// SAMPLES의 타입이 모든 op를 요구하므로 새 변이 효과를 더하면 여기서 타입 오류가 납니다.
describe('변이 효과 종류 빠짐 검사', () => {
  const SAMPLES: { [K in MutationEffect['op']]: Extract<MutationEffect, { op: K }> } = {
    enemyHpPct: { op: 'enemyHpPct', pct: 10 },
    enemyDamagePct: { op: 'enemyDamagePct', pct: -10 },
    maxHp: { op: 'maxHp', amount: 5 },
    startBits: { op: 'startBits', amount: 5 },
    shopPricePct: { op: 'shopPricePct', pct: 10 },
    rewardCards: { op: 'rewardCards', amount: 1 },
    modifiers: { op: 'modifiers', modifiers: { evolveCostDelta: -1 } },
  };
  let restore: () => void;
  beforeEach(() => {
    restore = overrideRegistry({
      mutations: Object.values(SAMPLES).map((e) => ({
        id: `probe_${e.op}`,
        name: `시험 ${e.op}`,
        good: [e],
        bad: [],
      })),
    });
  });
  afterEach(() => restore());

  it.each(Object.values(SAMPLES))('$op: 설명 글이 있고, 고른 판을 끝까지 둘 수 있음', (effect) => {
    const text = describeMutationEffect(effect);
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toContain('undefined');
    let s = withMutation(atMutation(2, 'henry'), `probe_${effect.op}`);
    expect(s.run?.mutation).toBe(`probe_${effect.op}`);
    for (let i = 0; i < 400; i++) {
      const legal = getLegalActions(s);
      const action = legal.find((a) => a.type !== 'endTurn') ?? legal[0];
      if (!action) break;
      s = applyAction(s, action).state;
    }
  });
});

describe('옛 저장 (02 15.1)', () => {
  it('변이 필드와 mutation 줄기가 없는 저장은 변이 없음과 시드의 처음 값으로 채움', () => {
    const state = skip(atMutation(4, 'henry'));
    const old = JSON.parse(JSON.stringify(state)) as {
      run: Record<string, unknown>;
      rng: Record<string, unknown>;
      seed: number;
    };
    delete old.run.mutation;
    delete old.rng.mutation;
    const restored = parseSavedGame(JSON.stringify(old));
    expect(restored).not.toBeNull();
    expect(restored?.run?.mutation).toBeNull();
    expect(restored?.rng.mutation).toBe(createInitialState(4).rng.mutation);
    expect(restored?.rng.map).toBe(state.rng.map);
  });

  it('변이 국면의 저장은 그대로 이어 하고, 없는 변이 id가 든 저장은 버림', () => {
    const s = atMutation(4, 'henry');
    expect(parseSavedGame(JSON.stringify(s))).toEqual(s);
    const chosen = withMutation(s, 'tough_body');
    expect(parseSavedGame(JSON.stringify(chosen))?.run?.mutation).toBe('tough_body');
    const broken = cloneState(chosen);
    if (broken.run) broken.run.mutation = 'no_such_mutation';
    expect(parseSavedGame(JSON.stringify(broken))).toBeNull();
    const wrongPhase = { ...s, pending: null };
    expect(parseSavedGame(JSON.stringify(wrongPhase))).toBeNull();
  });
});
