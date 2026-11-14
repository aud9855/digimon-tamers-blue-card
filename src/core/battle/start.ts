// 02 3.2 전투 시작
import { constants, getEncounter } from '../../data/index';
import { emptyStatuses, hasKeyword, hazardOn, pctFloor, requireRun } from '../helpers';
import { triggerChips } from '../chips';
import { shuffle } from '../rng';
import { winIfCleared } from './outcome';
import type { BattleState, EnemyState, GameEvent, GameState } from '../types';
import { createEnemy } from './enemy';
import { setPhase } from '../phase';
import { startPlayerTurn } from './turn';

/** 해저드 1·9: 적의 최대 HP (02 13.6) */
function hazardEnemy(state: GameState, enemy: EnemyState, kind: BattleState['kind']): EnemyState {
  if (!hazardOn(state, 'enemyHp')) return enemy;
  let maxHp = pctFloor(enemy.maxHp, constants.HAZARD_ENEMY_HP_PCT);
  if (kind === 'boss' && hazardOn(state, 'bossHp')) {
    maxHp = Math.floor(
      (enemy.maxHp * constants.HAZARD_ENEMY_HP_PCT * constants.HAZARD_BOSS_HP_PCT) / 10000,
    );
  }
  return { ...enemy, maxHp, hp: maxHp };
}

export function startBattle(
  state: GameState,
  events: GameEvent[],
  encounterId: string,
  kind: BattleState['kind'],
): void {
  const run = requireRun(state);
  const encounter = getEncounter(encounterId);
  const firstStage = constants.STAGE_ORDER[0];
  if (!firstStage) throw new Error('STAGE_ORDER가 비었습니다');

  // 2. 덱을 복사해 섞고, innate 카드는 맨 위(배열의 끝)로
  const shuffled = shuffle(
    state,
    'battle',
    run.deck.map((c) => ({ ...c })),
  );
  const drawPile = [
    ...shuffled.filter((c) => !hasKeyword(c, 'innate')),
    ...shuffled.filter((c) => hasKeyword(c, 'innate')),
  ];

  // 1·3. 플레이어 초기값, 적 만들기
  state.battle = {
    kind,
    encounterId,
    hpAtStart: run.hp,
    evolveCount: 0,
    turn: 0,
    memory: 0,
    stage: firstStage,
    shield: 0,
    tempHp: 0,
    statuses: emptyStatuses(),
    evolvedThisTurn: false,
    freeEvolve: false,
    cardsPlayedThisTurn: 0,
    rampage: false,
    handChoice: null,
    drawPile,
    hand: [],
    discardPile: [],
    exhaustPile: [],
    companions: [],
    enemies: encounter.enemies.map((id) => hazardEnemy(state, createEnemy(id), kind)),
  };
  state.pending = null;
  setPhase(state, events, 'battle');
  events.push({ type: 'battleStarted', encounterId });
  state.battle.enemies.forEach((enemy, enemyIndex) =>
    events.push({ type: 'enemyIntent', enemyIndex, moveId: enemy.intentMoveId }),
  );

  // 4.
  triggerChips(state, events, 'onBattleStart');
  if (winIfCleared(state, events)) return;
  // 5.
  startPlayerTurn(state, events);
}
