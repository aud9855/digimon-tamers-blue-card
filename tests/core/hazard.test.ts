// 02 13.6 디지털 해저드 1~10
import { describe, expect, it } from 'vitest';
import { enemyHitDamage } from '../../src/core/battle/damage';
import { startBattle } from '../../src/core/battle/start';
import {
  applyAction,
  applyRunResult,
  createInitialState,
  createProfile,
  defaultUnlocks,
  fullUnlocks,
  getLegalActions,
  type GameEvent,
  type GameState,
} from '../../src/core/index';
import { enterActClear } from '../../src/core/run/act';
import { generateMap } from '../../src/core/run/map';
import { enterRest, restHeal } from '../../src/core/run/rest';
import { enterBattleReward } from '../../src/core/run/reward';
import { enterShop, removalPrice } from '../../src/core/run/shop';
import { constants, getEnemy, getTamer } from '../../src/data/index';
import { makeBattle } from '../helpers/battle';

/** 해저드 hazard로 시작해 시작 칩까지 고른 상태 */
function run(hazard: number, seed = 1): GameState {
  const action =
    hazard > 0
      ? ({ type: 'startRun', tamerId: 'takato', hazard } as const)
      : ({ type: 'startRun', tamerId: 'takato' } as const);
  const s = applyAction(createInitialState(seed, fullUnlocks()), action).state;
  return applyAction(s, { type: 'chooseStartChip', index: 0 }).state;
}

/** run의 해저드 단계만 바꾼 복사본 */
function withHazard(state: GameState, hazard: number): GameState {
  const s = structuredClone(state);
  if (s.run) s.run.hazard = hazard;
  return s;
}

describe('해저드 고르기 (02 13.6)', () => {
  it('열린 단계까지만 고를 수 있음', () => {
    const unlocks = { ...defaultUnlocks(), hazard: 2 };
    const legal = getLegalActions(createInitialState(1, unlocks)).filter(
      (a) => a.type === 'startRun' && a.tamerId === 'takato',
    );
    expect(legal).toEqual([
      { type: 'startRun', tamerId: 'takato' },
      { type: 'startRun', tamerId: 'takato', hazard: 1 },
      { type: 'startRun', tamerId: 'takato', hazard: 2 },
    ]);
    expect(() =>
      applyAction(createInitialState(1, unlocks), {
        type: 'startRun',
        tamerId: 'takato',
        hazard: 3,
      }),
    ).toThrow();
  });

  it('고른 단계는 run.hazard에', () => {
    expect(run(0).run?.hazard).toBe(0);
    expect(run(7).run?.hazard).toBe(7);
  });

  it('해저드 N으로 이기면 N+1이 열림 (10까지, 낮은 단계로 이겨도 줄지 않음)', () => {
    const won = (hazard: number): GameState => ({ ...run(hazard), phase: 'runWon' });
    const p1 = applyRunResult(createProfile(), won(0), []);
    expect(p1.unlocks.hazard).toBe(1);
    const p2 = applyRunResult(p1, won(1), []);
    expect(p2.unlocks.hazard).toBe(2);
    expect(applyRunResult(p2, won(0), []).unlocks.hazard).toBe(2);
    expect(applyRunResult(p2, won(10), []).unlocks.hazard).toBe(10);
    expect(applyRunResult(p2, { ...run(2), phase: 'runLost' }, []).unlocks.hazard).toBe(2);
  });
});

describe('해저드 규칙 하나하나 (02 13.6)', () => {
  it('1: 적의 최대 HP +10% (내림), 9: 보스는 ×1.15를 더 곱함', () => {
    const base = run(0);
    const battle = (hazard: number, encounterId: string, kind: 'normal' | 'boss') => {
      const s = withHazard(base, hazard);
      startBattle(s, [], encounterId, kind);
      return s.battle?.enemies[0];
    };
    const goblin = getEnemy('goblimon').maxHp;
    const boss = getEnemy('mihiramon').maxHp;
    expect(battle(0, 'a1_easy_goblimon', 'normal')?.maxHp).toBe(goblin);
    expect(battle(1, 'a1_easy_goblimon', 'normal')).toMatchObject({
      maxHp: Math.floor((goblin * 110) / 100),
      hp: Math.floor((goblin * 110) / 100),
    });
    expect(battle(8, 'a1_boss_mihiramon', 'boss')?.maxHp).toBe(Math.floor((boss * 110) / 100));
    expect(battle(9, 'a1_boss_mihiramon', 'boss')?.maxHp).toBe(
      Math.floor((boss * 110 * 115) / 10000),
    );
    expect(battle(9, 'a1_easy_goblimon', 'normal')?.maxHp).toBe(Math.floor((goblin * 110) / 100));
  });

  it('2: 휴식 회복이 최대 HP의 20%', () => {
    const heal = (hazard: number) => {
      const s = withHazard(run(0), hazard);
      const r = s.run;
      if (!r) throw new Error('run 없음');
      r.hp = 1;
      enterRest(s, []);
      restHeal(s, []);
      return r.hp - 1;
    };
    const maxHp = run(0).run?.maxHp ?? 0;
    expect(heal(1)).toBe(Math.floor(maxHp * constants.REST_HEAL_PCT));
    expect(heal(2)).toBe(Math.floor(maxHp * 0.2));
  });

  it('3: 3·5행의 강적이 늘고 전투가 줆', () => {
    const count = (hazard: number) => {
      let elite = 0;
      let battle = 0;
      for (let seed = 1; seed <= 60; seed++) {
        const s = withHazard(run(0, seed), hazard);
        const map = generateMap(s, 1);
        for (const node of map.nodes) {
          if (node.row !== 3 && node.row !== 5) continue;
          if (node.type === 'elite') elite++;
          if (node.type === 'battle') battle++;
        }
      }
      return { elite, battle };
    };
    const before = count(2);
    const after = count(3);
    expect(after.elite).toBeGreaterThan(before.elite);
    expect(after.battle).toBeLessThan(before.battle);
  });

  it('4: 최대 HP -10% (내림), 5: 시작 덱에 버그 데이터 1장', () => {
    const tamer = getTamer('takato');
    const s3 = run(3);
    const s4 = run(4);
    const s5 = run(5);
    expect(s3.run?.maxHp).toBe(tamer.maxHp + bonusOf(s3));
    expect(s4.run?.maxHp).toBe(Math.floor((tamer.maxHp * 90) / 100) + bonusOf(s4));
    expect(s4.run?.hp).toBe(s4.run?.maxHp);
    expect(s4.run?.deck.some((c) => c.defId === 'bug_data')).toBe(false);
    expect(s5.run?.deck.filter((c) => c.defId === 'bug_data')).toHaveLength(1);
    expect(s5.run?.deck).toHaveLength(tamer.startDeck.length + 1);
  });

  it('6: 적의 공격 피해 ×1.1', () => {
    const at = (hazard: number) =>
      enemyHitDamage(makeBattle({ hazard, enemies: ['goblimon'] }), 20, 0).damage;
    const base = at(5);
    expect(at(6)).toBe(Math.floor(base * 1.1));
  });

  it('7: 막 클리어 회복이 최대 HP의 30%', () => {
    const heal = (hazard: number) => {
      const s = withHazard(run(0), hazard);
      const r = s.run;
      if (!r) throw new Error('run 없음');
      r.hp = 1;
      enterActClear(s, []);
      return r.hp - 1;
    };
    const maxHp = run(0).run?.maxHp ?? 0;
    expect(heal(6)).toBe(Math.floor(maxHp * constants.ACT_CLEAR_HEAL_PCT));
    expect(heal(7)).toBe(Math.floor(maxHp * 0.3));
  });

  it('8: 상점 가격 +20% (카드·칩·카드 지우기, 내림)', () => {
    const shop = (hazard: number) => {
      const s = withHazard(run(0), hazard);
      enterShop(s, []);
      if (s.pending?.kind !== 'shop') throw new Error('상점 아님');
      return { pending: s.pending, removal: removalPrice(s) };
    };
    const a = shop(7);
    const b = shop(8);
    a.pending.cards.forEach((c, i) =>
      expect(b.pending.cards[i]?.price).toBe(Math.floor((c.price * 120) / 100)),
    );
    a.pending.chips.forEach((c, i) =>
      expect(b.pending.chips[i]?.price).toBe(Math.floor((c.price * 120) / 100)),
    );
    expect(b.removal).toBe(Math.floor((a.removal * 120) / 100));
  });

  it('10: 전투 보상 카드 고르기가 2장', () => {
    const offer = (hazard: number) => {
      const s = withHazard(run(0), hazard);
      const events: GameEvent[] = [];
      enterBattleReward(s, events, 'normal');
      if (s.pending?.kind !== 'reward') throw new Error('보상 아님');
      return s.pending.offers.at(-1)?.cards.length;
    };
    expect(offer(9)).toBe(constants.CARD_OFFER_SIZE);
    expect(offer(10)).toBe(2);
  });
});

/** 시작 칩이 준 최대 HP (bit_scanner, heal_chip) */
function bonusOf(state: GameState): number {
  const chips = state.run?.chips ?? [];
  return (chips.includes('bit_scanner') ? 5 : 0) + (chips.includes('heal_chip') ? 10 : 0);
}
