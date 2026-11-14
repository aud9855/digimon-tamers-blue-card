// 모든 타입 (03 4절). 필드를 더하면 03 문서도 함께 고칩니다.

export type Stage = 'rookie' | 'champion' | 'ultimate' | 'mega';
export type Attribute = 'vaccine' | 'data' | 'virus' | 'none';
export type StatusId = 'strength' | 'weak' | 'vulnerable';
export type TamerId = 'takato' | 'rika' | 'henry' | 'ai_mako';
export type CardType = 'attack' | 'skill' | 'signature' | 'curse' | 'companion';
/** 형태 특성 (02 12.5) */
export type FormTraitId = 'tough' | 'sharp';
export type Rarity = 'basic' | 'common' | 'uncommon' | 'rare' | 'special';
export type Keyword = 'exhaust' | 'retain' | 'innate' | 'unplayable';

// ── 효과 (02 4.3) ──
export type Effect =
  | {
      op: 'damage';
      amount: number;
      hits?: number;
      target: 'enemy' | 'allEnemies' | 'randomEnemy';
    }
  | { op: 'shield'; amount: number }
  | { op: 'draw'; count: number }
  | { op: 'gainMemory'; amount: number }
  | { op: 'heal'; amount: number }
  | { op: 'loseHp'; amount: number }
  | {
      op: 'applyStatus';
      status: StatusId;
      amount: number;
      target: 'enemy' | 'allEnemies' | 'self';
    }
  | { op: 'freeEvolve' }
  | { op: 'addCard'; cardId: string; to: 'hand' | 'discard' | 'draw'; count: number }
  | { op: 'ifStage'; min: Stage; then: Effect[]; else?: Effect[] }
  | { op: 'ifEvolvedThisTurn'; then: Effect[]; else?: Effect[] }
  /** 이 카드보다 먼저 이번 턴에 낸 카드가 min장 이상이면 (02 12.11) */
  | { op: 'ifPlayedThisTurn'; min: number; then: Effect[]; else?: Effect[] };

// ── 정의 (src/data가 채움, 바뀌지 않음) ──
/** 동료 효과 (02 12.6): 칩과 같은 구조 */
export interface CompanionEffect {
  trigger?: ChipTrigger;
  effects?: Effect[];
  modifiers?: { evolveCostDelta?: number };
}
export interface CardFace {
  cost: number;
  effects: Effect[];
  keywords?: Keyword[];
  /** 동료 카드만: 동료 자리에 있는 동안의 효과 */
  companion?: CompanionEffect;
}
export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  rarity: Rarity;
  pool: TamerId | 'neutral' | 'none'; // 'none': 보상·상점에 안 나옴
  base: CardFace;
  upgraded: CardFace;
}
export interface FormDef {
  id: string;
  name: string;
  line: string; // line: 계열 id (예: 'guilmon')
  stage: Stage;
  attribute: Attribute;
  tempHp: number;
  power: number;
  signatureCardId?: string;
}
export type EnemyEffect =
  | { op: 'attack'; amount: number; hits?: number }
  | { op: 'shield'; amount: number }
  | { op: 'applyStatus'; status: StatusId; amount: number; target: 'self' | 'player' }
  | { op: 'addCard'; cardId: string; to: 'discard' | 'draw'; count: number };
export interface EnemyMove {
  id: string;
  name: string;
  effects: EnemyEffect[];
}
export interface EnemyPhase {
  untilHpPct?: number;
  onEnter?: string;
  cycle: string[];
}
export interface EnemyDef {
  id: string;
  name: string;
  tier: 'normal' | 'elite' | 'boss';
  attribute: Attribute;
  maxHp: number;
  moves: EnemyMove[];
  phases: EnemyPhase[];
}
export interface EncounterDef {
  id: string;
  act: number;
  tier: 'easy' | 'normal' | 'elite' | 'boss';
  enemies: string[];
}
export type ChipTrigger =
  'onBattleStart' | 'onFirstTurn' | 'onTurnStart' | 'onEvolve' | 'onCardPlayed';
export interface ChipDef {
  id: string;
  name: string;
  trigger?: ChipTrigger;
  effects?: Effect[];
  /** 테이머 특성용 숨은 칩: 보상·상점에 안 나오고 칩으로 보이지 않음 (02 12.3) */
  hidden?: boolean;
  /** 시작 칩: 판 시작에만 고름 (02 12.7) */
  start?: boolean;
  modifiers?: {
    evolveCostDelta?: number;
    /** 그 턴에 처음 내는 카드의 비용에 더함 (02 12.11) */
    firstCardCostDelta?: number;
    battleBitsBonus?: number;
    handSizeBonus?: number;
    maxHpBonus?: number;
  };
}
export type RunEffect =
  | { op: 'heal'; amount: number }
  | { op: 'loseHp'; amount: number }
  | { op: 'gainBits'; amount: number }
  | { op: 'addRandomCard'; rarity: Rarity }
  | { op: 'offerCards'; count: number; upgraded?: boolean; rarity?: Rarity }
  | { op: 'addRandomChip' }
  | { op: 'addCard'; cardId: string };
export interface EventDef {
  id: string;
  /** 나오는 막 (02 12.1) */
  acts: number[];
  title: string;
  text: string;
  choices: { label: string; effects: RunEffect[] }[];
}
export interface TamerDef {
  id: TamerId;
  name: string;
  /** 테이머 특성 이름 (02 8절, 12.3) */
  trait: string;
  line: string;
  maxHp: number;
  startBits: number;
  startMaxStage: Stage;
  startMaxMemory: number;
  startDeck: string[];
  startEffects: RunEffect[];
  startChips: string[];
}

// ── 상태 (전부 JSON으로 저장할 수 있어야 함) ──
export interface CardInstance {
  uid: number;
  defId: string;
  upgraded: boolean;
  temp?: boolean;
}
export type Statuses = Record<StatusId, number>;
export interface EnemyState {
  defId: string;
  hp: number;
  maxHp: number;
  shield: number;
  alive: boolean;
  statuses: Statuses;
  accel: number;
  phaseIndex: number;
  cycleIndex: number; // -1: onEnter 행동을 보여 주는 중 (02 3.10.1)
  intentMoveId: string;
}
export interface BattleState {
  kind: 'normal' | 'elite' | 'boss';
  encounterId: string;
  hpAtStart: number; // 전투 시작 때의 run.hp (지표용)
  evolveCount: number; // 이번 전투에서 진화한 횟수 (지표용)
  turn: number;
  memory: number;
  stage: Stage;
  shield: number;
  tempHp: number;
  statuses: Statuses;
  evolvedThisTurn: boolean;
  freeEvolve: boolean;
  /** 이번 턴에 낸 카드 수. 카드를 옮긴 뒤 올림 (02 12.3) */
  cardsPlayedThisTurn: number;
  drawPile: CardInstance[];
  hand: CardInstance[];
  discardPile: CardInstance[];
  exhaustPile: CardInstance[];
  /** 동료 자리 (02 12.6) */
  companions: CardInstance[];
  enemies: EnemyState[];
}
export type NodeType = 'battle' | 'elite' | 'event' | 'shop' | 'rest' | 'treasure' | 'boss';
export interface MapNode {
  id: string;
  row: number;
  col: number;
  type: NodeType;
  next: string[]; // 이어진 다음 칸 id
  encounterId?: string; // battle·elite·boss 칸
  eventId?: string; // event 칸
} // 보스 칸은 row 8, col 1 (02 6절)
export interface ActMap {
  nodes: MapNode[];
  bossNodeId: string;
}
export interface RunState {
  tamerId: TamerId;
  act: number;
  hp: number;
  maxHp: number;
  bits: number;
  maxStage: Stage;
  maxMemory: number;
  deck: CardInstance[];
  chips: string[];
  map: ActMap;
  nodeId: string | null; // 지금 있는 칸 (막 시작 전에는 null)
  path: string[]; // 이번 막에서 지나온 칸 id (지금 칸 포함)
  removalsBought: number;
  /** 단계별로 고른 형태 특성 (02 12.5) */
  formTraits: Partial<Record<Stage, FormTraitId>>;
}
// 플레이어 HP는 run.hp 하나뿐입니다. 전투 중에도 run.hp를 직접 고칩니다.
// 지금 형태는 getForm(tamer.line, battle.stage)로 찾습니다. 전투 밖에서는 성장기입니다.
export interface CardOffer {
  cards: { defId: string; upgraded: boolean }[];
}
export type Pending =
  | { kind: 'reward'; offers: CardOffer[]; afterBoss: boolean } // offers[0]이 지금 고르는 것
  | {
      kind: 'shop';
      cards: { defId: string; price: number; sold: boolean }[];
      chips: { chipId: string; price: number; sold: boolean }[];
      removalUsed: boolean;
    }
  | { kind: 'rest' }
  | { kind: 'event'; eventId: string }
  | { kind: 'treasure'; chipId: string | null }
  | { kind: 'startChip'; chipIds: string[] }
  /** traitStage: 특성을 고를 단계 (고르면 null) */
  | { kind: 'actClear'; traitStage: Stage | null };
export type Phase =
  | 'title'
  | 'startChip'
  | 'map'
  | 'battle'
  | 'reward'
  | 'shop'
  | 'rest'
  | 'event'
  | 'treasure'
  | 'actClear'
  | 'runWon'
  | 'runLost';
export type RngStream = 'map' | 'battle' | 'reward' | 'event';
export interface GameState {
  version: number; // 저장 형식 버전
  seed: number;
  rng: Record<RngStream, number>;
  phase: Phase;
  run: RunState | null;
  battle: BattleState | null;
  pending: Pending | null;
  nextUid: number; // 다음 CardInstance uid
}

// ── 행동 ──
export type Action =
  | { type: 'startRun'; tamerId: TamerId }
  | { type: 'chooseNode'; nodeId: string }
  | { type: 'playCard'; cardUid: number; targetIndex?: number }
  | { type: 'evolve' }
  | { type: 'endTurn' }
  | { type: 'pickCard'; index: number }
  | { type: 'skipCards' }
  | { type: 'shopBuyCard'; index: number }
  | { type: 'shopBuyChip'; index: number }
  | { type: 'shopRemoveCard'; cardUid: number }
  | { type: 'restHeal' }
  | { type: 'restUpgrade'; cardUid: number }
  | { type: 'eventChoose'; index: number }
  | { type: 'proceed' }
  | { type: 'chooseStartChip'; index: number }
  | { type: 'chooseFormTrait'; index: number };

// ── 일어난 일 목록 (03 4.1) ──
export type Who = 'player' | number; // number: 적의 위치(index)
export type GameEvent =
  | { type: 'phaseChanged'; phase: Phase }
  | { type: 'nodeEntered'; nodeId: string; nodeType: NodeType }
  | { type: 'chipTriggered'; chipId: string }
  | { type: 'battleStarted'; encounterId: string }
  | { type: 'turnStarted'; turn: number }
  | { type: 'deckShuffled' }
  | { type: 'cardDrawn'; cardUid: number }
  | { type: 'cardPlayed'; cardUid: number; targetIndex?: number }
  | {
      type: 'cardMoved';
      cardUid: number;
      to: 'hand' | 'draw' | 'discard' | 'exhaust' | 'removed' | 'companion';
    }
  | { type: 'companionTriggered'; cardUid: number }
  | { type: 'formTraitChosen'; stage: Stage; traitId: FormTraitId }
  | { type: 'cardCreated'; cardUid: number; defId: string; to: 'hand' | 'draw' | 'discard' }
  | { type: 'memoryChanged'; memory: number }
  | {
      type: 'damage';
      source: Who;
      target: Who;
      amount: number;
      blocked: number;
      tempHpLost: number;
      hpLost: number;
      attrMult: number;
    }
  | { type: 'hpLost'; amount: number } // loseHp
  | { type: 'healed'; amount: number }
  | { type: 'shieldGained'; target: Who; amount: number }
  | { type: 'statusApplied'; target: Who; status: StatusId; amount: number }
  | { type: 'accelChanged'; enemyIndex: number; accel: number } // 얻었을 때와 0이 됐을 때
  | { type: 'evolved'; from: Stage; to: Stage; cost: number; tempHpGained: number }
  | { type: 'enemyPhaseChanged'; enemyIndex: number; phaseIndex: number }
  | { type: 'enemyMoved'; enemyIndex: number; moveId: string }
  | { type: 'enemyIntent'; enemyIndex: number; moveId: string }
  | { type: 'enemyDied'; enemyIndex: number }
  | {
      type: 'battleEnded';
      won: boolean;
      kind: 'normal' | 'elite' | 'boss';
      encounterId: string;
      turns: number;
      hpBefore: number;
      hpAfter: number;
      evolveCount: number;
    }
  | { type: 'turnEnded'; turn: number; memory: number } // 플레이어 턴 끝. memory < 0이면 당겨쓴 턴
  | { type: 'bitsChanged'; bits: number }
  | { type: 'cardGained'; cardUid: number; defId: string }
  | { type: 'cardUpgraded'; cardUid: number }
  | { type: 'chipGained'; chipId: string }
  | { type: 'stageUnlocked'; stage: Stage }
  | { type: 'runEnded'; won: boolean };
