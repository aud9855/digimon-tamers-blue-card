// 02 6절 지도 생성·이동
import { constants, getEncounters, getEvents } from '../../data/index';
import { hazardOn } from '../helpers';
import { nextInt, shuffle, weightedPick } from '../rng';
import type { ActMap, EncounterDef, GameState, MapNode, NodeType } from '../types';

function nodeId(act: number, row: number, col: number): string {
  return `a${act}_r${row}_c${col}`;
}

function weightEntries<K extends string>(weights: Partial<Record<K, number>>) {
  return (Object.entries(weights) as [K, number][]).map(([item, weight]) => ({ item, weight }));
}

/** 주머니 뽑기: 목록을 섞어 하나씩 꺼내고, 다 쓰면 다시 섞음 (02 6절 5번) */
function makeBag<T>(state: GameState, items: readonly T[]): () => T {
  let bag: T[] = [];
  return () => {
    if (items.length === 0) throw new Error('주머니에 넣을 것이 없습니다');
    if (bag.length === 0) bag = shuffle(state, 'map', items);
    const item = bag.shift();
    if (item === undefined) throw new Error('주머니가 비었습니다');
    return item;
  };
}

/** 해저드 3: 정해진 행에서 강적 +15, 전투 -15 (0 아래로는 안 내려감, 02 13.6) */
function rowWeights(
  state: GameState,
  row: number,
  weights: Partial<Record<NodeType, number>>,
): Partial<Record<NodeType, number>> {
  if (!hazardOn(state, 'mapRows') || !constants.HAZARD_MAP_ROWS.includes(row)) return weights;
  return {
    ...weights,
    battle: Math.max(0, (weights.battle ?? 0) + constants.HAZARD_MAP_BATTLE_DELTA),
    elite: (weights.elite ?? 0) + constants.HAZARD_MAP_ELITE_DELTA,
  };
}

export function generateMap(state: GameState, act: number): ActMap {
  const rows: MapNode[][] = [];

  // 1. 칸 놓기 (1행부터 7행까지)
  for (let row = 1; row <= constants.MAP_ROWS; row++) {
    const size = weightedPick(
      state,
      'map',
      constants.MAP_ROW_SIZE_WEIGHTS.map((s) => ({ item: s.size, weight: s.weight })),
    );
    let cols = Array.from({ length: constants.MAP_COLS }, (_, c) => c);
    if (size < constants.MAP_COLS) {
      const removed = nextInt(state, 'map', constants.MAP_COLS);
      cols = cols.filter((c) => c !== removed);
    }
    rows.push(
      cols.map((col) => ({ id: nodeId(act, row, col), row, col, type: 'battle', next: [] })),
    );
  }

  // 2. 길 잇기: 다음 행에서 열 차이가 1 이하인 모든 칸. 7행은 보스와
  const bossNode: MapNode = {
    id: `a${act}_boss`,
    row: constants.BOSS_ROW,
    col: constants.BOSS_COL,
    type: 'boss',
    next: [],
  };
  rows.forEach((nodes, r) => {
    const nextRow = rows[r + 1];
    for (const node of nodes) {
      node.next = nextRow
        ? nextRow.filter((n) => Math.abs(n.col - node.col) <= 1).map((n) => n.id)
        : [bossNode.id];
    }
  });

  // 3. 칸 종류 (행 순서, 같은 행에서는 열 순서)
  rows.forEach((nodes, r) => {
    const rule = constants.MAP_ROW_RULES[r];
    if (!rule) throw new Error(`${r + 1}행의 규칙이 없습니다`);
    const weights = rowWeights(state, r, rule.weights);
    nodes.forEach((node, i) => {
      const fixed = rule.fixed?.[i];
      node.type = fixed ?? weightedPick(state, 'map', weightEntries<NodeType>(weights));
    });
  });

  // 4. 보스 칸
  const bosses = getEncounters(act, 'boss');
  const boss = bosses[nextInt(state, 'map', bosses.length)];
  if (!boss) throw new Error(`${act}막의 보스 조우가 없습니다`);
  bossNode.encounterId = boss.id;

  // 5. 내용 정하기 (행 순서, 열 순서)
  const bags: Partial<Record<EncounterDef['tier'], () => EncounterDef>> = {};
  const encounterBag = (tier: EncounterDef['tier']) =>
    (bags[tier] ??= makeBag(state, getEncounters(act, tier)));
  let eventBag: (() => { id: string }) | null = null;
  rows.forEach((nodes, r) => {
    const rule = constants.MAP_ROW_RULES[r];
    for (const node of nodes) {
      if (node.type === 'battle') {
        const tier = rule?.encounterTier;
        if (!tier) throw new Error(`${r + 1}행에 전투 칸의 난이도가 없습니다`);
        node.encounterId = encounterBag(tier)().id;
      } else if (node.type === 'elite') {
        node.encounterId = encounterBag('elite')().id;
      } else if (node.type === 'event') {
        eventBag ??= makeBag(
          state,
          getEvents().filter((e) => e.acts.includes(act)),
        );
        node.eventId = eventBag().id;
      }
    }
  });

  return { nodes: [...rows.flat(), bossNode], bossNodeId: bossNode.id };
}

/** 지금 고를 수 있는 칸 id (02 6절 7번) */
export function reachableNodeIds(state: GameState): string[] {
  const run = state.run;
  if (!run || state.phase !== 'map') return [];
  if (run.nodeId === null) {
    return run.map.nodes.filter((n) => n.row === 1).map((n) => n.id);
  }
  return findNode(state, run.nodeId).next;
}

export function findNode(state: GameState, id: string): MapNode {
  const node = state.run?.map.nodes.find((n) => n.id === id);
  if (!node) throw new Error(`없는 칸: ${id}`);
  return node;
}
