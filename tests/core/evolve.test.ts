import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getLegalActions } from '../../src/core/engine';
import { baseEvolveCost, evolveCost } from '../../src/core/battle/evolve';
import { previewEvolveCost } from '../../src/core/describe';
import { overrideRegistry } from '../../src/data/index';
import { act, battleOf, eventsOf, makeBattle, play } from '../helpers/battle';
import { baseFixtures } from '../helpers/fixtures';

let restore: () => void;
beforeEach(() => {
  restore = overrideRegistry(baseFixtures);
});
afterEach(() => restore());

describe('진화 비용 표 (02 3.7)', () => {
  it('열린 최고 단계별 6칸', () => {
    expect(baseEvolveCost('champion', 'champion')).toBe(3);
    expect(baseEvolveCost('champion', 'ultimate')).toBe(2);
    expect(baseEvolveCost('ultimate', 'ultimate')).toBe(3);
    expect(baseEvolveCost('champion', 'mega')).toBe(1);
    expect(baseEvolveCost('ultimate', 'mega')).toBe(2);
    expect(baseEvolveCost('mega', 'mega')).toBe(4);
  });

  it('최고 단계에 이르면 진화할 수 없다', () => {
    const state = makeBattle({ stage: 'champion', maxStage: 'champion' });
    expect(evolveCost(state)).toBeNull();
    expect(getLegalActions(state)).not.toContainEqual({ type: 'evolve' });
  });

  it('비용을 낼 수 없으면 (memory - cost < -3) 진화할 수 없다', () => {
    const state = makeBattle({ memory: -1 });
    expect(evolveCost(state)).toBe(3);
    expect(previewEvolveCost(state)).toBeNull();
    expect(getLegalActions(state)).not.toContainEqual({ type: 'evolve' });
  });
});

describe('진화 처리 (02 3.7)', () => {
  it('성장기 → 성숙기: 메모리, 임시 HP, 필살기 임시 카드, 표시', () => {
    const state = makeBattle({ memory: 3 });
    const { state: next, events } = act(state, { type: 'evolve' });
    const battle = battleOf(next);
    expect(battle.stage).toBe('champion');
    expect(battle.memory).toBe(0);
    expect(battle.tempHp).toBe(5);
    expect(battle.evolvedThisTurn).toBe(true);
    expect(battle.evolveCount).toBe(1);
    const sig = battle.hand.find((c) => c.defId === 'exhaust_flame');
    expect(sig?.temp).toBe(true);
    expect(eventsOf(events, 'evolved')[0]).toEqual({
      type: 'evolved',
      from: 'rookie',
      to: 'champion',
      cost: 3,
      tempHpGained: 5,
    });
  });

  it('성장기에서 궁극체까지 한 단계씩 진화 (메가로그라우몬·듀크몬)', () => {
    const state = makeBattle({ maxStage: 'mega', memory: 4 });
    // 비용: 성숙기 1, 완전체 2, 궁극체 4 → 4 - 1 - 2 = 1, 1 - 4 = -3 (가능)
    const s1 = act(state, { type: 'evolve' }).state;
    expect(battleOf(s1).stage).toBe('champion');
    expect(battleOf(s1).memory).toBe(3);
    const s2 = act(s1, { type: 'evolve' }).state;
    expect(battleOf(s2).stage).toBe('ultimate');
    expect(battleOf(s2).memory).toBe(1);
    const s3 = act(s2, { type: 'evolve' }).state;
    expect(battleOf(s3).stage).toBe('mega');
    expect(battleOf(s3).memory).toBe(-3);
    expect(battleOf(s3).tempHp).toBe(5 + 12 + 18);
    expect(
      battleOf(s3)
        .hand.map((c) => c.defId)
        .sort(),
    ).toEqual(['atomic_blaster', 'exhaust_flame', 'royal_saber'].sort());
    expect(battleOf(s3).evolveCount).toBe(3);
    expect(getLegalActions(s3)).not.toContainEqual({ type: 'evolve' });
  });

  it('형태 공격력은 지금 형태의 값 (쌓이지 않음)', () => {
    const state = makeBattle({ maxStage: 'mega', memory: 3, hand: ['strike'] });
    let s = act(state, { type: 'evolve' }).state;
    s = act(s, { type: 'evolve' }).state;
    // 완전체 power 2: 타격 6 + 2 = 8 (속성 none 상대)
    const after = play(s, 'strike', 0).state;
    expect(battleOf(after).enemies[0]?.hp).toBe(92);
  });

  it('손패가 가득이면 필살기는 버림 더미로', () => {
    const state = makeBattle({ hand: Array.from({ length: 10 }, () => 'strike') });
    const next = act(state, { type: 'evolve' }).state;
    expect(battleOf(next).hand).toHaveLength(10);
    expect(battleOf(next).discardPile.map((c) => c.defId)).toEqual(['exhaust_flame']);
  });

  it('freeEvolve면 비용 0이고 진화 뒤 꺼진다', () => {
    const state = makeBattle({ hand: ['blue_card'], memory: 0 });
    const s1 = play(state, 'blue_card').state;
    expect(previewEvolveCost(s1)).toBe(0);
    const s2 = act(s1, { type: 'evolve' }).state;
    expect(battleOf(s2).memory).toBe(0);
    expect(battleOf(s2).freeEvolve).toBe(false);
  });

  it('전투가 끝나면 단계·임시 HP·필살기가 모두 사라지고 HP만 남음', () => {
    const state = makeBattle({
      hand: ['strike'],
      hp: 40,
      deck: ['strike'],
      enemyOverrides: [{ hp: 1 }],
    });
    const evolved = act(state, { type: 'evolve' }).state;
    const won = play(evolved, 'strike', 0).state;
    expect(won.battle).toBeNull();
    expect(won.run?.hp).toBe(40);
    expect(won.run?.deck.map((c) => c.defId)).toEqual(['strike']);
  });

  it('임시 HP는 실드 다음, HP보다 먼저 깎인다', () => {
    const state = makeBattle({
      enemies: ['test_attacker'],
      hp: 50,
      drawPile: Array.from({ length: 10 }, () => 'guard'),
    });
    const evolved = act(state, { type: 'evolve' }).state;
    const next = act(evolved, { type: 'endTurn' }).state;
    // 공격 10, 임시 HP 5 → HP 5 감소
    expect(battleOf(next).tempHp).toBe(0);
    expect(next.run?.hp).toBe(45);
  });
});

describe('매트릭스 에볼루션 (02 13.1)', () => {
  const DRAW = Array.from({ length: 20 }, () => 'guard');

  it('궁극체가 되면 다음 턴부터 뽑는 장수 +2, 메모리 +1', () => {
    const state = makeBattle({
      maxStage: 'mega',
      stage: 'ultimate',
      memory: 4,
      maxMemory: 5,
      drawPile: DRAW,
    });
    const evolved = act(state, { type: 'evolve' }).state;
    expect(battleOf(evolved).stage).toBe('mega');
    const next = act(evolved, { type: 'endTurn' }).state;
    expect(battleOf(next).hand.filter((c) => c.defId === 'guard')).toHaveLength(5 + 2);
    expect(battleOf(next).memory).toBe(5 + 1);
  });

  it('완전체까지는 그대로', () => {
    const state = makeBattle({
      maxStage: 'mega',
      stage: 'champion',
      memory: 5,
      maxMemory: 5,
      drawPile: DRAW,
    });
    const evolved = act(state, { type: 'evolve' }).state;
    const next = act(evolved, { type: 'endTurn' }).state;
    expect(battleOf(next).hand.filter((c) => c.defId === 'guard')).toHaveLength(5);
    expect(battleOf(next).memory).toBe(5);
  });

  it('매트릭스 중에는 동료 효과가 꺼짐', () => {
    const state = makeBattle({
      maxStage: 'mega',
      stage: 'mega',
      companions: ['kenta', 'calumon'],
      drawPile: DRAW,
    });
    const { state: next, events } = act(state, { type: 'endTurn' });
    expect(events.some((e) => e.type === 'companionTriggered')).toBe(false);
    expect(battleOf(next).shield).toBe(0);
  });
});
