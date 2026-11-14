// 카드·칩·인텐트 설명 글 (03 5.3). 효과 op마다 문장 틀이 하나씩 있습니다.
import { getCard, getChip, getEnemy, getEvent, getTamer } from '../data/index';
import { cardCost } from './battle/cards';
import { canEvolve, evolveCost } from './battle/evolve';
import { enemyHitDamage, playerHitDamage } from './battle/damage';
import { getMove } from './battle/enemy';
import { floorNonNegative, formPower } from './helpers';
import { constants } from '../data/index';
import type {
  ChipDef,
  ChipTrigger,
  Effect,
  EnemyEffect,
  GameState,
  Keyword,
  Rarity,
  RunEffect,
  Stage,
  StatusId,
  TamerId,
} from './types';

/** 설명 글에 지금 전투 값을 반영할 때 넘기는 것 */
export interface DescribeContext {
  state: GameState;
  targetIndex?: number;
}

/** 화면과 봇이 쓰는 인텐트 정보 (03 5절) */
export interface IntentView {
  moveId: string;
  name: string;
  kind: 'attack' | 'defend' | 'buff' | 'debuff' | 'mixed';
  damage?: number;
  hits?: number;
}

const STAGE_NAMES: Record<Stage, string> = {
  rookie: '성장기',
  champion: '성숙기',
  ultimate: '완전체',
  mega: '궁극체',
};
const STATUS_NAMES: Record<StatusId, string> = {
  strength: '힘',
  weak: '약화',
  vulnerable: '취약',
};
const KEYWORD_NAMES: Record<Keyword, string> = {
  exhaust: '소멸',
  retain: '보존',
  innate: '선천',
  unplayable: '낼 수 없음',
};
const TRIGGER_NAMES: Record<ChipTrigger, string> = {
  onBattleStart: '전투 시작 때',
  onFirstTurn: '첫 턴 시작 때',
  onTurnStart: '턴 시작 때마다',
  onEvolve: '진화할 때마다',
  onCardPlayed: '카드를 낼 때마다',
};
const PILE_NAMES = { hand: '손패', discard: '버림 더미', draw: '뽑을 더미' } as const;

/** 피해량: ctx가 있으면 지금 전투 값(형태 공격력, 힘, 약화, 대상의 속성·취약)을 반영 */
function damageAmount(amount: number, ctx: DescribeContext | undefined): number {
  const state = ctx?.state;
  if (!state || state.phase !== 'battle' || !state.battle) return amount;
  const target = ctx.targetIndex;
  if (target !== undefined && state.battle.enemies[target]?.alive) {
    return playerHitDamage(state, amount, target).damage;
  }
  const raw = amount + formPower(state) + state.battle.statuses.strength;
  return floorNonNegative(raw * (state.battle.statuses.weak > 0 ? constants.WEAK_MULT : 1));
}

function describeEffect(effect: Effect, ctx: DescribeContext | undefined): string {
  switch (effect.op) {
    case 'damage': {
      const amount = damageAmount(effect.amount, ctx);
      const hits = effect.hits ?? 1;
      const body = hits > 1 ? `피해 ${amount} × ${hits}번` : `피해 ${amount}`;
      if (effect.target === 'allEnemies') return `모든 적에게 ${body}`;
      if (effect.target === 'randomEnemy') return `무작위 적에게 ${body}`;
      return body;
    }
    case 'shield':
      return `실드 ${effect.amount}`;
    case 'draw':
      return `카드 ${effect.count}장 뽑기`;
    case 'gainMemory':
      return `메모리 +${effect.amount}`;
    case 'heal':
      return `HP ${effect.amount} 회복`;
    case 'loseHp':
      return `HP ${effect.amount} 잃음`;
    case 'applyStatus': {
      const name = STATUS_NAMES[effect.status];
      if (effect.target === 'self') {
        return effect.status === 'strength'
          ? `힘 +${effect.amount}`
          : `자신에게 ${name} ${effect.amount}`;
      }
      if (effect.target === 'allEnemies') return `모든 적에게 ${name} ${effect.amount}`;
      return `대상에게 ${name} ${effect.amount}`;
    }
    case 'freeEvolve':
      return '이번 턴 다음 진화 비용 0';
    case 'addCard':
      return `${getCard(effect.cardId).name} ${effect.count}장을 ${PILE_NAMES[effect.to]}에 넣음`;
    case 'ifStage':
      return conditional(`${STAGE_NAMES[effect.min]} 이상이면`, effect.then, effect.else, ctx);
    case 'ifEvolvedThisTurn':
      return conditional('이번 턴에 진화했으면', effect.then, effect.else, ctx);
    case 'ifPlayedThisTurn':
      return conditional(
        `이번 턴에 이미 ${effect.min}장 이상 냈으면`,
        effect.then,
        effect.else,
        ctx,
      );
  }
}

function conditional(
  condition: string,
  then: readonly Effect[],
  otherwise: readonly Effect[] | undefined,
  ctx: DescribeContext | undefined,
): string {
  const thenText = joinEffects(then, ctx, '와 ');
  if (!otherwise || otherwise.length === 0) return `${condition} ${thenText}`;
  return `${condition} ${thenText}, 아니면 ${joinEffects(otherwise, ctx, '와 ')}`;
}

function joinEffects(
  effects: readonly Effect[],
  ctx: DescribeContext | undefined,
  separator: string,
): string {
  return effects.map((e) => describeEffect(e, ctx)).join(separator);
}

function sentences(parts: string[]): string {
  return parts
    .filter((p) => p.length > 0)
    .map((p) => `${p}.`)
    .join(' ');
}

export function describeCard(defId: string, upgraded: boolean, ctx?: DescribeContext): string {
  const def = getCard(defId);
  const face = upgraded ? def.upgraded : def.base;
  const parts = face.effects.map((e) => describeEffect(e, ctx));
  if (face.companion) {
    const c = face.companion;
    if (c.trigger && c.effects) {
      parts.push(`동료: ${TRIGGER_NAMES[c.trigger]} ${joinEffects(c.effects, undefined, ', ')}`);
    }
    if (c.modifiers) {
      parts.push(...describeModifiers(c.modifiers).map((t) => `동료: ${t}`));
    }
  }
  for (const keyword of face.keywords ?? []) parts.push(KEYWORD_NAMES[keyword]);
  return sentences(parts);
}

function describeModifiers(modifiers: NonNullable<ChipDef['modifiers']>): string[] {
  const parts: string[] = [];
  const signed = (n: number) => (n >= 0 ? `+${n}` : `${n}`);
  if (modifiers.evolveCostDelta) parts.push(`진화 비용 ${signed(modifiers.evolveCostDelta)}`);
  if (modifiers.battleBitsBonus) {
    parts.push(`전투 보상 비트 ${signed(modifiers.battleBitsBonus)}`);
  }
  if (modifiers.handSizeBonus) {
    parts.push(`턴 시작에 뽑는 카드 ${signed(modifiers.handSizeBonus)}장`);
  }
  if (modifiers.maxHpBonus) parts.push(`최대 HP ${signed(modifiers.maxHpBonus)}`);
  if (modifiers.firstCardCostDelta) {
    parts.push(`매 턴 처음 내는 카드의 비용 ${signed(modifiers.firstCardCostDelta)}`);
  }
  return parts;
}

export function describeChip(chipId: string): string {
  const chip = getChip(chipId);
  const parts: string[] = [];
  if (chip.trigger && chip.effects) {
    parts.push(`${TRIGGER_NAMES[chip.trigger]} ${joinEffects(chip.effects, undefined, ', ')}`);
  }
  if (chip.modifiers) parts.push(...describeModifiers(chip.modifiers));
  return sentences(parts);
}

function intentCategory(effect: EnemyEffect): IntentView['kind'] {
  switch (effect.op) {
    case 'attack':
      return 'attack';
    case 'shield':
      return 'defend';
    case 'applyStatus':
      return effect.target === 'self' ? 'buff' : 'debuff';
    case 'addCard':
      return 'debuff';
  }
}

export function describeIntent(state: GameState, enemyIndex: number): IntentView {
  const enemy = state.battle?.enemies[enemyIndex];
  if (!enemy) throw new Error(`없는 적 위치: ${enemyIndex}`);
  getEnemy(enemy.defId);
  const move = getMove(enemy, enemy.intentMoveId);
  const kinds = new Set(move.effects.map(intentCategory));
  const [only] = [...kinds];
  const view: IntentView = {
    moveId: move.id,
    name: move.name,
    kind: kinds.size === 1 && only ? only : 'mixed',
  };
  const attack = move.effects.find((e) => e.op === 'attack');
  if (attack && attack.op === 'attack') {
    view.damage = enemyHitDamage(state, attack.amount, enemyIndex).damage;
    view.hits = attack.hits ?? 1;
  }
  return view;
}

/** 손패 카드를 지금 낼 때의 비용 (처음 내는 카드 할인 포함). 손패에 없으면 null */
export function previewCardCost(state: GameState, cardUid: number): number | null {
  const card = state.battle?.hand.find((c) => c.uid === cardUid);
  return card ? cardCost(state, card) : null;
}

/** 지금 진화 비용 (못 하면 null) */
export function previewEvolveCost(state: GameState): number | null {
  return canEvolve(state) ? evolveCost(state) : null;
}

/**
 * 손패 카드 또는 진화에 메모리를 쓴 뒤 바로 턴을 끝내면 적이 얻을 가속 (02 3.6).
 * 0이면 당겨쓰지 않음. 화면의 당겨쓰기 경고에 씁니다 (03 9.2).
 */
export function previewOverdraw(state: GameState, what: { cardUid: number } | 'evolve'): number {
  const battle = state.battle;
  if (!battle) return 0;
  let cost: number | null;
  if (what === 'evolve') {
    cost = evolveCost(state);
  } else {
    const card = battle.hand.find((c) => c.uid === what.cardUid);
    cost = card ? cardCost(state, card) : null;
  }
  if (cost === null) return 0;
  return Math.max(0, cost - battle.memory);
}

const RARITY_NAMES: Record<Rarity, string> = {
  basic: '기본',
  common: '일반',
  uncommon: '고급',
  rare: '희귀',
  special: '특수',
};

/** 런 효과 하나의 설명 (이벤트 선택지 등, 02 7.5) */
function describeRunEffect(effect: RunEffect): string {
  switch (effect.op) {
    case 'heal':
      return `HP ${effect.amount} 회복`;
    case 'loseHp':
      return `HP ${effect.amount} 잃음`;
    case 'gainBits':
      return `${effect.amount} 비트`;
    case 'addRandomCard':
      return `무작위 ${RARITY_NAMES[effect.rarity]} 카드 1장`;
    case 'offerCards':
      return `${effect.upgraded ? '강화된 ' : ''}${
        effect.rarity ? `${RARITY_NAMES[effect.rarity]} ` : ''
      }카드 ${effect.count}장 중 1장 고르기`;
    case 'addRandomChip':
      return '무작위 디아크 칩 1개';
    case 'addCard':
      return `${getCard(effect.cardId).name} 1장을 덱에`;
  }
}

/** 테이머 특성 설명 (숨은 칩과 판 시작 런 효과, 02 8절, 12.3) */
export function describeTamer(tamerId: TamerId): string {
  const tamer = getTamer(tamerId);
  const parts = [
    ...tamer.startChips.filter((id) => getChip(id).hidden).map((id) => describeChip(id)),
    ...tamer.startEffects.map((e) => `판 시작에 ${describeRunEffect(e)}.`),
  ];
  return parts.join(' ');
}

/** 이벤트 선택지의 결과 설명. 효과가 없으면 '아무 일도 없음' */
export function describeEventChoice(eventId: string, index: number): string {
  const choice = getEvent(eventId).choices[index];
  if (!choice) throw new Error(`없는 선택지: ${eventId} ${index}`);
  if (choice.effects.length === 0) return '아무 일도 없음';
  return choice.effects.map(describeRunEffect).join(', ');
}
