// 02 8절 startRun, 6절 7번 chooseNode
import { constants, getChip, getChips, getMutations, getTamer } from '../../data/index';
import { setPhase } from '../phase';
import { startBattle } from '../battle/start';
import { gainChip } from '../chips';
import { mutationAmount } from '../mutation';
import { hazardOn, newCardInstance, pctFloor, requireRun } from '../helpers';
import { shuffle } from '../rng';
import type { GameEvent, GameState, TamerId } from '../types';
import { afterRunEffects, enterEvent, enterTreasure, runRunEffects } from './event';
import { gainBits } from './reward';
import { findNode, generateMap } from './map';
import { enterRest } from './rest';
import { enterShop } from './shop';

export function startRun(
  state: GameState,
  events: GameEvent[],
  tamerId: TamerId,
  hazard = 0,
): void {
  const tamer = getTamer(tamerId);
  // 해저드 4: 최대 HP -10% (02 13.6). run을 만들기 전이므로 단계를 직접 비교
  const maxHp =
    hazard >= constants.HAZARD_LEVEL.maxHp
      ? pctFloor(tamer.maxHp, constants.HAZARD_MAX_HP_PCT)
      : tamer.maxHp;
  state.run = {
    tamerId,
    act: 1,
    hp: maxHp,
    maxHp,
    bits: tamer.startBits,
    maxStage: tamer.startMaxStage,
    maxMemory: tamer.startMaxMemory,
    deck: [],
    chips: [],
    map: { nodes: [], bossNodeId: '' },
    nodeId: null,
    path: [],
    pastNodes: 0,
    removalsBought: 0,
    hazard,
    formTraits: {},
    mutation: null,
  };
  const run = state.run;
  run.deck = tamer.startDeck.map((id) => newCardInstance(state, id, false));
  // 해저드 5: 시작 덱에 버그 데이터 1장
  if (hazardOn(state, 'startCurse')) {
    run.deck.push(newCardInstance(state, constants.HAZARD_START_CURSE, false));
  }
  run.map = generateMap(state, run.act);
  for (const chipId of tamer.startChips) gainChip(state, events, chipId);
  // 시작 디아크: 열린 시작 칩 중 3개에서 1개 고르기 (02 12.7, 13.5)
  const unlocked = getChips()
    .filter((c) => c.start && state.unlocks.startChips.includes(c.id))
    .map((c) => c.id);
  const startChips =
    unlocked.length > constants.START_CHIP_CHOICES
      ? shuffle(state, 'reward', unlocked).slice(0, constants.START_CHIP_CHOICES)
      : unlocked;
  if (startChips.length > 0) {
    state.pending = { kind: 'startChip', chipIds: startChips };
    setPhase(state, events, 'startChip');
    return;
  }
  enterMutation(state, events);
}

/** 시작 칩을 고름 (02 12.7) */
export function chooseStartChip(state: GameState, events: GameEvent[], index: number): void {
  if (state.pending?.kind !== 'startChip') throw new Error('시작 칩을 고르는 중이 아닙니다');
  const chipId = state.pending.chipIds[index];
  if (!chipId) throw new Error(`없는 시작 칩: ${index}`);
  state.pending = null;
  gainChip(state, events, chipId);
  enterMutation(state, events);
}

/** 02 15.1: 변이 표 전체를 mutation 흐름으로 섞어 앞의 3개를 보여 줌 */
function enterMutation(state: GameState, events: GameEvent[]): void {
  const ids = getMutations().map((m) => m.id);
  const mutationIds = shuffle(state, 'mutation', ids).slice(0, constants.MUTATION_CHOICES);
  state.pending = { kind: 'mutation', mutationIds };
  setPhase(state, events, 'mutation');
}

/** 변이를 고름 (02 15.1) */
export function chooseMutation(state: GameState, events: GameEvent[], index: number): void {
  if (state.pending?.kind !== 'mutation') throw new Error('변이를 고르는 중이 아닙니다');
  const mutationId = state.pending.mutationIds[index];
  if (!mutationId) throw new Error(`없는 변이: ${index}`);
  state.pending = null;
  const run = requireRun(state);
  run.mutation = mutationId;
  events.push({ type: 'mutationChosen', mutationId });
  applyMutationStart(state, events);
  finishRunStart(state, events);
}

/** 변이를 건너뜀: 변이 규칙이 없던 때와 같음 (02 15.1) */
export function skipMutation(state: GameState, events: GameEvent[]): void {
  if (state.pending?.kind !== 'mutation') throw new Error('변이를 고르는 중이 아닙니다');
  state.pending = null;
  events.push({ type: 'mutationChosen', mutationId: null });
  finishRunStart(state, events);
}

/**
 * 변이의 판 시작 효과 (02 15.1).
 * maxHp: 해저드 4 뒤 maxHp = hp = max(1, maxHp + amount), 칩의 maxHpBonus는 그 뒤.
 * 시작 칩은 이미 골랐으므로 칩 보너스를 빼고 계산한 뒤 다시 더해 같은 순서가 되게 합니다.
 */
function applyMutationStart(state: GameState, events: GameEvent[]): void {
  const run = requireRun(state);
  const hpAmount = mutationAmount(state, 'maxHp');
  if (hpAmount !== 0) {
    const chipBonus = run.chips.reduce(
      (sum, id) => sum + (getChip(id).modifiers?.maxHpBonus ?? 0),
      0,
    );
    run.maxHp = Math.max(1, run.maxHp - chipBonus + hpAmount) + chipBonus;
    run.hp = run.maxHp;
    events.push({ type: 'maxHpChanged', maxHp: run.maxHp, hp: run.hp });
  }
  // startBits: 0 아래로는 안 감
  const bitsAmount = mutationAmount(state, 'startBits');
  if (bitsAmount !== 0) gainBits(state, events, Math.max(-run.bits, bitsAmount));
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
