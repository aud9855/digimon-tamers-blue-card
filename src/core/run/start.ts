// 02 8절 startRun, 6절 7번 chooseNode
import { getTamer } from '../../data/index';
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
  };
  const run = state.run;
  run.deck = tamer.startDeck.map((id) => newCardInstance(state, id, false));
  run.map = generateMap(state, run.act);
  for (const chipId of tamer.startChips) gainChip(state, events, chipId);
  // 테이머 특성 (런 효과)
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
