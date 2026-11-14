// 적 (02 9.3, 12.9). 행동 이름은 게임용으로 새로 지은 것입니다.
// 적 이름은 아직 확인하지 못한 한국 방영판 이름이라 일본판 이름을 한글로 씁니다 (01 4절).
import type { EnemyDef } from '../core/types';

export const enemies = [
  // ── 일반 ──
  {
    id: 'goblimon',
    name: '고부리몬',
    tier: 'normal',
    attribute: 'virus',
    maxHp: 35,
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
    maxHp: 28,
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
    maxHp: 49,
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
    maxHp: 60,
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
    maxHp: 32,
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
    maxHp: 42,
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
    maxHp: 90,
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
    maxHp: 83,
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
    maxHp: 138,
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

  // ── 2막: 일반 ──
  {
    id: 'gotsumon',
    name: '고츠몬',
    tier: 'normal',
    attribute: 'data',
    maxHp: 50,
    moves: [
      { id: 'harden', name: '굳히기', effects: [{ op: 'shield', amount: 8 }] },
      { id: 'rock_fist', name: '바위 주먹', effects: [{ op: 'attack', amount: 12 }] },
      { id: 'pebbles', name: '돌 던지기', effects: [{ op: 'attack', amount: 6, hits: 2 }] },
    ],
    phases: [{ cycle: ['harden', 'rock_fist', 'pebbles'] }],
  },
  {
    id: 'gekomon',
    name: '게코몬',
    tier: 'normal',
    attribute: 'data',
    maxHp: 46,
    moves: [
      {
        id: 'croak',
        name: '울림 소리',
        effects: [{ op: 'applyStatus', status: 'vulnerable', amount: 2, target: 'player' }],
      },
      { id: 'horn_blow', name: '나팔 불기', effects: [{ op: 'attack', amount: 10 }] },
    ],
    phases: [{ cycle: ['croak', 'horn_blow', 'horn_blow'] }],
  },
  {
    id: 'kuwagamon',
    name: '쿠와가몬',
    tier: 'normal',
    attribute: 'virus',
    maxHp: 58,
    moves: [
      { id: 'scissor', name: '집게', effects: [{ op: 'attack', amount: 7, hits: 2 }] },
      { id: 'dive', name: '내리꽂기', effects: [{ op: 'attack', amount: 16 }] },
      {
        id: 'rage',
        name: '날개 떨기',
        effects: [{ op: 'applyStatus', status: 'strength', amount: 2, target: 'self' }],
      },
    ],
    phases: [{ cycle: ['scissor', 'dive', 'rage'] }],
  },
  {
    id: 'pico_devimon',
    name: '피코데블몬',
    tier: 'normal',
    attribute: 'virus',
    maxHp: 40,
    moves: [
      {
        id: 'tease',
        name: '놀리기',
        effects: [
          { op: 'applyStatus', status: 'weak', amount: 1, target: 'player' },
          { op: 'attack', amount: 6 },
        ],
      },
      { id: 'pin', name: '바늘 찌르기', effects: [{ op: 'attack', amount: 6, hits: 2 }] },
      {
        id: 'virus_bite',
        name: '바이러스 물기',
        effects: [
          { op: 'attack', amount: 4 },
          { op: 'addCard', cardId: 'bug_data', to: 'discard', count: 1 },
        ],
      },
    ],
    phases: [{ cycle: ['tease', 'pin', 'virus_bite'] }],
  },
  {
    id: 'unimon',
    name: '유니몬',
    tier: 'normal',
    attribute: 'vaccine',
    maxHp: 62,
    moves: [
      { id: 'charge', name: '돌진', effects: [{ op: 'attack', amount: 14 }] },
      { id: 'wing_guard', name: '날개 막기', effects: [{ op: 'shield', amount: 10 }] },
      { id: 'hoof', name: '발굽 차기', effects: [{ op: 'attack', amount: 5, hits: 3 }] },
    ],
    phases: [{ cycle: ['charge', 'wing_guard', 'hoof'] }],
  },
  {
    id: 'piddomon',
    name: '피드몬',
    tier: 'normal',
    attribute: 'vaccine',
    maxHp: 48,
    moves: [
      {
        id: 'holy_strike',
        name: '빛의 일격',
        effects: [
          { op: 'attack', amount: 8 },
          { op: 'shield', amount: 6 },
        ],
      },
      { id: 'feather', name: '깃털 날리기', effects: [{ op: 'attack', amount: 4, hits: 3 }] },
      {
        id: 'pray',
        name: '기도',
        effects: [{ op: 'applyStatus', status: 'strength', amount: 2, target: 'self' }],
      },
    ],
    phases: [{ cycle: ['holy_strike', 'feather', 'pray'] }],
  },

  // ── 2막: 강적 (데바) ──
  {
    id: 'sandiramon',
    name: '산디라몬',
    tier: 'elite',
    attribute: 'data',
    maxHp: 140,
    moves: [
      { id: 'coil', name: '똬리 휘감기', effects: [{ op: 'attack', amount: 8, hits: 3 }] },
      {
        id: 'shed',
        name: '허물 벗기',
        effects: [
          { op: 'shield', amount: 15 },
          { op: 'applyStatus', status: 'strength', amount: 2, target: 'self' },
        ],
      },
      { id: 'venom_fang', name: '독니', effects: [{ op: 'attack', amount: 20 }] },
    ],
    phases: [{ cycle: ['coil', 'shed', 'venom_fang'] }],
  },
  {
    id: 'vajramon',
    name: '바즈라몬',
    tier: 'elite',
    attribute: 'virus',
    maxHp: 150,
    moves: [
      { id: 'horn_charge', name: '뿔 들이받기', effects: [{ op: 'attack', amount: 22 }] },
      {
        id: 'war_stance',
        name: '위압',
        effects: [
          { op: 'applyStatus', status: 'weak', amount: 2, target: 'player' },
          { op: 'applyStatus', status: 'vulnerable', amount: 2, target: 'player' },
        ],
      },
      { id: 'twin_blade', name: '쌍칼', effects: [{ op: 'attack', amount: 9, hits: 2 }] },
    ],
    phases: [{ cycle: ['horn_charge', 'war_stance', 'twin_blade'] }],
  },

  // ── 2막: 보스 ──
  {
    id: 'zhuqiaomon',
    name: '주작몬',
    tier: 'boss',
    attribute: 'none',
    maxHp: 260,
    moves: [
      { id: 'flame_wing', name: '불꽃 날개', effects: [{ op: 'attack', amount: 15 }] },
      { id: 'ember_rain', name: '불씨 비', effects: [{ op: 'attack', amount: 5, hits: 4 }] },
      {
        id: 'rise',
        name: '날아오르기',
        effects: [
          { op: 'shield', amount: 20 },
          { op: 'applyStatus', status: 'strength', amount: 3, target: 'self' },
        ],
      },
      {
        id: 'vermilion_flame',
        name: '주작의 불꽃',
        effects: [
          { op: 'applyStatus', status: 'vulnerable', amount: 2, target: 'player' },
          { op: 'attack', amount: 10 },
        ],
      },
      { id: 'inferno', name: '업화', effects: [{ op: 'attack', amount: 25 }] },
      { id: 'phoenix_dive', name: '불새 강하', effects: [{ op: 'attack', amount: 8, hits: 3 }] },
      {
        id: 'ash_storm',
        name: '잿빛 폭풍',
        effects: [
          { op: 'attack', amount: 10 },
          { op: 'addCard', cardId: 'bug_data', to: 'draw', count: 2 },
        ],
      },
    ],
    phases: [
      { untilHpPct: 0.5, cycle: ['flame_wing', 'ember_rain', 'rise'] },
      { onEnter: 'vermilion_flame', cycle: ['inferno', 'phoenix_dive', 'ash_storm'] },
    ],
  },

  // ── 3막: 일반 (디 리퍼 에이전트) ──
  {
    id: 'reaper_searcher',
    name: '리퍼 서처',
    tier: 'normal',
    attribute: 'vaccine',
    maxHp: 60,
    moves: [
      {
        id: 'scan',
        name: '탐색',
        effects: [{ op: 'applyStatus', status: 'vulnerable', amount: 2, target: 'player' }],
      },
      { id: 'twin_probe', name: '탐침', effects: [{ op: 'attack', amount: 9, hits: 2 }] },
      { id: 'delete_beam', name: '삭제 광선', effects: [{ op: 'attack', amount: 18 }] },
    ],
    phases: [{ cycle: ['scan', 'twin_probe', 'delete_beam'] }],
  },
  {
    id: 'reaper_creeper',
    name: '리퍼 크리퍼',
    tier: 'normal',
    attribute: 'data',
    maxHp: 70,
    moves: [
      { id: 'spread', name: '번지기', effects: [{ op: 'shield', amount: 12 }] },
      { id: 'tendrils', name: '촉수', effects: [{ op: 'attack', amount: 6, hits: 3 }] },
      {
        id: 'corrupt',
        name: '오염',
        effects: [
          { op: 'attack', amount: 8 },
          { op: 'addCard', cardId: 'bug_data', to: 'draw', count: 1 },
        ],
      },
    ],
    phases: [{ cycle: ['spread', 'tendrils', 'corrupt'] }],
  },
  {
    id: 'reaper_paranoia',
    name: '리퍼 파라노이아',
    tier: 'normal',
    attribute: 'virus',
    maxHp: 55,
    moves: [
      { id: 'barrage', name: '난사', effects: [{ op: 'attack', amount: 4, hits: 4 }] },
      {
        id: 'jam',
        name: '교란',
        effects: [{ op: 'applyStatus', status: 'weak', amount: 2, target: 'player' }],
      },
      { id: 'overload', name: '과부하', effects: [{ op: 'attack', amount: 20 }] },
    ],
    phases: [{ cycle: ['barrage', 'jam', 'overload'] }],
  },

  // ── 3막: 강적 ──
  {
    id: 'reaper_horn_striker',
    name: '리퍼 혼 스트라이커',
    tier: 'elite',
    attribute: 'data',
    maxHp: 180,
    moves: [
      { id: 'horn_strike', name: '뿔 찌르기', effects: [{ op: 'attack', amount: 28 }] },
      { id: 'carapace', name: '껍질 두르기', effects: [{ op: 'shield', amount: 20 }] },
      { id: 'triple_horn', name: '세 번 찌르기', effects: [{ op: 'attack', amount: 10, hits: 3 }] },
    ],
    phases: [{ cycle: ['horn_strike', 'carapace', 'triple_horn'] }],
  },
  {
    id: 'reaper_optimizer',
    name: '리퍼 옵티마이저',
    tier: 'elite',
    attribute: 'vaccine',
    maxHp: 170,
    moves: [
      {
        id: 'optimize',
        name: '최적화',
        effects: [
          { op: 'applyStatus', status: 'strength', amount: 3, target: 'self' },
          { op: 'shield', amount: 10 },
        ],
      },
      { id: 'quad_cut', name: '네 번 베기', effects: [{ op: 'attack', amount: 7, hits: 4 }] },
      {
        id: 'expose',
        name: '약점 노출',
        effects: [
          { op: 'applyStatus', status: 'vulnerable', amount: 2, target: 'player' },
          { op: 'attack', amount: 12 },
        ],
      },
    ],
    phases: [{ cycle: ['optimize', 'quad_cut', 'expose'] }],
  },

  // ── 3막: 보스 ──
  {
    id: 'd_reaper',
    name: '디 리퍼',
    tier: 'boss',
    attribute: 'none',
    maxHp: 380,
    moves: [
      { id: 'erase', name: '지우기', effects: [{ op: 'attack', amount: 18 }] },
      { id: 'swarm', name: '떼 공격', effects: [{ op: 'attack', amount: 6, hits: 4 }] },
      {
        id: 'enclose',
        name: '둘러싸기',
        effects: [
          { op: 'shield', amount: 25 },
          { op: 'applyStatus', status: 'strength', amount: 2, target: 'self' },
        ],
      },
      {
        id: 'diffuse',
        name: '확산',
        effects: [{ op: 'addCard', cardId: 'bug_data', to: 'discard', count: 3 }],
      },
      { id: 'devour', name: '삼키기', effects: [{ op: 'attack', amount: 28 }] },
      { id: 'lash', name: '휘감기', effects: [{ op: 'attack', amount: 9, hits: 3 }] },
      {
        id: 'suppress',
        name: '억누르기',
        effects: [
          { op: 'applyStatus', status: 'weak', amount: 2, target: 'player' },
          { op: 'applyStatus', status: 'vulnerable', amount: 2, target: 'player' },
        ],
      },
      {
        id: 'final_process',
        name: '최종 처리',
        effects: [{ op: 'applyStatus', status: 'strength', amount: 5, target: 'self' }],
      },
      { id: 'collapse', name: '붕괴', effects: [{ op: 'attack', amount: 12, hits: 3 }] },
      { id: 'annihilate', name: '소멸', effects: [{ op: 'attack', amount: 35 }] },
    ],
    phases: [
      { untilHpPct: 0.6, cycle: ['erase', 'swarm', 'enclose'] },
      { untilHpPct: 0.3, onEnter: 'diffuse', cycle: ['devour', 'lash', 'suppress'] },
      { onEnter: 'final_process', cycle: ['collapse', 'annihilate'] },
    ],
  },
] satisfies EnemyDef[];
