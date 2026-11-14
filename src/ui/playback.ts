// 일어난 일(GameEvent)을 차례로 재생 (03 9.1, 04 T1-4)
// 재생 중에는 "행동 전 상태"의 복사본에 이벤트에 적힌 값을 차례로 반영해 보여 줍니다.
// 규칙을 다시 계산하지 않고, 이벤트가 알려 준 값(피해량, 메모리 등)만 옮겨 적습니다.
import type { GameEvent, GameState, Who } from '../core/index';

export type PlaybackSpeed = 'normal' | 'fast' | 'off';

/** 종류마다 걸리는 시간 (ms, 보통 속도). 없는 종류는 기다리지 않음 */
const DURATION: Partial<Record<GameEvent['type'], number>> = {
  cardPlayed: 420,
  damage: 380,
  hpLost: 300,
  healed: 300,
  shieldGained: 220,
  statusApplied: 220,
  evolved: 1100,
  enemyMoved: 520,
  enemyDied: 350,
  turnStarted: 450,
  battleEnded: 900,
  chipTriggered: 300,
  companionTriggered: 300,
  accelChanged: 200,
  handGroupsDrawn: 600,
};

const SPEED_FACTOR: Record<PlaybackSpeed, number> = { normal: 1, fast: 0.4, off: 0 };

export function eventDuration(event: GameEvent, speed: PlaybackSpeed): number {
  return Math.round((DURATION[event.type] ?? 0) * SPEED_FACTOR[speed]);
}

/** 연출할 가치가 있는 행동인지 (전투 안에서 일어난 일만 재생) */
export function shouldPlay(before: GameState, events: GameEvent[], speed: PlaybackSpeed): boolean {
  return speed !== 'off' && before.phase === 'battle' && events.some((e) => DURATION[e.type]);
}

function statusesOf(view: GameState, who: Who) {
  if (who === 'player') return view.battle?.statuses;
  return view.battle?.enemies[who]?.statuses;
}

/** 이벤트 하나를 보이는 상태에 반영 (보이는 것만, 규칙 계산 없음) */
export function applyEventToView(view: GameState, event: GameEvent): void {
  const battle = view.battle;
  const run = view.run;
  if (!battle || !run) return;
  switch (event.type) {
    case 'damage': {
      if (event.target === 'player') {
        battle.shield -= event.blocked;
        battle.tempHp -= event.tempHpLost;
        run.hp -= event.hpLost;
      } else {
        const enemy = battle.enemies[event.target];
        if (enemy) {
          enemy.shield -= event.blocked;
          enemy.hp -= event.hpLost;
        }
      }
      return;
    }
    case 'hpLost':
      run.hp -= event.amount;
      return;
    case 'healed':
      run.hp += event.amount;
      return;
    case 'shieldGained':
      if (event.target === 'player') battle.shield += event.amount;
      else {
        const enemy = battle.enemies[event.target];
        if (enemy) enemy.shield += event.amount;
      }
      return;
    case 'statusApplied': {
      const statuses = statusesOf(view, event.target);
      if (statuses) statuses[event.status] += event.amount;
      return;
    }
    case 'memoryChanged':
      battle.memory = event.memory;
      return;
    case 'enemyDied': {
      const enemy = battle.enemies[event.enemyIndex];
      if (enemy) enemy.alive = false;
      return;
    }
    case 'accelChanged': {
      const enemy = battle.enemies[event.enemyIndex];
      if (enemy) enemy.accel = event.accel;
      return;
    }
    case 'evolved':
      battle.stage = event.to;
      battle.tempHp += event.tempHpGained;
      return;
    case 'enemyIntent': {
      const enemy = battle.enemies[event.enemyIndex];
      if (enemy) enemy.intentMoveId = event.moveId;
      return;
    }
    case 'turnStarted':
      battle.turn = event.turn;
      return;
    case 'cardPlayed': {
      const i = battle.hand.findIndex((c) => c.uid === event.cardUid);
      const [card] = i >= 0 ? battle.hand.splice(i, 1) : [];
      if (card) battle.discardPile.push(card);
      return;
    }
    default:
      return;
  }
}
