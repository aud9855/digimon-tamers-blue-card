// 02 3.10 적 행동, 3.10.1 적의 행동 고르기
import { getEnemy } from '../../data/index';
import {
  emptyStatuses,
  livingEnemyIndexes,
  requireBattle,
  requireRun,
  stageIndex,
  unreachable,
} from '../helpers';
import type { EnemyCondition, EnemyMove, EnemyState, GameEvent, GameState } from '../types';
import { hitPlayer } from './damage';
import { applyStatus } from './effects';
import { battleStopped } from './outcome';
import { createTempCards } from './piles';

/** 전투 시작 때의 적: 페이즈 0, 순환 위치 0, 인텐트는 그 순환의 첫 행동 (02 3.2) */
export function createEnemy(defId: string): EnemyState {
  const def = getEnemy(defId);
  const first = def.phases[0]?.cycle[0];
  if (!first) throw new Error(`적 ${defId}의 첫 순환 행동이 없습니다`);
  return {
    defId,
    hp: def.maxHp,
    maxHp: def.maxHp,
    shield: 0,
    alive: true,
    statuses: emptyStatuses(),
    accel: 0,
    phaseIndex: 0,
    cycleIndex: 0,
    intentMoveId: first,
    usedReactions: [],
    reacting: false,
  };
}

export function getMove(enemy: EnemyState, moveId: string): EnemyMove {
  const move = getEnemy(enemy.defId).moves.find((m) => m.id === moveId);
  if (!move) throw new Error(`적 ${enemy.defId}에게 없는 행동: ${moveId}`);
  return move;
}

/** 3.10의 4번: 적 한 마리의 차례 */
export function enemyTakeTurn(state: GameState, events: GameEvent[], enemyIndex: number): void {
  const battle = requireBattle(state);
  const enemy = battle.enemies[enemyIndex];
  if (!enemy || !enemy.alive) return;

  // 1. 실드를 지움
  enemy.shield = 0;

  // 2. 인텐트 행동의 효과를 순서대로
  const move = getMove(enemy, enemy.intentMoveId);
  events.push({ type: 'enemyMoved', enemyIndex, moveId: move.id });
  for (const effect of move.effects) {
    if (battleStopped(state)) return;
    switch (effect.op) {
      case 'attack': {
        const hits = effect.hits ?? 1;
        for (let h = 0; h < hits; h++) {
          if (battleStopped(state)) return;
          hitPlayer(state, events, effect.amount, enemyIndex);
        }
        break;
      }
      case 'shield':
        enemy.shield += effect.amount;
        events.push({ type: 'shieldGained', target: enemyIndex, amount: effect.amount });
        break;
      case 'applyStatus':
        applyStatus(
          state,
          events,
          effect.target === 'self' ? enemyIndex : 'player',
          effect.status,
          effect.amount,
        );
        break;
      case 'addCard':
        createTempCards(state, events, effect.cardId, effect.to, effect.count);
        break;
      default:
        unreachable(effect, '적 행동 효과');
    }
  }
  if (battleStopped(state)) return;

  // 3. 공격이 들어 있는 행동을 했으면 가속이 사라짐
  if (move.effects.some((e) => e.op === 'attack') && enemy.accel > 0) {
    enemy.accel = 0;
    events.push({ type: 'accelChanged', enemyIndex, accel: 0 });
  }

  // 4. 약화·취약 1씩 감소
  enemy.statuses.weak = Math.max(0, enemy.statuses.weak - 1);
  enemy.statuses.vulnerable = Math.max(0, enemy.statuses.vulnerable - 1);

  // 5. 다음 인텐트
  chooseNextIntent(state, events, enemyIndex);
}

/** 02 3.10.1 다음 인텐트 정하기 */
export function chooseNextIntent(state: GameState, events: GameEvent[], enemyIndex: number): void {
  const battle = requireBattle(state);
  const enemy = battle.enemies[enemyIndex];
  if (!enemy) throw new Error(`없는 적 위치: ${enemyIndex}`);
  const def = getEnemy(enemy.defId);
  const phase = def.phases[enemy.phaseIndex];
  if (!phase) throw new Error(`적 ${enemy.defId}에게 없는 페이즈: ${enemy.phaseIndex}`);

  enemy.reacting = false;
  // 1. 페이즈 전환
  const nextPhase = def.phases[enemy.phaseIndex + 1];
  if (phase.untilHpPct !== undefined && nextPhase && enemy.hp / enemy.maxHp <= phase.untilHpPct) {
    enemy.phaseIndex += 1;
    events.push({ type: 'enemyPhaseChanged', enemyIndex, phaseIndex: enemy.phaseIndex });
    if (nextPhase.onEnter) {
      enemy.cycleIndex = -1;
      enemy.intentMoveId = nextPhase.onEnter;
    } else {
      enemy.cycleIndex = 0;
      enemy.intentMoveId = cycleMove(nextPhase.cycle, 0);
    }
  } else {
    // 2. 전환이 없으면: 아직 쓰지 않았고 조건이 맞는 첫 반응 (02 14.1). 순환 위치는 그대로
    const reactions = def.reactions ?? [];
    const index = reactions.findIndex(
      (r, i) => !enemy.usedReactions.includes(i) && conditionMet(state, enemyIndex, r.when),
    );
    const reaction = reactions[index];
    if (reaction) {
      enemy.usedReactions.push(index);
      enemy.reacting = true;
      enemy.intentMoveId = reaction.move;
    } else {
      // 반응이 없으면 순환 위치를 1 올림 (-1이었으면 0)
      enemy.cycleIndex = (enemy.cycleIndex + 1) % phase.cycle.length;
      enemy.intentMoveId = cycleMove(phase.cycle, enemy.cycleIndex);
    }
  }
  events.push(
    enemy.reacting
      ? { type: 'enemyIntent', enemyIndex, moveId: enemy.intentMoveId, reaction: true }
      : { type: 'enemyIntent', enemyIndex, moveId: enemy.intentMoveId },
  );
}

function cycleMove(cycle: readonly string[], index: number): string {
  const id = cycle[index];
  if (id === undefined) throw new Error(`순환 위치 ${index}에 행동이 없습니다`);
  return id;
}

/** 02 14.1 반응 조건 */
function conditionMet(state: GameState, enemyIndex: number, when: EnemyCondition): boolean {
  const battle = requireBattle(state);
  if ('partnerStageAtLeast' in when) {
    return stageIndex(battle.stage) >= stageIndex(when.partnerStageAtLeast);
  }
  if ('alone' in when) {
    const living = livingEnemyIndexes(battle);
    return living.length === 1 && living[0] === enemyIndex;
  }
  const run = requireRun(state);
  return run.hp / run.maxHp <= when.playerHpAtMostPct;
}
