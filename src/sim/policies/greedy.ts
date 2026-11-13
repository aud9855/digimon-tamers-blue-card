// greedy: 03 7.1의 규칙을 위에서부터 처음 맞는 것으로 고름
import { playerHitDamage } from '../../core/battle/damage';
import { cardFace, livingEnemyIndexes, stageIndex } from '../../core/helpers';
import {
  applyAction,
  describeIntent,
  getLegalActions,
  previewEvolveCost,
  type Action,
  type CardInstance,
  type Effect,
  type GameState,
} from '../../core/index';
import { getCard, getEvent } from '../../data/index';
import type { Policy, PolicyContext } from './types';

// ── 카드 점수표 (봇 전용, 게임 데이터에 넣지 않음) ──
const CARD_SCORES: Record<string, number> = {
  strike: 1,
  guard: 1,
  fire_ball: 3,
  rock_breaker: 5,
  attack_plugin: 6,
  defense_plugin: 5,
  speed_plugin: 5,
  double_strike: 4,
  heavy_strike: 6,
  bite: 6,
  intimidate: 4,
  tackle: 5,
  hyper_wing: 6,
  charge: 6,
  recovery_floppy: 4,
  rage: 6,
  sweep: 6,
  counter_stance: 5,
  blue_card: 8,
  digital_hazard: 8,
  evo_resonance: 7,
  bug_data: -10,
};
const UPGRADE_BONUS = 1;
/** 덱이 이 장수 이상이면 점수가 기준 아래인 카드는 건너뜀 */
const SKIP_DECK_SIZE = 20;
const SKIP_SCORE = 5;
/** 받을 피해가 지금 HP의 이 비율 이상이면 당겨써서라도 막음 */
const BLOCK_OVERDRAW_HP_RATIO = 0.3;

function cardScore(defId: string, upgraded: boolean): number {
  return (CARD_SCORES[defId] ?? 0) + (upgraded ? UPGRADE_BONUS : 0);
}

// ── 효과 읽기 ──

/** 조건 효과를 지금 상태로 풀어 실제로 실행될 효과만 */
function resolveEffects(state: GameState, effects: readonly Effect[]): Effect[] {
  const battle = state.battle;
  if (!battle) return [];
  return effects.flatMap((e) => {
    if (e.op === 'ifStage') {
      return resolveEffects(
        state,
        stageIndex(battle.stage) >= stageIndex(e.min) ? e.then : (e.else ?? []),
      );
    }
    if (e.op === 'ifEvolvedThisTurn') {
      return resolveEffects(state, battle.evolvedThisTurn ? e.then : (e.else ?? []));
    }
    return [e];
  });
}

function effectsOf(state: GameState, card: CardInstance): Effect[] {
  return resolveEffects(state, cardFace(card).effects);
}

/** 예상 피해 합 (대상 하나 기준, allEnemies는 모두 더함) */
function expectedDamage(state: GameState, card: CardInstance, targetIndex: number | undefined) {
  const battle = state.battle;
  if (!battle) return 0;
  const living = livingEnemyIndexes(battle);
  let total = 0;
  for (const e of effectsOf(state, card)) {
    if (e.op !== 'damage') continue;
    const hits = e.hits ?? 1;
    const targets =
      e.target === 'allEnemies'
        ? living
        : e.target === 'enemy'
          ? targetIndex === undefined
            ? []
            : [targetIndex]
          : living.slice(0, 1);
    for (const t of targets) total += playerHitDamage(state, e.amount, t).damage * hits;
  }
  return total;
}

function shieldAmount(state: GameState, card: CardInstance): number {
  return effectsOf(state, card).reduce((s, e) => s + (e.op === 'shield' ? e.amount : 0), 0);
}

function isAttackCard(card: CardInstance): boolean {
  const type = getCard(card.defId).type;
  return type === 'attack' || type === 'signature';
}

function cardOf(state: GameState, uid: number): CardInstance | undefined {
  return state.battle?.hand.find((c) => c.uid === uid);
}

function costOf(card: CardInstance): number {
  return cardFace(card).cost;
}

/** 이번 적 턴에 받을 피해 (인텐트 합 - 실드 - 임시 HP) */
function incomingDamage(state: GameState): number {
  const battle = state.battle;
  if (!battle) return 0;
  let total = 0;
  for (const i of livingEnemyIndexes(battle)) {
    const intent = describeIntent(state, i);
    if (intent.damage !== undefined) total += intent.damage * (intent.hits ?? 1);
  }
  return total - battle.shield - battle.tempHp;
}

type PlayAction = Extract<Action, { type: 'playCard' }>;

function playActions(legal: Action[]): PlayAction[] {
  return legal.filter((a): a is PlayAction => a.type === 'playCard');
}

// ── 1. 끝낼 수 있으면 끝냄 ──

/** 공격 카드를 피해가 큰 순으로 당겨쓰기까지 써서 모두 죽일 수 있으면 그 첫 행동 */
function findLethal(state: GameState, legal: Action[]): Action | null {
  const battle = state.battle;
  if (!battle) return null;
  // 빠른 걸러내기: 낼 수 있는 공격 카드의 피해를 다 더해도 모자라면 시험하지 않음
  const needed = battle.enemies.reduce((s, e) => s + (e.alive ? e.hp + e.shield : 0), 0);
  const attacks = playActions(legal).filter((a) => {
    const card = cardOf(state, a.cardUid);
    return card !== undefined && isAttackCard(card);
  });
  const bound = attacks.reduce((s, a) => {
    const card = cardOf(state, a.cardUid);
    return s + (card ? expectedDamage(state, card, a.targetIndex) : 0);
  }, 0);
  if (bound < needed) return null;

  let sim = state;
  let first: Action | null = null;
  for (let step = 0; step < 20; step++) {
    if (sim.phase !== 'battle') return sim.phase === 'runLost' ? null : first;
    const options = playActions(getLegalActions(sim)).filter((a) => {
      const card = cardOf(sim, a.cardUid);
      return card !== undefined && isAttackCard(card);
    });
    let best: PlayAction | null = null;
    let bestDamage = 0;
    for (const a of options) {
      const card = cardOf(sim, a.cardUid);
      if (!card) continue;
      const enemy = a.targetIndex === undefined ? undefined : sim.battle?.enemies[a.targetIndex];
      const raw = expectedDamage(sim, card, a.targetIndex);
      const dmg = enemy ? Math.min(raw, enemy.hp + enemy.shield) : raw;
      if (dmg > bestDamage) {
        best = a;
        bestDamage = dmg;
      }
    }
    if (!best) return null;
    first ??= best;
    sim = applyAction(sim, best).state;
  }
  return null;
}

// ── 대상 고르기 (03 7.1의 5번) ──

function chooseTarget(state: GameState, card: CardInstance, options: PlayAction[]): PlayAction {
  const battle = state.battle;
  const fallback = options[0];
  if (!battle || !fallback) throw new Error('대상이 없습니다');
  if (options.length === 1 || fallback.targetIndex === undefined) return fallback;
  const killable = options.find((a) => {
    const enemy = a.targetIndex === undefined ? undefined : battle.enemies[a.targetIndex];
    return (
      enemy !== undefined && expectedDamage(state, card, a.targetIndex) >= enemy.hp + enemy.shield
    );
  });
  if (killable) return killable;
  let best: PlayAction | null = null;
  let bestIntent = 0;
  for (const a of options) {
    if (a.targetIndex === undefined) continue;
    const intent = describeIntent(state, a.targetIndex);
    const dmg = (intent.damage ?? 0) * (intent.hits ?? 1);
    if (dmg > bestIntent) {
      best = a;
      bestIntent = dmg;
    }
  }
  if (best) return best;
  return options.reduce((low, a) => {
    const hp = (i: number | undefined) =>
      i === undefined ? Infinity : (battle.enemies[i]?.hp ?? 0);
    return hp(a.targetIndex) < hp(low.targetIndex) ? a : low;
  });
}

/** 카드마다 행동을 묶음 (대상이 여러 개면 하나로) */
function groupByCard(actions: PlayAction[]): Map<number, PlayAction[]> {
  const map = new Map<number, PlayAction[]>();
  for (const a of actions) map.set(a.cardUid, [...(map.get(a.cardUid) ?? []), a]);
  return map;
}

// ── 전투 ──

function battleAction(state: GameState, legal: Action[], ctx: PolicyContext): Action {
  const battle = state.battle;
  if (!battle) throw new Error('전투가 없습니다');
  const run = state.run;
  if (!run) throw new Error('런이 없습니다');

  // 1. 끝낼 수 있으면 끝냄
  const lethal = findLethal(state, legal);
  if (lethal) return lethal;

  // 2. 진화 (당겨쓰지 않고)
  const evolveCost = previewEvolveCost(state);
  const evolveAllowed = ctx.evolve === 'asap' || (ctx.evolve === 'turn2' && battle.turn >= 2);
  if (evolveAllowed && evolveCost !== null && evolveCost <= battle.memory) {
    return { type: 'evolve' };
  }

  const byCard = groupByCard(playActions(legal));
  const affordable = (card: CardInstance) => costOf(card) <= battle.memory;

  // 3. 막기
  const incoming = incomingDamage(state);
  if (incoming > 0) {
    const allowOverdraw = incoming >= run.hp * BLOCK_OVERDRAW_HP_RATIO;
    let best: { card: CardInstance; options: PlayAction[] } | null = null;
    let bestShield = 0;
    for (const [uid, options] of byCard) {
      const card = cardOf(state, uid);
      if (!card || (!allowOverdraw && !affordable(card))) continue;
      const shield = shieldAmount(state, card);
      if (shield > bestShield) {
        best = { card, options };
        bestShield = shield;
      }
    }
    if (best) return chooseTarget(state, best.card, best.options);
  }

  // 4. 준비 카드: 비용 0, 뽑기, 힘 (당겨쓰지 않고)
  for (const [uid, options] of byCard) {
    const card = cardOf(state, uid);
    if (!card || !affordable(card)) continue;
    const effects = effectsOf(state, card);
    const isPrep =
      costOf(card) === 0 ||
      effects.some((e) => e.op === 'draw' || (e.op === 'applyStatus' && e.status === 'strength'));
    if (isPrep) return chooseTarget(state, card, options);
  }

  // 5. 공격: (예상 피해 ÷ max(비용, 1))이 가장 큰 것
  let bestAttack: PlayAction | null = null;
  let bestValue = 0;
  for (const [uid, options] of byCard) {
    const card = cardOf(state, uid);
    if (!card || !affordable(card) || !isAttackCard(card)) continue;
    const action = chooseTarget(state, card, options);
    const value = expectedDamage(state, card, action.targetIndex) / Math.max(costOf(card), 1);
    if (value > bestValue) {
      bestAttack = action;
      bestValue = value;
    }
  }
  if (bestAttack) return bestAttack;

  // 6. 턴 끝
  return { type: 'endTurn' };
}

// ── 전투 밖 ──

const MAP_PRIORITY_LOW_HP = ['rest', 'event', 'shop', 'treasure', 'battle', 'elite', 'boss'];
const MAP_PRIORITY_HIGH_HP = ['elite', 'treasure', 'battle', 'event', 'shop', 'rest', 'boss'];
const MAP_PRIORITY_MID_HP = ['treasure', 'battle', 'event', 'shop', 'rest', 'elite', 'boss'];

function mapAction(state: GameState, legal: Action[]): Action {
  const run = state.run;
  if (!run) throw new Error('런이 없습니다');
  const ratio = run.hp / run.maxHp;
  const order =
    ratio < 0.5 ? MAP_PRIORITY_LOW_HP : ratio >= 0.7 ? MAP_PRIORITY_HIGH_HP : MAP_PRIORITY_MID_HP;
  let best: Action | null = null;
  let bestRank = Infinity;
  for (const a of legal) {
    if (a.type !== 'chooseNode') continue;
    const node = run.map.nodes.find((n) => n.id === a.nodeId);
    const rank = node ? order.indexOf(node.type) : Infinity;
    if (rank < bestRank) {
      best = a;
      bestRank = rank;
    }
  }
  if (!best) throw new Error('갈 칸이 없습니다');
  return best;
}

function rewardAction(state: GameState): Action {
  const run = state.run;
  const offer = state.pending?.kind === 'reward' ? state.pending.offers[0] : undefined;
  if (!run || !offer || offer.cards.length === 0) return { type: 'skipCards' };
  let bestIndex = 0;
  let bestScore = -Infinity;
  offer.cards.forEach((c, i) => {
    const score = cardScore(c.defId, c.upgraded);
    if (score > bestScore) {
      bestIndex = i;
      bestScore = score;
    }
  });
  if (run.deck.length >= SKIP_DECK_SIZE && bestScore < SKIP_SCORE) return { type: 'skipCards' };
  return { type: 'pickCard', index: bestIndex };
}

function shopAction(state: GameState, legal: Action[]): Action {
  const run = state.run;
  if (!run || state.pending?.kind !== 'shop') return { type: 'proceed' };
  const shop = state.pending;
  // 살 수 있으면 점수가 가장 높은 카드 1장 (상점 한 곳에서 한 장)
  const boughtCard = shop.cards.some((c) => c.sold);
  if (!boughtCard) {
    let best: Action | null = null;
    let bestScore = -Infinity;
    for (const a of legal) {
      if (a.type !== 'shopBuyCard') continue;
      const item = shop.cards[a.index];
      const score = item ? cardScore(item.defId, false) : -Infinity;
      if (score > bestScore) {
        best = a;
        bestScore = score;
      }
    }
    if (best) return best;
  }
  // 남으면 타격 지우기
  const strike = run.deck.find((c) => c.defId === 'strike');
  if (strike && legal.some((a) => a.type === 'shopRemoveCard' && a.cardUid === strike.uid)) {
    return { type: 'shopRemoveCard', cardUid: strike.uid };
  }
  return { type: 'proceed' };
}

function restAction(state: GameState, legal: Action[]): Action {
  const run = state.run;
  if (!run) throw new Error('런이 없습니다');
  if (run.hp / run.maxHp < 0.6) return { type: 'restHeal' };
  let best: Action = { type: 'restHeal' };
  let bestScore = -Infinity;
  for (const a of legal) {
    if (a.type !== 'restUpgrade') continue;
    const card = run.deck.find((c) => c.uid === a.cardUid);
    const score = card ? cardScore(card.defId, false) : -Infinity;
    if (score > bestScore) {
      best = a;
      bestScore = score;
    }
  }
  return best;
}

function eventAction(state: GameState, legal: Action[]): Action {
  const run = state.run;
  if (!run || state.pending?.kind !== 'event') return legal[0] ?? { type: 'proceed' };
  const event = getEvent(state.pending.eventId);
  if (run.hp / run.maxHp < 0.3) {
    const safe = event.choices.findIndex((c) => !c.effects.some((e) => e.op === 'loseHp'));
    if (safe >= 0) return { type: 'eventChoose', index: safe };
  }
  return { type: 'eventChoose', index: 0 };
}

export const greedyPolicy: Policy = (state, legal, ctx) => {
  switch (state.phase) {
    case 'title':
      return { type: 'startRun', tamerId: ctx.tamerId };
    case 'battle':
      return battleAction(state, legal, ctx);
    case 'map':
      return mapAction(state, legal);
    case 'reward':
      return rewardAction(state);
    case 'shop':
      return shopAction(state, legal);
    case 'rest':
      return restAction(state, legal);
    case 'event':
      return eventAction(state, legal);
    default: {
      const first = legal[0];
      if (!first) throw new Error(`'${state.phase}'에서 할 수 있는 행동이 없습니다`);
      return first;
    }
  }
};
