// 원하는 덱·손패·적으로 전투 상태를 바로 만드는 도우미 (03 8절)
import { createEnemy } from '../../src/core/battle/enemy';
import { applyAction } from '../../src/core/engine';
import { emptyStatuses } from '../../src/core/helpers';
import { createInitialState } from '../../src/core/state';
import type {
  Action,
  BattleState,
  CardInstance,
  EnemyState,
  GameEvent,
  GameState,
  Stage,
  Statuses,
} from '../../src/core/types';
import { getTamer } from '../../src/data/index';

/** 'strike'는 기본 면, 'strike+'는 강화 면 */
export type CardSpec = string;

export interface BattleOptions {
  seed?: number;
  enemies?: string[];
  enemyOverrides?: Partial<EnemyState>[];
  hand?: CardSpec[];
  drawPile?: CardSpec[];
  discardPile?: CardSpec[];
  deck?: CardSpec[];
  chips?: string[];
  memory?: number;
  stage?: Stage;
  maxStage?: Stage;
  maxMemory?: number;
  hp?: number;
  maxHp?: number;
  shield?: number;
  tempHp?: number;
  statuses?: Partial<Statuses>;
  turn?: number;
  kind?: BattleState['kind'];
  act?: number;
}

function makeCards(state: GameState, specs: CardSpec[]): CardInstance[] {
  return specs.map((spec) => {
    const upgraded = spec.endsWith('+');
    const card: CardInstance = {
      uid: state.nextUid,
      defId: upgraded ? spec.slice(0, -1) : spec,
      upgraded,
    };
    state.nextUid += 1;
    return card;
  });
}

/** 전투 국면의 상태. 적 정의는 등록돼 있어야 합니다 (fixtures의 시험용 적은 overrideRegistry로). */
export function makeBattle(opts: BattleOptions = {}): GameState {
  const state = createInitialState(opts.seed ?? 1);
  const tamer = getTamer('takato');
  state.run = {
    tamerId: 'takato',
    act: opts.act ?? 1,
    hp: opts.hp ?? tamer.maxHp,
    maxHp: opts.maxHp ?? tamer.maxHp,
    bits: 0,
    maxStage: opts.maxStage ?? tamer.startMaxStage,
    maxMemory: opts.maxMemory ?? tamer.startMaxMemory,
    deck: [],
    chips: opts.chips ?? [],
    map: { nodes: [], bossNodeId: '' },
    nodeId: null,
    path: [],
    removalsBought: 0,
  };
  state.run.deck = makeCards(state, opts.deck ?? []);
  const enemies = (opts.enemies ?? ['test_dummy']).map((id, i) => ({
    ...createEnemy(id),
    ...(opts.enemyOverrides?.[i] ?? {}),
  }));
  state.battle = {
    kind: opts.kind ?? 'normal',
    encounterId: 'test_dummy_one',
    hpAtStart: state.run.hp,
    evolveCount: 0,
    turn: opts.turn ?? 1,
    memory: opts.memory ?? state.run.maxMemory,
    stage: opts.stage ?? 'rookie',
    shield: opts.shield ?? 0,
    tempHp: opts.tempHp ?? 0,
    statuses: { ...emptyStatuses(), ...opts.statuses },
    evolvedThisTurn: false,
    freeEvolve: false,
    drawPile: makeCards(state, opts.drawPile ?? []),
    hand: makeCards(state, opts.hand ?? []),
    discardPile: makeCards(state, opts.discardPile ?? []),
    exhaustPile: [],
    enemies,
  };
  state.phase = 'battle';
  return state;
}

export function battleOf(state: GameState): BattleState {
  if (!state.battle) throw new Error('전투가 없습니다');
  return state.battle;
}

/** 손패에서 그 카드 id의 첫 카드 uid */
export function handUid(state: GameState, defId: string): number {
  const card = battleOf(state).hand.find((c) => c.defId === defId);
  if (!card) throw new Error(`손패에 ${defId}가 없습니다`);
  return card.uid;
}

/** applyAction을 부르고 상태와 일어난 일을 돌려줌 */
export function act(state: GameState, action: Action): { state: GameState; events: GameEvent[] } {
  return applyAction(state, action);
}

/** 손패의 카드를 냄 */
export function play(
  state: GameState,
  defId: string,
  targetIndex?: number,
): { state: GameState; events: GameEvent[] } {
  const cardUid = handUid(state, defId);
  return applyAction(
    state,
    targetIndex === undefined
      ? { type: 'playCard', cardUid }
      : { type: 'playCard', cardUid, targetIndex },
  );
}

export function eventsOf<T extends GameEvent['type']>(
  events: GameEvent[],
  type: T,
): Extract<GameEvent, { type: T }>[] {
  return events.filter((e): e is Extract<GameEvent, { type: T }> => e.type === type);
}
