// 02 8절 startRun, 6절 7번 chooseNode
import { getChips, getTamer } from '../../data/index';
import { setPhase } from '../phase';
import { startBattle } from '../battle/start';
import { gainChip } from '../chips';
import { newCardInstance, requireRun } from '../helpers';
import type { GameEvent, GameState, TamerId } from '../types';
import { afterRunEffects, enterEvent, enterTreasure, runRunEffects } from './event';
import { findNode, generateMap } from './map';
import { enterRest } from './rest';
import { enterShop } from './shop';

export function startRun(state: GameState, events: GameEvent[], tamerId: TamerId): void {
  const tamer = getTamer(tamerId);
  state.run = {
    tamerId,
    act: 1,
    hp: tamer.maxHp,
    maxHp: tamer.maxHp,
    bits: tamer.startBits,
    maxStage: tamer.startMaxStage,
    maxMemory: tamer.startMaxMemory,
    deck: [],
    chips: [],
    map: { nodes: [], bossNodeId: '' },
    nodeId: null,
    path: [],
    removalsBought: 0,
    formTraits: {},
  };
  const run = state.run;
  run.deck = tamer.startDeck.map((id) => newCardInstance(state, id, false));
  run.map = generateMap(state, run.act);
  for (const chipId of tamer.startChips) gainChip(state, events, chipId);
  // 시작 디아크: 시작 칩 3개 중 1개 고르기 (02 12.7)
  const startChips = getChips()
    .filter((c) => c.start)
    .map((c) => c.id);
  if (startChips.length > 0) {
    state.pending = { kind: 'startChip', chipIds: startChips };
    setPhase(state, events, 'startChip');
    return;
  }
  finishRunStart(state, events);
}

/** 시작 칩을 고름 (02 12.7) */
export function chooseStartChip(state: GameState, events: GameEvent[], index: number): void {
  if (state.pending?.kind !== 'startChip') throw new Error('시작 칩을 고르는 중이 아닙니다');
  const chipId = state.pending.chipIds[index];
  if (!chipId) throw new Error(`없는 시작 칩: ${index}`);
  state.pending = null;
  gainChip(state, events, chipId);
  finishRunStart(state, events);
}

/** 테이머 특성(런 효과)을 처리하고 첫 국면으로 (02 8절) */
function finishRunStart(state: GameState, events: GameEvent[]): void {
  const tamer = getTamer(requireRun(state).tamerId);
  runRunEffects(state, events, tamer.startEffects);
  afterRunEffects(state, events);
}

/** 칸에 들어가기 */
export function chooseNode(state: GameState, events: GameEvent[], nodeId: string): void {
  const run = requireRun(state);
  const node = findNode(state, nodeId);
  run.nodeId = node.id;
  run.path.push(node.id);
  events.push({ type: 'nodeEntered', nodeId: node.id, nodeType: node.type });

  switch (node.type) {
    case 'battle':
    case 'elite':
    case 'boss': {
      if (!node.encounterId) throw new Error(`조우가 없는 칸: ${node.id}`);
      const kind = node.type === 'battle' ? 'normal' : node.type;
      startBattle(state, events, node.encounterId, kind);
      return;
    }
    case 'event':
      if (!node.eventId) throw new Error(`이벤트가 없는 칸: ${node.id}`);
      enterEvent(state, events, node.eventId);
      return;
    case 'shop':
      enterShop(state, events);
      return;
    case 'rest':
      enterRest(state, events);
      return;
    case 'treasure':
      enterTreasure(state, events);
      return;
  }
}
