import { describe, expect, it } from 'vitest';
import { applyAction, getLegalActions, IllegalActionError } from '../../src/core/engine';
import { generateMap } from '../../src/core/run/map';
import { createInitialState } from '../../src/core/state';
import type { ActMap, GameState, MapNode } from '../../src/core/types';
import { constants, getCard, getEncounter, getEvents } from '../../src/data/index';

function mapFor(seed: number): ActMap {
  return generateMap(createInitialState(seed), 1);
}

function row(map: ActMap, r: number): MapNode[] {
  return map.nodes.filter((n) => n.row === r).sort((a, b) => a.col - b.col);
}

const SEEDS = Array.from({ length: 200 }, (_, i) => i + 1);

describe('지도 생성 (02 6절), 시드 200개', () => {
  it('1~7행, 행마다 2칸 또는 3칸, 열은 0~2', () => {
    for (const seed of SEEDS) {
      const map = mapFor(seed);
      for (let r = 1; r <= 7; r++) {
        const nodes = row(map, r);
        expect([2, 3]).toContain(nodes.length);
        for (const n of nodes) expect(n.col).toBeGreaterThanOrEqual(0);
        for (const n of nodes) expect(n.col).toBeLessThanOrEqual(2);
      }
    }
  });

  it('길: 다음 행에서 열 차이 1 이하인 모든 칸, 7행은 보스와', () => {
    for (const seed of SEEDS) {
      const map = mapFor(seed);
      for (let r = 1; r <= 7; r++) {
        for (const node of row(map, r)) {
          const expected =
            r === 7
              ? [map.bossNodeId]
              : row(map, r + 1)
                  .filter((n) => Math.abs(n.col - node.col) <= 1)
                  .map((n) => n.id);
          expect(node.next).toEqual(expected);
        }
      }
    }
  });

  it('모든 칸에 들어오는 길과 나가는 길이 하나 이상', () => {
    for (const seed of SEEDS) {
      const map = mapFor(seed);
      const incoming = new Set(map.nodes.flatMap((n) => n.next));
      for (const node of map.nodes) {
        if (node.row > 1) expect(incoming.has(node.id)).toBe(true);
        if (node.type !== 'boss') expect(node.next.length).toBeGreaterThan(0);
      }
    }
  });

  it('행별 칸 종류: 1행 전투, 2행 전투·이벤트, 3·5행 전투·강적·이벤트, 6행 전투·이벤트·상점, 7행 휴식', () => {
    const allowed: Record<number, string[]> = {
      1: ['battle'],
      2: ['battle', 'event'],
      3: ['battle', 'elite', 'event'],
      5: ['battle', 'event', 'elite'],
      6: ['battle', 'event', 'shop'],
      7: ['rest'],
    };
    for (const seed of SEEDS) {
      const map = mapFor(seed);
      for (const [r, types] of Object.entries(allowed)) {
        for (const n of row(map, Number(r))) expect(types).toContain(n.type);
      }
    }
  });

  it('4행: 첫 칸 보물, 둘째 칸 상점, 셋째 칸은 보물 또는 상점', () => {
    for (const seed of SEEDS) {
      const nodes = row(mapFor(seed), 4);
      expect(nodes[0]?.type).toBe('treasure');
      expect(nodes[1]?.type).toBe('shop');
      if (nodes[2]) expect(['treasure', 'shop']).toContain(nodes[2].type);
    }
  });

  it('보스 칸은 8행 1열에 하나, 보스 조우가 적혀 있음', () => {
    for (const seed of SEEDS) {
      const map = mapFor(seed);
      const bosses = map.nodes.filter((n) => n.type === 'boss');
      expect(bosses).toHaveLength(1);
      expect(bosses[0]).toMatchObject({ id: map.bossNodeId, row: 8, col: 1 });
      expect(getEncounter(bosses[0]?.encounterId ?? '').tier).toBe('boss');
    }
  });

  it('전투·강적·이벤트 칸에 맞는 난이도의 조우·이벤트가 적혀 있음', () => {
    const eventIds = getEvents().map((e) => e.id);
    for (const seed of SEEDS) {
      for (const node of mapFor(seed).nodes) {
        if (node.type === 'battle') {
          const tier = getEncounter(node.encounterId ?? '').tier;
          expect(tier).toBe(node.row <= 2 ? 'easy' : 'normal');
        } else if (node.type === 'elite') {
          expect(getEncounter(node.encounterId ?? '').tier).toBe('elite');
        } else if (node.type === 'event') {
          expect(eventIds).toContain(node.eventId);
        } else if (node.type !== 'boss') {
          expect(node.encounterId).toBeUndefined();
        }
      }
    }
  });

  it('주머니 뽑기: 같은 난이도 조우는 목록을 다 쓰기 전에 겹치지 않음', () => {
    for (const seed of SEEDS) {
      const map = mapFor(seed);
      const easy = map.nodes
        .filter((n) => n.type === 'battle' && n.row <= 2)
        .sort((a, b) => a.row - b.row || a.col - b.col)
        .map((n) => n.encounterId);
      expect(new Set(easy.slice(0, 4)).size).toBe(Math.min(easy.length, 4));
    }
  });

  it('같은 시드면 같은 지도, 다른 시드면 대체로 다른 지도', () => {
    expect(mapFor(7)).toEqual(mapFor(7));
    const distinct = new Set(SEEDS.slice(0, 20).map((s) => JSON.stringify(mapFor(s))));
    expect(distinct.size).toBeGreaterThan(15);
  });

  it('지도 행 수와 보스 위치는 상수에서 온다', () => {
    expect(constants.MAP_ROWS).toBe(7);
    expect(constants.BOSS_ROW).toBe(8);
  });
});

describe('런 시작과 이동 (02 8절, 6절 7번)', () => {
  function started(seed = 1): GameState {
    return applyAction(createInitialState(seed), { type: 'startRun', tamerId: 'takato' }).state;
  }

  it('startRun 뒤 국면이 reward이고 강화된 일반 카드 3장이 보임 (오유민 특성)', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const state = started(seed);
      expect(state.phase).toBe('reward');
      const offer = state.pending?.kind === 'reward' ? state.pending.offers[0] : undefined;
      expect(offer?.cards).toHaveLength(3);
      for (const c of offer?.cards ?? []) {
        expect(c.upgraded).toBe(true);
        expect(getCard(c.defId).rarity).toBe('common');
      }
      const ids = offer?.cards.map((c) => c.defId) ?? [];
      expect(new Set(ids).size).toBe(3);
    }
  });

  it('고르면 덱에 강화된 카드가 들어가고 map, 건너뛰면 덱 그대로 map', () => {
    const state = started();
    const picked = applyAction(state, { type: 'pickCard', index: 0 }).state;
    expect(picked.phase).toBe('map');
    expect(picked.run?.deck).toHaveLength(11);
    expect(picked.run?.deck.at(-1)?.upgraded).toBe(true);
    const skipped = applyAction(state, { type: 'skipCards' }).state;
    expect(skipped.phase).toBe('map');
    expect(skipped.run?.deck).toHaveLength(10);
  });

  it('시작 상태: HP 75, 비트 0, 최고 단계 성숙기, 메모리 3, 시작 덱 10장', () => {
    const run = started().run;
    expect(run).toMatchObject({ hp: 75, maxHp: 75, bits: 0, maxStage: 'champion', maxMemory: 3 });
    expect(run?.deck).toHaveLength(10);
  });

  it('처음에는 1행의 칸만, 그 뒤로는 이어진 칸만 고를 수 있다', () => {
    const state = applyAction(started(), { type: 'skipCards' }).state;
    const firstRow = row(state.run?.map ?? { nodes: [], bossNodeId: '' }, 1).map((n) => n.id);
    const legal = getLegalActions(state).map((a) => (a.type === 'chooseNode' ? a.nodeId : ''));
    expect(legal.sort()).toEqual(firstRow.sort());

    const second = state.run?.map.nodes.find((n) => n.row === 2);
    expect(() => applyAction(state, { type: 'chooseNode', nodeId: second?.id ?? '' })).toThrow(
      IllegalActionError,
    );
  });

  it('이어지지 않은 칸을 고르면 예외', () => {
    let state = applyAction(started(3), { type: 'skipCards' }).state;
    const first = getLegalActions(state)[0];
    if (!first) throw new Error('고를 칸이 없음');
    state = applyAction(state, first).state; // 1행 전투 시작
    expect(state.phase).toBe('battle');
    expect(state.run?.path).toHaveLength(1);
    const node = state.run?.map.nodes.find((n) => n.id === state.run?.nodeId);
    const notLinked = state.run?.map.nodes.find(
      (n) => n.row === 2 && !(node?.next ?? []).includes(n.id),
    );
    if (notLinked) {
      state.phase = 'map';
      state.battle = null;
      expect(() => applyAction(state, { type: 'chooseNode', nodeId: notLinked.id })).toThrow(
        IllegalActionError,
      );
    }
  });
});

describe('2·3막 지도 (02 12.1)', () => {
  it('그 막의 조우와, acts에 그 막이 든 이벤트만 나온다', () => {
    for (const act of [2, 3]) {
      for (let seed = 1; seed <= 50; seed++) {
        const map = generateMap(createInitialState(seed), act);
        for (const node of map.nodes) {
          if (node.encounterId) expect(getEncounter(node.encounterId).act).toBe(act);
          if (node.eventId) {
            expect(getEvents().find((e) => e.id === node.eventId)?.acts).toContain(act);
          }
        }
        expect(map.bossNodeId).toBe(`a${act}_boss`);
      }
    }
  });
});
