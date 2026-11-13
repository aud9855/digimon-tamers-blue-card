// 02 4.3 효과 실행 (카드와 칩이 함께 씀)
import { livingEnemyIndexes, requireBattle, stageIndex } from '../helpers';
import { nextInt } from '../rng';
import type { Effect, GameEvent, GameState, StatusId, Who } from '../types';
import { heal, hitEnemy, loseHp } from './damage';
import { allEnemiesDead, battleStopped } from './outcome';
import { createTempCards, drawCards } from './piles';

export interface EffectContext {
  /** 카드가 지정한 적 ('enemy' 대상 효과에 씀) */
  targetIndex?: number;
}

/** 02 3.5 "효과 실행 중 규칙": 패배를 먼저, 그다음 적이 모두 죽었는지 봅니다 */
function mustStop(state: GameState): boolean {
  return battleStopped(state) || allEnemiesDead(state);
}

/** 효과를 적힌 순서대로 실행합니다. 패배하거나 적이 모두 죽으면 남은 효과를 건너뜁니다 */
export function runEffects(
  state: GameState,
  events: GameEvent[],
  effects: readonly Effect[],
  ctx: EffectContext,
): void {
  for (const effect of effects) {
    if (mustStop(state)) return;
    runEffect(state, events, effect, ctx);
  }
}

function runEffect(state: GameState, events: GameEvent[], effect: Effect, ctx: EffectContext) {
  const battle = requireBattle(state);
  switch (effect.op) {
    case 'damage':
      runDamage(state, events, effect, ctx);
      return;
    case 'shield':
      battle.shield += effect.amount;
      events.push({ type: 'shieldGained', target: 'player', amount: effect.amount });
      return;
    case 'draw':
      drawCards(state, events, effect.count);
      return;
    case 'gainMemory':
      battle.memory += effect.amount;
      events.push({ type: 'memoryChanged', memory: battle.memory });
      return;
    case 'heal':
      heal(state, events, effect.amount);
      return;
    case 'loseHp':
      loseHp(state, events, effect.amount);
      return;
    case 'applyStatus':
      if (effect.target === 'self') {
        applyStatus(state, events, 'player', effect.status, effect.amount);
      } else if (effect.target === 'enemy') {
        const i = ctx.targetIndex;
        // 죽은 적을 대상으로 하는 남은 효과는 건너뜁니다 (02 3.5)
        if (i !== undefined && battle.enemies[i]?.alive) {
          applyStatus(state, events, i, effect.status, effect.amount);
        }
      } else {
        for (const i of livingEnemyIndexes(battle)) {
          applyStatus(state, events, i, effect.status, effect.amount);
        }
      }
      return;
    case 'freeEvolve':
      battle.freeEvolve = true;
      return;
    case 'addCard':
      createTempCards(state, events, effect.cardId, effect.to, effect.count);
      return;
    case 'ifStage':
      runEffects(
        state,
        events,
        stageIndex(battle.stage) >= stageIndex(effect.min) ? effect.then : (effect.else ?? []),
        ctx,
      );
      return;
    case 'ifEvolvedThisTurn':
      runEffects(state, events, battle.evolvedThisTurn ? effect.then : (effect.else ?? []), ctx);
      return;
  }
}

function runDamage(
  state: GameState,
  events: GameEvent[],
  effect: Extract<Effect, { op: 'damage' }>,
  ctx: EffectContext,
): void {
  const battle = requireBattle(state);
  const hits = effect.hits ?? 1;
  for (let h = 0; h < hits; h++) {
    if (mustStop(state)) return;
    if (effect.target === 'enemy') {
      const i = ctx.targetIndex;
      if (i === undefined || !battle.enemies[i]?.alive) return; // 대상이 죽으면 남은 hit 건너뜀
      hitEnemy(state, events, effect.amount, i);
    } else if (effect.target === 'randomEnemy') {
      const living = livingEnemyIndexes(battle);
      const i = living[nextInt(state, 'battle', living.length)];
      if (i !== undefined) hitEnemy(state, events, effect.amount, i);
    } else {
      // allEnemies: 살아 있는 적을 앞에서부터 차례로
      for (const i of livingEnemyIndexes(battle)) {
        hitEnemy(state, events, effect.amount, i);
      }
    }
  }
}

/** 상태 효과 부여. 같은 상태를 또 받으면 값을 더합니다 (02 3.9) */
export function applyStatus(
  state: GameState,
  events: GameEvent[],
  target: Who,
  status: StatusId,
  amount: number,
): void {
  const battle = requireBattle(state);
  const statuses = target === 'player' ? battle.statuses : battle.enemies[target]?.statuses;
  if (!statuses) throw new Error(`없는 대상: ${target}`);
  statuses[status] += amount;
  events.push({ type: 'statusApplied', target, status, amount });
}
