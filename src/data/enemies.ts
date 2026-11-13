// 적 (02 9.3). 행동 이름은 게임용으로 새로 지은 것입니다.
// 적 이름은 아직 확인하지 못한 한국 방영판 이름이라 일본판 이름을 한글로 씁니다 (01 4절).
import type { EnemyDef } from '../core/types';

export const enemies = [
  // ── 일반 ──
  {
    id: 'goblimon',
    name: '고부리몬',
    tier: 'normal',
    attribute: 'virus',
    maxHp: 20,
    moves: [
      { id: 'club', name: '몽둥이질', effects: [{ op: 'attack', amount: 6 }] },
      {
        id: 'warcry',
        name: '함성',
        effects: [{ op: 'applyStatus', status: 'strength', amount: 2, target: 'self' }],
      },
    ],
    phases: [{ cycle: ['club', 'club', 'warcry'] }],
  },
  {
    id: 'vilemon',
    name: '이빌몬',
    tier: 'normal',
    attribute: 'virus',
    maxHp: 16,
    moves: [
      {
        id: 'nightmare',
        name: '악몽',
        effects: [
          { op: 'attack', amount: 5 },
          { op: 'addCard', cardId: 'bug_data', to: 'discard', count: 1 },
        ],
      },
      { id: 'claw', name: '할퀴기', effects: [{ op: 'attack', amount: 7 }] },
    ],
    phases: [{ cycle: ['nightmare', 'claw'] }],
  },
  {
    id: 'allomon',
    name: '알로몬',
    tier: 'normal',
    attribute: 'data',
    maxHp: 28,
    moves: [
      { id: 'bite', name: '물기', effects: [{ op: 'attack', amount: 9 }] },
      { id: 'brace', name: '버티기', effects: [{ op: 'shield', amount: 6 }] },
    ],
    phases: [{ cycle: ['bite', 'brace', 'bite'] }],
  },
  {
    id: 'gorillamon',
    name: '고릴라몬',
    tier: 'normal',
    attribute: 'data',
    maxHp: 34,
    moves: [
      { id: 'brace', name: '버티기', effects: [{ op: 'shield', amount: 8 }] },
      { id: 'smash', name: '내려치기', effects: [{ op: 'attack', amount: 15 }] },
      { id: 'punch', name: '주먹', effects: [{ op: 'attack', amount: 7 }] },
    ],
    phases: [{ cycle: ['brace', 'smash', 'punch'] }],
  },
  {
    id: 'harpymon',
    name: '하피몬',
    tier: 'normal',
    attribute: 'vaccine',
    maxHp: 18,
    moves: [
      { id: 'peck', name: '쪼기', effects: [{ op: 'attack', amount: 3, hits: 3 }] },
      { id: 'flutter', name: '날갯짓', effects: [{ op: 'shield', amount: 5 }] },
    ],
    phases: [{ cycle: ['peck', 'peck', 'flutter'] }],
  },
  {
    id: 'thunderbirdmon',
    name: '썬더버드몬',
    tier: 'normal',
    attribute: 'vaccine',
    maxHp: 24,
    moves: [
      { id: 'thunder', name: '낙뢰', effects: [{ op: 'attack', amount: 8 }] },
      {
        id: 'static',
        name: '정전기',
        effects: [{ op: 'applyStatus', status: 'vulnerable', amount: 2, target: 'player' }],
      },
    ],
    phases: [{ cycle: ['thunder', 'static', 'thunder'] }],
  },

  // ── 강적 ──
  {
    id: 'icedevimon',
    name: '아이스데블몬',
    tier: 'elite',
    attribute: 'virus',
    maxHp: 60,
    moves: [
      { id: 'ice_claw', name: '얼음 발톱', effects: [{ op: 'attack', amount: 12 }] },
      {
        id: 'frost_breath',
        name: '서리 입김',
        effects: [
          { op: 'applyStatus', status: 'weak', amount: 2, target: 'player' },
          { op: 'attack', amount: 6 },
        ],
      },
      {
        id: 'ice_wall',
        name: '얼음 벽',
        effects: [
          { op: 'shield', amount: 10 },
          { op: 'applyStatus', status: 'strength', amount: 2, target: 'self' },
        ],
      },
    ],
    phases: [{ cycle: ['ice_claw', 'frost_breath', 'ice_wall'] }],
  },
  {
    id: 'musyamon',
    name: '무사몬',
    tier: 'elite',
    attribute: 'data',
    maxHp: 55,
    moves: [
      { id: 'triple_cut', name: '삼단 베기', effects: [{ op: 'attack', amount: 5, hits: 3 }] },
      { id: 'great_cut', name: '큰 베기', effects: [{ op: 'attack', amount: 14 }] },
      {
        id: 'focus',
        name: '정신 집중',
        effects: [{ op: 'applyStatus', status: 'strength', amount: 3, target: 'self' }],
      },
    ],
    phases: [{ cycle: ['triple_cut', 'great_cut', 'focus'] }],
  },

  // ── 보스 ──
  {
    id: 'mihiramon',
    name: '미히라몬',
    tier: 'boss',
    attribute: 'none',
    maxHp: 120,
    moves: [
      { id: 'pounce', name: '덮치기', effects: [{ op: 'attack', amount: 12 }] },
      { id: 'claw_flurry', name: '연속 할퀴기', effects: [{ op: 'attack', amount: 4, hits: 3 }] },
      {
        id: 'crouch',
        name: '웅크리기',
        effects: [
          { op: 'shield', amount: 12 },
          { op: 'applyStatus', status: 'strength', amount: 2, target: 'self' },
        ],
      },
      {
        id: 'roar',
        name: '포효',
        effects: [
          { op: 'applyStatus', status: 'vulnerable', amount: 2, target: 'player' },
          { op: 'applyStatus', status: 'weak', amount: 2, target: 'player' },
        ],
      },
      { id: 'rampage', name: '날뛰기', effects: [{ op: 'attack', amount: 18 }] },
      { id: 'fang_flurry', name: '연속 물기', effects: [{ op: 'attack', amount: 6, hits: 3 }] },
    ],
    phases: [
      { untilHpPct: 0.5, cycle: ['pounce', 'claw_flurry', 'crouch'] },
      { onEnter: 'roar', cycle: ['rampage', 'fang_flurry'] },
    ],
  },
] satisfies EnemyDef[];
