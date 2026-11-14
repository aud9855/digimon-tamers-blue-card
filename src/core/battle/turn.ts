// 02 3.3 플레이어 턴 시작, 3.10 턴 끝과 적 턴
import { constants } from '../../data/index';
import { isMatrix, requireBattle, requireRun } from '../helpers';
import { handGroups, triggerChips } from '../chips';
import type { GameEvent, GameState } from '../types';
import { loseHp } from './damage';
import { enemyTakeTurn } from './enemy';
import { battleStopped, winIfCleared } from './outcome';
import { drawCards, drawGroup, putInHandOrDiscard, turnDrawCount } from './piles';
import { hasKeyword } from '../helpers';

/** 02 3.3 (이 순서대로) */
export function startPlayerTurn(state: GameState, events: GameEvent[]): void {
  const battle = requireBattle(state);
  const run = requireRun(state);

  // 1.
  battle.turn += 1;
  events.push({ type: 'turnStarted', turn: battle.turn });
  // 폭주의 대가: 폭주한 다음 턴부터 HP를 잃음 (02 13.2)
  if (battle.rampage) {
    loseHp(state, events, constants.RAMPAGE_HP_LOSS);
    if (battleStopped(state)) return;
  }
  // 2. 첫 턴에는 실드를 지우지 않음 (전투 시작 칩이 준 실드를 살림)
  if (battle.turn >= 2) battle.shield = 0;
  // 3.
  // 매트릭스 에볼루션 중이면 메모리 +1 (02 13.1)
  battle.memory = run.maxMemory + (isMatrix(state) ? constants.MATRIX_MEMORY_BONUS : 0);
  events.push({ type: 'memoryChanged', memory: battle.memory });
  // 4.
  battle.evolvedThisTurn = false;
  battle.freeEvolve = false;
  battle.cardsPlayedThisTurn = 0;
  // 5. 두 사람의 카드면 두 묶음을 뽑고 고를 때까지 멈춤 (02 13.3)
  if (handGroups(state) >= 2) {
    const count = turnDrawCount(state);
    const groups = [drawGroup(state, events, count), drawGroup(state, events, count)];
    battle.handChoice = groups;
    events.push({ type: 'handGroupsDrawn', groups: groups.map((g) => g.map((c) => c.uid)) });
    return;
  }
  drawCards(state, events, turnDrawCount(state));
  finishTurnStart(state, events);
}

/** 3.3의 6·7번 (칩) */
function finishTurnStart(state: GameState, events: GameEvent[]): void {
  const battle = requireBattle(state);
  // 6.
  if (battle.turn === 1) triggerChips(state, events, 'onFirstTurn');
  if (winIfCleared(state, events)) return;
  // 7.
  triggerChips(state, events, 'onTurnStart');
  winIfCleared(state, events);
}

/** 두 묶음 중 하나를 손패로, 다른 묶음은 버림 더미로 (02 13.3) */
export function chooseHandGroup(state: GameState, events: GameEvent[], index: number): void {
  const battle = requireBattle(state);
  const groups = battle.handChoice;
  const chosen = groups?.[index];
  if (!groups || !chosen) throw new Error(`고를 수 없는 묶음: ${index}`);
  battle.handChoice = null;
  events.push({ type: 'handGroupChosen', index });
  for (const card of chosen) putInHandOrDiscard(state, events, card);
  groups.forEach((group, i) => {
    if (i === index) return;
    for (const card of group) {
      battle.discardPile.push(card);
      events.push({ type: 'cardMoved', cardUid: card.uid, to: 'discard' });
    }
  });
  finishTurnStart(state, events);
}

/** 02 3.10 (이 순서대로) */
export function endTurn(state: GameState, events: GameEvent[]): void {
  const battle = requireBattle(state);
  events.push({ type: 'turnEnded', turn: battle.turn, memory: battle.memory });

  // 1. 당겨쓴 만큼 살아 있는 모든 적에게 가속 (02 3.6)
  if (battle.memory < 0) {
    const n = -battle.memory;
    battle.enemies.forEach((enemy, enemyIndex) => {
      if (!enemy.alive) return;
      enemy.accel += n;
      events.push({ type: 'accelChanged', enemyIndex, accel: enemy.accel });
    });
  }

  // 2. 보존이 없는 손패를 버림
  const kept = [];
  for (const card of battle.hand) {
    if (hasKeyword(card, 'retain')) {
      kept.push(card);
    } else {
      battle.discardPile.push(card);
      events.push({ type: 'cardMoved', cardUid: card.uid, to: 'discard' });
    }
  }
  battle.hand = kept;

  // 3. 플레이어 약화·취약 1씩 감소
  battle.statuses.weak = Math.max(0, battle.statuses.weak - 1);
  battle.statuses.vulnerable = Math.max(0, battle.statuses.vulnerable - 1);

  // 4. 살아 있는 적을 앞에서부터 한 마리씩
  for (let i = 0; i < battle.enemies.length; i++) {
    enemyTakeTurn(state, events, i);
    if (battleStopped(state)) return; // 패배
  }
  if (winIfCleared(state, events)) return;

  // 5.
  startPlayerTurn(state, events);
}
