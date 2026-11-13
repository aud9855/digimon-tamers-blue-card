import { afterEach, describe, expect, it } from 'vitest';
import type { Effect, Rarity, TamerId } from '../../src/core/types';
import {
  constants,
  getAllEncounters,
  getCard,
  getCards,
  getChip,
  getChips,
  getEnemies,
  getEnemy,
  getEncounters,
  getEvents,
  getForm,
  getForms,
  getTamers,
  overrideRegistry,
} from '../../src/data/index';

function countBy<T>(items: readonly T[], key: (item: T) => string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    const k = key(item);
    result[k] = (result[k] ?? 0) + 1;
  }
  return result;
}

/** 조건 효과 안쪽까지 모든 효과를 펼칩니다. */
function flatten(effects: readonly Effect[]): Effect[] {
  return effects.flatMap((e) =>
    e.op === 'ifStage' || e.op === 'ifEvolvedThisTurn'
      ? [e, ...flatten(e.then), ...flatten(e.else ?? [])]
      : [e],
  );
}

function expectUniqueIds(list: readonly { id: string }[]): void {
  const ids = list.map((x) => x.id);
  expect(new Set(ids).size).toBe(ids.length);
}

const ID_PATTERN = /^[a-z][a-z0-9_]*$/;
const REWARD_RARITIES: Rarity[] = ['common', 'uncommon', 'rare'];

describe('0단계 콘텐츠 개수 (04 T0-3)', () => {
  it('카드 23개: 기본 3, 일반 9, 고급 6, 희귀 3, 필살기 1, 저주 1', () => {
    const all = getCards();
    expect(all).toHaveLength(23);
    expect(countBy(all, (c) => c.rarity)).toEqual({
      basic: 3,
      common: 9,
      uncommon: 6,
      rare: 3,
      special: 2,
    });
    expect(all.filter((c) => c.type === 'signature')).toHaveLength(1);
    expect(all.filter((c) => c.type === 'curse')).toHaveLength(1);
  });

  it('형태 2, 적 9, 조우 13, 칩 6, 이벤트 2, 테이머 1', () => {
    expect(getForms()).toHaveLength(2);
    expect(getEnemies()).toHaveLength(9);
    expect(getAllEncounters()).toHaveLength(13);
    expect(getChips()).toHaveLength(6);
    expect(getEvents()).toHaveLength(2);
    expect(getTamers()).toHaveLength(1);
  });

  it('조우 난이도별 개수: 쉬움 4, 보통 6, 강적 2, 보스 1 (02 9.4)', () => {
    expect(getEncounters(1, 'easy')).toHaveLength(4);
    expect(getEncounters(1, 'normal')).toHaveLength(6);
    expect(getEncounters(1, 'elite')).toHaveLength(2);
    expect(getEncounters(1, 'boss')).toHaveLength(1);
  });
});

describe('id (03 6절)', () => {
  it('종류마다 id가 겹치지 않는다', () => {
    expectUniqueIds(getCards());
    expectUniqueIds(getForms());
    expectUniqueIds(getEnemies());
    expectUniqueIds(getAllEncounters());
    expectUniqueIds(getChips());
    expectUniqueIds(getEvents());
    expectUniqueIds(getTamers());
    for (const enemy of getEnemies()) expectUniqueIds(enemy.moves);
  });

  it('id는 영문 소문자와 밑줄', () => {
    const all = [
      ...getCards(),
      ...getForms(),
      ...getEnemies(),
      ...getAllEncounters(),
      ...getChips(),
      ...getEvents(),
      ...getTamers(),
    ];
    for (const item of all) expect(item.id).toMatch(ID_PATTERN);
  });

  it('계열과 단계마다 형태가 하나뿐', () => {
    const keys = getForms().map((f) => `${f.line}/${f.stage}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('참조하는 id가 모두 있다', () => {
  it('조우 → 적', () => {
    for (const enc of getAllEncounters()) {
      expect(enc.enemies.length).toBeGreaterThan(0);
      for (const id of enc.enemies) expect(() => getEnemy(id)).not.toThrow();
    }
  });

  it('형태 → 필살기 카드', () => {
    for (const form of getForms()) {
      if (form.signatureCardId) {
        expect(getCard(form.signatureCardId).type).toBe('signature');
      }
    }
  });

  it('테이머 → 시작 덱 카드, 시작 칩, 성장기 형태', () => {
    for (const tamer of getTamers()) {
      for (const id of tamer.startDeck) expect(() => getCard(id)).not.toThrow();
      for (const id of tamer.startChips) expect(() => getChip(id)).not.toThrow();
      expect(() => getForm(tamer.line, 'rookie')).not.toThrow();
      expect(() => getForm(tamer.line, tamer.startMaxStage)).not.toThrow();
    }
  });

  it('이벤트 → 카드', () => {
    for (const ev of getEvents()) {
      for (const choice of ev.choices) {
        for (const effect of choice.effects) {
          if (effect.op === 'addCard') expect(() => getCard(effect.cardId)).not.toThrow();
        }
      }
    }
  });

  it('적 → 카드, 카드·칩 효과 → 카드', () => {
    for (const enemy of getEnemies()) {
      for (const move of enemy.moves) {
        for (const effect of move.effects) {
          if (effect.op === 'addCard') expect(() => getCard(effect.cardId)).not.toThrow();
        }
      }
    }
    const allEffects = [
      ...getCards().flatMap((c) => [...flatten(c.base.effects), ...flatten(c.upgraded.effects)]),
      ...getChips().flatMap((c) => flatten(c.effects ?? [])),
    ];
    for (const effect of allEffects) {
      if (effect.op === 'addCard') expect(() => getCard(effect.cardId)).not.toThrow();
    }
  });
});

describe('적', () => {
  it('페이즈의 순환·onEnter 행동 id가 그 적의 행동에 있다', () => {
    for (const enemy of getEnemies()) {
      const moveIds = new Set(enemy.moves.map((m) => m.id));
      expect(enemy.phases.length).toBeGreaterThan(0);
      for (const phase of enemy.phases) {
        expect(phase.cycle.length).toBeGreaterThan(0);
        for (const id of phase.cycle) expect(moveIds.has(id)).toBe(true);
        if (phase.onEnter) expect(moveIds.has(phase.onEnter)).toBe(true);
      }
    }
  });

  it('마지막 페이즈가 아닌 페이즈만 untilHpPct를 가진다', () => {
    for (const enemy of getEnemies()) {
      enemy.phases.forEach((phase, i) => {
        const isLast = i === enemy.phases.length - 1;
        if (isLast) expect(phase.untilHpPct).toBeUndefined();
        else expect(phase.untilHpPct).toBeGreaterThan(0);
      });
    }
  });

  it('보스는 속성 none', () => {
    for (const enemy of getEnemies().filter((e) => e.tier === 'boss')) {
      expect(enemy.attribute).toBe('none');
    }
  });

  it('조우의 난이도와 적의 구분이 맞다', () => {
    for (const enc of getAllEncounters()) {
      const expected = enc.tier === 'elite' ? 'elite' : enc.tier === 'boss' ? 'boss' : 'normal';
      for (const id of enc.enemies) expect(getEnemy(id).tier).toBe(expected);
    }
  });

  it('막마다 일반 적 속성이 2:2:2', () => {
    const acts = new Set(getAllEncounters().map((e) => e.act));
    for (const act of acts) {
      const ids = new Set(
        getAllEncounters()
          .filter((e) => e.act === act && (e.tier === 'easy' || e.tier === 'normal'))
          .flatMap((e) => e.enemies),
      );
      const attrs = countBy([...ids], (id) => getEnemy(id).attribute);
      expect(attrs).toEqual({ vaccine: 2, data: 2, virus: 2 });
    }
  });

  it('막마다 쉬움·보통·강적·보스 조우가 하나 이상', () => {
    for (let act = 1; act <= constants.ACT_COUNT; act++) {
      for (const tier of ['easy', 'normal', 'elite', 'boss'] as const) {
        expect(getEncounters(act, tier).length).toBeGreaterThan(0);
      }
    }
  });
});

describe('카드', () => {
  it('모든 카드에 두 면이 있다', () => {
    for (const card of getCards()) {
      expect(card.base).toBeDefined();
      expect(card.upgraded).toBeDefined();
      expect(card.base.cost).toBeGreaterThanOrEqual(0);
      expect(card.upgraded.cost).toBeGreaterThanOrEqual(0);
    }
  });

  it('필살기는 두 면 모두 retain을 가진다', () => {
    for (const card of getCards().filter((c) => c.type === 'signature')) {
      expect(card.base.keywords).toContain('retain');
      expect(card.upgraded.keywords).toContain('retain');
    }
  });

  it('필살기·저주는 special 희귀도이고 풀이 none (02 4.1)', () => {
    for (const card of getCards()) {
      const special = card.type === 'signature' || card.type === 'curse';
      expect(card.rarity === 'special').toBe(special);
      if (special) expect(card.pool).toBe('none');
    }
  });

  it('보상에 나오는 희귀도마다 테이머 풀 카드가 3장 이상', () => {
    for (const tamer of getTamers()) {
      for (const rarity of REWARD_RARITIES) {
        const pool = getCards().filter(
          (c) => c.rarity === rarity && (c.pool === tamer.id || c.pool === 'neutral'),
        );
        expect(pool.length).toBeGreaterThanOrEqual(constants.CARD_OFFER_SIZE);
      }
    }
  });

  it('0단계에서는 기본~희귀 카드가 모두 takato 풀 (02 4.1)', () => {
    const takato: TamerId = 'takato';
    for (const card of getCards().filter((c) => c.rarity !== 'special')) {
      expect(card.pool).toBe(takato);
    }
  });

  it('효과의 수치가 0 이상 정수이고 hits는 1 이상', () => {
    for (const card of getCards()) {
      for (const e of [...flatten(card.base.effects), ...flatten(card.upgraded.effects)]) {
        if ('amount' in e) expect(Number.isInteger(e.amount) && e.amount >= 0).toBe(true);
        if ('count' in e) expect(Number.isInteger(e.count) && e.count >= 1).toBe(true);
        if (e.op === 'damage' && e.hits !== undefined) expect(e.hits).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe('칩', () => {
  it('발동 시점과 효과가 함께 있거나, 수치 보정만 있다', () => {
    for (const chip of getChips()) {
      const triggered = chip.trigger !== undefined;
      expect(triggered).toBe((chip.effects?.length ?? 0) > 0);
      expect(triggered || chip.modifiers !== undefined).toBe(true);
    }
  });

  it("칩 효과는 target 'enemy'를 쓰지 않는다 (02 5절)", () => {
    for (const chip of getChips()) {
      for (const e of flatten(chip.effects ?? [])) {
        if ('target' in e) expect(e.target).not.toBe('enemy');
      }
    }
  });
});

describe('테이머·상수', () => {
  it('오유민 시작 덱: 타격 4, 방어 4, 파이어 볼 1, 록 브레이커 1 (02 8절)', () => {
    const [takato] = getTamers();
    expect(takato?.startDeck).toHaveLength(10);
    expect(countBy(takato?.startDeck ?? [], (id) => id)).toEqual({
      strike: 4,
      guard: 4,
      fire_ball: 1,
      rock_breaker: 1,
    });
  });

  it('지도 행 규칙이 MAP_ROWS개이고 가중치 칸 종류가 올바르다', () => {
    expect(constants.MAP_ROW_RULES).toHaveLength(constants.MAP_ROWS);
    for (const row of constants.MAP_ROW_RULES) {
      const total = Object.values(row.weights).reduce((a, b) => a + (b ?? 0), 0);
      expect(total).toBeGreaterThan(0);
      expect(row.weights.boss).toBeUndefined();
    }
  });
});

describe('overrideRegistry (03 8.1)', () => {
  let restore: (() => void) | null = null;
  afterEach(() => {
    restore?.();
    restore = null;
  });

  it('정의를 덧붙이고 같은 id는 바꾸며, 되돌리면 원래대로', () => {
    const originalStrike = getCard('strike');
    restore = overrideRegistry({
      cards: [
        { ...originalStrike, name: '바뀐 타격' },
        { ...originalStrike, id: 'test_card', name: '시험 카드' },
      ],
      constants: { ACT_COUNT: 2 },
    });
    expect(getCard('strike').name).toBe('바뀐 타격');
    expect(getCard('test_card').name).toBe('시험 카드');
    expect(constants.ACT_COUNT).toBe(2);

    restore();
    restore = null;
    expect(getCard('strike').name).toBe('타격');
    expect(() => getCard('test_card')).toThrow();
    expect(constants.ACT_COUNT).toBe(1);
  });

  it('없는 id를 찾으면 예외', () => {
    expect(() => getCard('no_such_card')).toThrow();
    expect(() => getEnemy('no_such_enemy')).toThrow();
    expect(() => getForm('guilmon', 'mega')).toThrow();
  });
});
