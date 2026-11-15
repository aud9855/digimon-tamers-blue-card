// 적 2판 도트 B (04 7절 2판, 32×32): 2막 뒤쪽 적, 3막 디 리퍼 에이전트, 보스. 직접 그린 것입니다.
// 원작 그림을 따라 그리지 않고, 색과 큰 특징(뿔, 날개, 갑옷, 줄무늬 등)만 살렸습니다.
// 적은 파트너 쪽(왼쪽)이나 정면을 봅니다.
import { build, capsule, ellipse, poly, stamp } from '../build';
import type { PixelArt } from '../types';

// ── 공통 재질 ──
const PEGASUS = ['#ffffff', '#eef0f6', '#c4c8d8', '#8a90a8'] as const;
const PEGASUS_D = ['#c4c8d8', '#a3a8bc', '#737a94'] as const;
const SKY = ['#bfe2ff', '#7fb6ea', '#4a7cc0'] as const;
const SKY_D = ['#7fb6ea', '#5a8fcc', '#355f9c'] as const;
const NAVY = ['#7486c8', '#46549a', '#2a3268'] as const;
const GOLD = ['#fff3a8', '#f2c83c', '#b8901e'] as const;
const SKIN = ['#ffe8cc', '#f0d0a8', '#c49a74'] as const;
const SNAKE = ['#c6e67a', '#8ab846', '#5a7f2a', '#3b5719'] as const;
const SNAKE_D = ['#7aa83c', '#5a7f2a', '#3b5719'] as const;
const BELLY = ['#fff2b0', '#e9c860', '#b0902e'] as const;
const OX = ['#b08458', '#7c5636', '#523621', '#341f12'] as const;
const OX_D = ['#7c5636', '#5c3e26', '#3a2617'] as const;
const HORN = ['#ffffff', '#f2ead8', '#bfb193'] as const;
const STEEL = ['#ffffff', '#d6dde8', '#8d98ab'] as const;
const TIGER = ['#ffe08a', '#f0ae3e', '#c07e22', '#7e4c12'] as const;
const TIGER_D = ['#d8962e', '#a86c1c', '#6e420e'] as const;
const FIRE = ['#ffc08a', '#ec5a3e', '#b02e22', '#701a14'] as const;
const FIRE_D = ['#c8402e', '#962a1e', '#5e1812'] as const;
const FLAME = ['#fff0a0', '#f6a83c', '#c86420'] as const;
const REAP = ['#ff8a8a', '#e3343c', '#a01a22', '#5c0c12'] as const;
const REAP_D = ['#b8222a', '#86141c', '#520a10'] as const;
const CREAM = ['#fff6f2', '#f2d8d0', '#c6a098'] as const;

const EYE_RED = { R: '#ff4a3a', r: '#a01a12', H: '#ffffff' };
const CORE = { Y: '#ffe25a', y: '#d49a10', O: '#ff8a1a', H: '#ffffff', D: '#5c0c12', K: '#14121c' };

// ── 2막 ──

/** 유니몬: 하늘색 날개의 흰 천마, 이마의 금빛 뿔, 남색 투구 (왼쪽 보기) */
const unimon = build(
  32,
  [
    // 먼 날개, 먼 다리, 꼬리
    poly(
      [
        [17, 15],
        [19, 5],
        [23, 2],
        [27, 4],
        [25, 9],
        [22, 14],
      ],
      SKY_D,
    ),
    capsule(24, 17, 29, 23, 1.8, SKY, { r1: 1.2 }),
    capsule(12.5, 20, 11.5, 28.5, 1.5, PEGASUS_D),
    capsule(23, 20, 24.5, 28.5, 1.5, PEGASUS_D),
    // 몸, 가까운 다리
    ellipse(18, 18, 8.2, 4.8, PEGASUS),
    capsule(14.5, 20, 14, 28.5, 1.7, PEGASUS),
    capsule(21.5, 20, 21.5, 28.5, 1.7, PEGASUS),
    // 목, 머리, 주둥이
    capsule(12, 16, 8.5, 10, 2.8, PEGASUS),
    ellipse(7.5, 8.5, 4.3, 3.5, PEGASUS),
    ellipse(4.2, 10.5, 2.4, 1.9, PEGASUS, { line: false }),
    // 투구, 뿔
    poly(
      [
        [5, 6],
        [8, 4.5],
        [11.5, 6],
        [11, 9],
        [8, 8],
      ],
      NAVY,
    ),
    capsule(6.5, 5, 4.5, 1, 0.9, GOLD, { r1: 0.4 }),
    // 가까운 날개 (몸 앞)
    poly(
      [
        [13, 16],
        [14, 7],
        [17, 3],
        [22, 1.5],
        [21, 6],
        [24, 7],
        [20, 11],
        [21, 13],
        [16, 17],
      ],
      SKY,
    ),
  ],
  [
    stamp(6, 8, EYE_RED, ['Hr']),
    stamp(2, 10, { K: '#3a3550' }, ['K']),
    stamp(13, 28, { A: '#2a3268' }, ['AAA']),
    stamp(20, 28, { A: '#2a3268' }, ['AAA']),
    stamp(17, 4, { W: '#ffffff' }, ['W', '.W']),
  ],
);

/** 피드몬: 흰 날개 넷, 파란 갑옷의 천사, 금빛 장식 (정면) */
const piddomon = build(
  32,
  [
    // 뒤 날개 (아래쪽 한 쌍)
    poly(
      [
        [13, 15],
        [3, 19],
        [1, 24],
        [6, 22],
        [9, 24],
        [14, 19],
      ],
      SKY_D,
    ),
    poly(
      [
        [19, 15],
        [29, 19],
        [31, 24],
        [26, 22],
        [23, 24],
        [18, 19],
      ],
      SKY_D,
    ),
    // 위 날개
    poly(
      [
        [13, 12],
        [6, 4],
        [1, 2],
        [2, 8],
        [4, 13],
        [8, 16],
        [13, 16],
      ],
      PEGASUS,
    ),
    poly(
      [
        [19, 12],
        [26, 4],
        [31, 2],
        [30, 8],
        [28, 13],
        [24, 16],
        [19, 16],
      ],
      PEGASUS,
    ),
    // 다리, 몸
    capsule(14, 22, 13.5, 28.5, 1.6, NAVY),
    capsule(18, 22, 18.5, 28.5, 1.6, NAVY),
    ellipse(16, 18, 4.6, 5.2, NAVY),
    // 팔
    capsule(11.5, 15, 10, 21, 1.4, NAVY),
    capsule(20.5, 15, 22, 21, 1.4, NAVY),
    // 머리, 투구
    ellipse(16, 9.5, 3.8, 3.8, SKIN),
    poly(
      [
        [11.5, 9],
        [12, 5.5],
        [16, 3.5],
        [20, 5.5],
        [20.5, 9],
        [18, 8],
        [14, 8],
      ],
      NAVY,
    ),
  ],
  [
    stamp(14, 9, { E: '#2a3268' }, ['E.E']),
    stamp(5, 6, { F: PEGASUS[3] }, ['F', '.F', '..F']),
    stamp(25, 6, { F: PEGASUS[3] }, ['..F', '.F', 'F']),
    stamp(15, 3, { Y: GOLD[1], y: GOLD[2] }, ['YY', 'yy']),
    stamp(14, 17, { Y: GOLD[1], y: GOLD[2], W: '#fff3a8' }, ['.W.', 'YYy', '.y.']),
    stamp(13, 28, { Y: GOLD[1], y: GOLD[2] }, ['YYy', '...', '..']),
    stamp(18, 28, { Y: GOLD[1], y: GOLD[2] }, ['Yyy']),
    // 지팡이
    stamp(23, 13, { Y: GOLD[1], y: GOLD[2], W: '#ffffff' }, [
      '.W.',
      'YYY',
      '.Y.',
      '.y.',
      '.y.',
      '.y.',
      '.y.',
      '.y.',
      '.y.',
      '.y.',
      '.y.',
      '.y.',
    ]),
  ],
);

/** 산디라몬: 금빛 머리 장식을 한 초록 큰 뱀, 붉은 눈, 노란 배 비늘 (왼쪽 보기, 똬리) */
const sandiramon = build(
  32,
  [
    // 꼬리 끝, 아래 똬리
    capsule(27, 25, 30, 20, 1.8, SNAKE_D, { r1: 0.8 }),
    ellipse(17, 26, 12, 3.8, SNAKE),
    ellipse(18.5, 21, 9, 3.4, SNAKE),
    // 목 (배 쪽 노랑이 앞에 보임)
    capsule(16, 19, 9.5, 11, 3.3, SNAKE, { r1: 2.8 }),
    capsule(13.5, 19, 8, 12, 1.3, BELLY, { line: false }),
    // 머리, 턱
    ellipse(8.5, 8.5, 5.6, 3.6, SNAKE),
    ellipse(5, 10.5, 3.4, 1.8, SNAKE_D),
    // 금관
    poly(
      [
        [6, 5.5],
        [7, 2],
        [9, 4],
        [11, 1.5],
        [12.5, 4.5],
        [14, 3],
        [13.5, 6.5],
        [7, 6.5],
      ],
      GOLD,
    ),
  ],
  [
    stamp(6, 7, EYE_RED, ['HR', '.r']),
    stamp(2, 10, { M: '#2a3a14', W: '#ffffff' }, ['MMMM', '.W.W']),
    // 등 무늬
    stamp(11, 22, { D: SNAKE[3] }, ['D...D...D...D']),
    stamp(8, 27, { D: SNAKE[3] }, ['D....D....D....D']),
    stamp(13, 13, { D: SNAKE[3] }, ['D', '..', '.D']),
    stamp(10, 28, { Y: BELLY[1] }, ['YYYYYYYYYY']),
    stamp(11, 4, { R: '#e04a4a' }, ['R']),
  ],
);

/** 바즈라몬: 흰 큰 뿔의 갈색 황소 무사, 남색 갑옷, 금빛 띠, 양손 칼 (정면) */
const vajramon = build(
  32,
  [
    // 칼 (뒤)
    capsule(5, 28, 3, 14, 0.9, STEEL),
    capsule(27, 28, 29, 14, 0.9, STEEL),
    // 다리
    capsule(13, 22, 12, 29, 2.3, OX_D),
    capsule(19, 22, 20, 29, 2.3, OX_D),
    // 팔
    capsule(10, 15, 5.5, 22, 2.2, OX),
    capsule(22, 15, 26.5, 22, 2.2, OX),
    // 몸, 갑옷, 띠
    ellipse(16, 17.5, 6.8, 6.2, OX),
    poly(
      [
        [10, 13],
        [22, 13],
        [21.5, 20],
        [10.5, 20],
      ],
      NAVY,
    ),
    poly(
      [
        [10.5, 20],
        [21.5, 20],
        [21, 22.5],
        [11, 22.5],
      ],
      GOLD,
    ),
    // 뿔
    poly(
      [
        [11, 7],
        [6, 6],
        [3, 2],
        [1.5, 4],
        [4, 8.5],
        [10, 10],
      ],
      HORN,
    ),
    poly(
      [
        [21, 7],
        [26, 6],
        [29, 2],
        [30.5, 4],
        [28, 8.5],
        [22, 10],
      ],
      HORN,
    ),
    // 머리, 주둥이
    ellipse(16, 8.5, 5.2, 4.6, OX),
    ellipse(16, 11.5, 3.2, 2, HORN, { line: false }),
  ],
  [
    stamp(13, 7, { E: '#ffd23a', K: '#14121c' }, ['EK..KE']),
    stamp(15, 11, { K: '#523621' }, ['K.K']),
    stamp(15, 15, { Y: GOLD[1], y: GOLD[2] }, ['YY', 'yy']),
    stamp(4, 21, { G: GOLD[1], g: GOLD[2] }, ['Gg']),
    stamp(26, 21, { G: GOLD[1], g: GOLD[2] }, ['gG']),
    stamp(11, 28, { K: '#341f12' }, ['KKK']),
    stamp(19, 28, { K: '#341f12' }, ['KKK']),
  ],
);

// ── 3막: 디 리퍼 에이전트 (빨간 유기체와 크림색 껍질, 노란 핵) ──

/** 서처: 크림색 고리 눈을 단 둥근 빨간 덩어리, 아래로 늘어진 촉수 (떠 있음) */
const reaper_searcher = build(
  32,
  [
    capsule(10, 21, 7, 28, 1.5, REAP_D, { r1: 0.7 }),
    capsule(16, 22, 16, 29, 1.6, REAP_D, { r1: 0.7 }),
    capsule(22, 21, 25, 28, 1.5, REAP_D, { r1: 0.7 }),
    ellipse(16, 14, 10, 9, REAP),
    ellipse(16, 14, 6, 5.5, CREAM),
    ellipse(16, 14, 3.4, 3.2, REAP_D, { flat: true }),
  ],
  [
    stamp(14, 12, CORE, ['.YY.', 'YHYy', 'YYyy', '.yy.']),
    stamp(8, 7, { H: '#ffc0c0' }, ['HH', 'H']),
    stamp(5, 14, { D: REAP[3] }, ['D', 'D']),
    stamp(26, 14, { D: REAP[3] }, ['D', 'D']),
  ],
);

/** 크리퍼: 위에 노란 눈을 단 빨간 거미 같은 덩어리, 여러 다리 */
const reaper_creeper = build(
  32,
  [
    // 다리 (먼 쪽)
    capsule(12, 20, 5, 24, 1.4, REAP_D),
    capsule(5, 24, 3, 29, 1.2, REAP_D, { r1: 0.6 }),
    capsule(20, 20, 27, 24, 1.4, REAP_D),
    capsule(27, 24, 29, 29, 1.2, REAP_D, { r1: 0.6 }),
    // 몸
    ellipse(16, 20, 9.5, 5.5, REAP),
    // 다리 (가까운 쪽)
    capsule(11, 23, 8, 29, 1.6, REAP, { r1: 0.8 }),
    capsule(21, 23, 24, 29, 1.6, REAP, { r1: 0.8 }),
    capsule(15, 24, 14, 29.5, 1.5, REAP, { r1: 0.8 }),
    // 눈자루, 눈
    capsule(16, 16, 16, 10, 2, REAP),
    ellipse(16, 7.5, 4.4, 3.8, CREAM),
  ],
  [
    stamp(14, 6, CORE, ['.YY.', 'YDDy', '.yy.']),
    stamp(10, 19, { D: REAP[3] }, ['D..D..D..D..D']),
    stamp(11, 17, { H: '#ffc0c0' }, ['HHH']),
  ],
);

/** 패러노이아: 크림색 사람 꼴 인형, 빨간 관절과 가슴, 텅 빈 눈 (정면) */
const reaper_paranoia = build(
  32,
  [
    capsule(13.5, 21, 12, 29, 1.6, CREAM),
    capsule(18.5, 21, 20, 29, 1.6, CREAM),
    capsule(11, 13, 7, 21, 1.4, CREAM),
    capsule(21, 13, 25, 21, 1.4, CREAM),
    ellipse(16, 16, 5, 6.5, REAP),
    ellipse(16, 7.5, 4.4, 4.8, CREAM),
  ],
  [
    stamp(13, 6, { K: '#14121c', Y: '#ffd33b' }, ['KK.KK', 'KY.YK']),
    stamp(14, 10, { K: '#5c0c12' }, ['KKK']),
    stamp(14, 14, { C: CREAM[1], c: CREAM[2] }, ['C.C', '.c.', 'C.C']),
    // 관절의 빨간 점
    stamp(9, 17, { R: REAP[1] }, ['R']),
    stamp(22, 17, { R: REAP[1] }, ['R']),
    stamp(12, 25, { R: REAP[1] }, ['R']),
    stamp(19, 25, { R: REAP[1] }, ['R']),
    stamp(6, 21, { R: REAP[2] }, ['RR']),
    stamp(25, 21, { R: REAP[2] }, ['RR']),
    stamp(11, 29, { R: REAP[2] }, ['RRR']),
    stamp(19, 29, { R: REAP[2] }, ['RRR']),
  ],
);

/** 혼 스트라이커: 크림색 큰 뿔 둘을 단 육중한 빨간 몸, 짧은 다리 */
const reaper_horn_striker = build(
  32,
  [
    capsule(11, 23, 10, 29, 2.4, REAP_D),
    capsule(21, 23, 22, 29, 2.4, REAP_D),
    ellipse(16, 18, 11, 7.5, REAP),
    ellipse(16, 11, 6, 4.5, REAP),
    poly(
      [
        [12, 10],
        [7, 5],
        [2, 1],
        [4, 7],
        [9, 13],
      ],
      CREAM,
    ),
    poly(
      [
        [20, 10],
        [25, 5],
        [30, 1],
        [28, 7],
        [23, 13],
      ],
      CREAM,
    ),
    capsule(5, 20, 3.5, 25, 2, REAP, { r1: 1.3 }),
    capsule(27, 20, 28.5, 25, 2, REAP, { r1: 1.3 }),
  ],
  [
    stamp(12, 10, CORE, ['Y......Y', 'y......y']),
    stamp(12, 18, { D: REAP[3] }, ['DDDDDDDD', '.DDDDDD.']),
    stamp(9, 14, { H: '#ffc0c0' }, ['HHH', 'H']),
    stamp(9, 29, { C: CREAM[1] }, ['CCC']),
    stamp(21, 29, { C: CREAM[1] }, ['CCC']),
  ],
);

/** 옵티마이저: 크림색 마름모 속 노란 핵, 빨간 껍질, 곁에 뜬 작은 덩어리 (떠 있음) */
const reaper_optimizer = build(
  32,
  [
    ellipse(5, 25, 2.4, 2.4, REAP_D),
    ellipse(27, 25, 2.4, 2.4, REAP_D),
    poly(
      [
        [16, 1.5],
        [27.5, 14],
        [16, 27.5],
        [4.5, 14],
      ],
      REAP,
    ),
    poly(
      [
        [16, 6],
        [23, 14],
        [16, 22],
        [9, 14],
      ],
      CREAM,
    ),
    poly(
      [
        [16, 10],
        [19.5, 14],
        [16, 18],
        [12.5, 14],
      ],
      REAP_D,
      { flat: true },
    ),
  ],
  [
    stamp(15, 12, CORE, ['YY', 'HY', 'yy', 'yy']),
    stamp(15, 28, { R: REAP[2] }, ['RR']),
    stamp(16, 30, { R: REAP[2] }, ['R']),
  ],
);

// ── 보스 ──

/** 미히라몬: 금빛 갑옷의 거대한 호랑이 (왼쪽 보기, 칸을 가득) */
const mihiramon = build(
  32,
  [
    // 꼬리, 먼 다리
    capsule(27, 15, 30, 7, 1.8, TIGER, { r1: 1.3 }),
    ellipse(30, 5.5, 1.4, 1.8, GOLD),
    capsule(10, 21, 8.5, 29, 2.4, TIGER_D),
    capsule(25, 21, 26, 29, 2.4, TIGER_D),
    // 몸
    ellipse(18, 17, 11.5, 7, TIGER),
    // 가까운 다리
    capsule(13, 21, 12.5, 29.5, 2.8, TIGER),
    capsule(22, 21, 22, 29.5, 2.8, TIGER),
    // 등 갑옷 (어깨에서 등까지)
    poly(
      [
        [12, 11],
        [17, 9.5],
        [26, 10.5],
        [27, 13.5],
        [20, 15],
        [14, 16.5],
        [11.5, 15],
      ],
      GOLD,
    ),
    // 머리, 귀, 주둥이
    poly(
      [
        [4, 5],
        [3, 0.8],
        [7, 3],
      ],
      TIGER,
    ),
    poly(
      [
        [11, 4],
        [12.5, 0.8],
        [13.5, 5],
      ],
      TIGER,
    ),
    ellipse(8.5, 10, 6.8, 6.2, TIGER),
    ellipse(5, 13.5, 3.8, 2.4, HORN, { line: false }),
    // 금 투구
    poly(
      [
        [3.5, 7],
        [6, 3.5],
        [11, 3],
        [14.5, 6],
        [13, 7.5],
        [8, 6],
        [4.5, 8.5],
      ],
      GOLD,
    ),
  ],
  [
    stamp(4, 8, { E: '#ff3a2a', K: '#14121c', H: '#ffe25a' }, ['KK...KK', 'HE...HE']),
    stamp(3, 11, { N: '#3a2a1e' }, ['NN']),
    stamp(2, 14, { M: '#3a1414', W: '#ffffff', R: '#c43c3c' }, ['MMMMMM', 'WRRRW.', 'W...W.']),
    // 줄무늬
    stamp(10, 9, { D: TIGER[3] }, ['.D', 'D.', '.D']),
    stamp(16, 16, { D: TIGER[3] }, ['D..D..D..D', 'D..D..D..D', '.D..D..D..D', '.D..D..D']),
    stamp(12, 25, { D: TIGER[3] }, ['DD', '..', 'DD']),
    stamp(21, 25, { D: TIGER[3] }, ['DD', '..', 'DD']),
    stamp(18, 11, { R: '#c43c3c', r: '#7a1e1e' }, ['R.....R', 'r.....r']),
    stamp(11, 29, { C: HORN[1] }, ['CCCC']),
    stamp(20, 29, { C: HORN[1] }, ['CCCC']),
  ],
);

/** 주작몬: 불꽃 날개를 펼친 붉은 큰 새, 금빛 가슴, 불꽃 꼬리 (정면, 떠 있음) */
const zhuqiaomon = build(
  32,
  [
    // 꼬리 깃
    capsule(14, 22, 10, 30, 1.5, FLAME, { r1: 0.7 }),
    capsule(16, 23, 16, 30.5, 1.6, FLAME, { r1: 0.7 }),
    capsule(18, 22, 22, 30, 1.5, FLAME, { r1: 0.7 }),
    // 날개 바깥 (주황 끝)
    poly(
      [
        [13, 11],
        [6, 4],
        [1, 1],
        [2, 9],
        [1.5, 17],
        [6, 16],
        [4, 22],
        [10, 19],
        [13, 20],
      ],
      FLAME,
    ),
    poly(
      [
        [19, 11],
        [26, 4],
        [31, 1],
        [30, 9],
        [30.5, 17],
        [26, 16],
        [28, 22],
        [22, 19],
        [19, 20],
      ],
      FLAME,
    ),
    // 날개 안쪽 (붉은)
    poly(
      [
        [13, 12],
        [7, 7],
        [4, 6],
        [5, 12],
        [4.5, 16],
        [9, 15],
        [8, 19],
        [13, 18],
      ],
      FIRE_D,
    ),
    poly(
      [
        [19, 12],
        [25, 7],
        [28, 6],
        [27, 12],
        [27.5, 16],
        [23, 15],
        [24, 19],
        [19, 18],
      ],
      FIRE_D,
    ),
    // 몸, 머리
    ellipse(16, 15.5, 4.8, 7.2, FIRE),
    ellipse(16, 15.5, 2.6, 4.2, GOLD, { line: false }),
    ellipse(16, 6.5, 3.6, 3.4, FIRE),
    // 볏
    poly(
      [
        [14.5, 4],
        [13, 0.8],
        [16, 3],
        [18, 0.6],
        [17.5, 4],
      ],
      FLAME,
    ),
  ],
  [
    stamp(14, 6, { E: '#ffe25a', K: '#14121c' }, ['E..E', 'K..K']),
    stamp(15, 8, { B: '#f2c83c', b: '#b8901e' }, ['BB', 'b.']),
    stamp(15, 14, { H: '#fff3a8' }, ['HH', 'H']),
    // 날개 깃 줄
    stamp(4, 10, { L: '#fff0a0' }, ['L', '.L', '..L']),
    stamp(27, 10, { L: '#fff0a0' }, ['..L', '.L', 'L']),
  ],
);

/** 디 리퍼: 칸을 가득 메운 빨간 덩어리, 가운데 크림색 껍질 속 노란 핵, 사방으로 뻗은 촉수 */
const d_reaper = build(
  32,
  [
    // 촉수 (뒤)
    capsule(8, 9, 2, 2, 2.2, REAP_D, { r1: 1 }),
    capsule(24, 9, 30, 2, 2.2, REAP_D, { r1: 1 }),
    capsule(7, 22, 1.5, 29, 2.4, REAP_D, { r1: 1 }),
    capsule(25, 22, 30.5, 29, 2.4, REAP_D, { r1: 1 }),
    capsule(16, 8, 16, 1.5, 2.2, REAP_D, { r1: 1.2 }),
    // 몸 (울퉁불퉁)
    ellipse(16, 16.5, 12.5, 11, REAP),
    ellipse(6, 12, 4.5, 4.5, REAP),
    ellipse(26.5, 13, 4, 4.5, REAP),
    ellipse(9, 24, 4.5, 3.5, REAP),
    ellipse(23.5, 23.5, 4.5, 3.8, REAP),
    capsule(10, 25, 9, 30, 2.6, REAP, { r1: 1.6 }),
    capsule(22, 25, 23, 30, 2.6, REAP, { r1: 1.6 }),
    // 껍질과 핵
    ellipse(16, 16, 7, 6.5, CREAM),
    ellipse(16, 16, 4.4, 4, REAP_D, { flat: true }),
  ],
  [
    stamp(14, 14, CORE, ['.YY.', 'YOHY', 'YOOy', '.yy.']),
    stamp(6, 9, { H: '#ffc0c0' }, ['HHH', 'HH', 'H']),
    stamp(4, 17, { D: REAP[3] }, ['D', 'D', '.D']),
    stamp(27, 17, { D: REAP[3] }, ['.D', '.D', 'D']),
    stamp(13, 24, { D: REAP[3] }, ['DDDDDD']),
    // 작은 눈들
    stamp(4, 11, { C: CREAM[1], Y: '#ffe25a' }, ['CC', 'CY']),
    stamp(26, 12, { C: CREAM[1], Y: '#ffe25a' }, ['CC', 'YC']),
    stamp(22, 23, { C: CREAM[1], Y: '#ffe25a' }, ['CY']),
    stamp(8, 23, { C: CREAM[1], Y: '#ffe25a' }, ['YC']),
  ],
);

export const ENEMY_B_ART: Record<string, PixelArt> = {
  unimon,
  piddomon,
  sandiramon,
  vajramon,
  mihiramon,
  zhuqiaomon,
  reaper_searcher,
  reaper_creeper,
  reaper_paranoia,
  reaper_horn_striker,
  reaper_optimizer,
  d_reaper,
};
