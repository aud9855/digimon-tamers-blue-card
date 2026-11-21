// 모노드라몬 계열 2판 도트 (04 7절 2판, 32×32). 직접 그린 것입니다.
// 원작 그림이 없어서(2026-11-21 결정) 원작을 따라 그리지 않고, 색과 큰 특징
// (보라 아기 용의 날개, 금속 발톱, 짙은 갑옷과 큰 날개, 붉은 목도리와 큰 팔)만 살렸습니다.
import { build, capsule, ellipse, poly, stamp } from '../build';
import type { PixelArt } from '../types';

const PURPLE = ['#c7a6ff', '#8a5fd6', '#56369a', '#2f1c5e'] as const;
const PURPLE_D = ['#8a5fd6', '#68449f', '#3d2670'] as const;
const BELLY = ['#fff2c2', '#f0d27a', '#b8923e'] as const;
const WING = ['#e0b0ff', '#b06ad8', '#6e3a96'] as const;
const NAVY = ['#7f92c8', '#45598f', '#29355c', '#151c33'] as const;
const NAVY_D = ['#45598f', '#334470', '#1c2442'] as const;
const STEEL = ['#f1f4f8', '#b9c0cc', '#727a8a'] as const;
const DARK = ['#6c8a6a', '#3d5640', '#22322a', '#111a15'] as const;
const DARK_D = ['#3d5640', '#2c4030', '#18241b'] as const;
const DWING = ['#5a6e86', '#34425a', '#1c2434'] as const;
const SUIT = ['#9aa2b4', '#4a5064', '#2a2e3c', '#16181f'] as const;
const SUIT_D = ['#4a5064', '#363a4a', '#1e2029'] as const;
const SILVER = ['#ffffff', '#d8dce6', '#9aa2b4', '#5e6474'] as const;
const RED = ['#ff8a7a', '#d8323a', '#8a1c22'] as const;
const EYE = { E: '#14121c', H: '#ffffff', Y: '#ffd84a', R: '#ff3a3a', G: '#7dffb0' };

export const RYO_ART: Record<string, PixelArt> = {
  monodramon: build(
    32,
    [
      // 꼬리
      capsule(10, 25, 4, 27.5, 1.8, PURPLE_D, { r1: 0.9 }),
      // 먼 날개 (팔에 붙은 막)
      poly(
        [
          [10, 17],
          [3.5, 13],
          [5, 20.5],
        ],
        WING,
      ),
      // 다리
      capsule(13, 24, 12.5, 29.5, 2.3, PURPLE_D),
      capsule(18, 24, 19, 29.5, 2.4, PURPLE),
      // 몸, 노란 배
      ellipse(15.5, 21.5, 5.4, 5, PURPLE),
      ellipse(16.5, 22.5, 3, 3.4, BELLY, { line: false }),
      // 머리, 주둥이
      ellipse(15.5, 12.5, 6.5, 5.6, PURPLE),
      ellipse(20.5, 14, 3.6, 2.6, PURPLE, { line: false }),
      // 코 위 작은 뿔
      poly(
        [
          [19.5, 11],
          [21, 7.5],
          [22, 11.5],
        ],
        BELLY,
      ),
      // 머리 뒤 뿔 하나
      poly(
        [
          [11, 9],
          [7.5, 4],
          [13.5, 7.5],
        ],
        PURPLE,
      ),
      // 가까운 날개
      poly(
        [
          [20, 17.5],
          [28, 12.5],
          [26.5, 21],
        ],
        WING,
      ),
      capsule(20, 18, 23, 20.5, 1.4, PURPLE),
    ],
    [
      // 크고 노란 눈
      stamp(15, 11, EYE, ['YY', 'EY']),
      stamp(23, 14, { E: '#14121c' }, ['E']),
      stamp(18, 16, { M: '#2f1c5e', T: '#ffffff' }, ['MTMTM']),
      // 발톱
      stamp(11, 29, { T: '#ffffff' }, ['T.T']),
      stamp(18, 29, { T: '#ffffff' }, ['T.T.T']),
    ],
  ),

  strikedramon: build(
    32,
    [
      // 꼬리
      capsule(12, 22, 4, 28, 2, NAVY_D, { r1: 1 }),
      // 먼 팔 (금속 발톱)
      capsule(11, 12, 7, 18, 1.9, NAVY_D),
      poly(
        [
          [7.5, 17],
          [3, 21.5],
          [6, 22],
          [5, 24],
          [9, 19.5],
        ],
        STEEL,
      ),
      // 다리
      capsule(13, 20, 11, 29.5, 2.5, NAVY_D),
      capsule(18, 20, 20, 29.5, 2.6, NAVY),
      // 몸통
      ellipse(15.5, 15.5, 5, 6, NAVY),
      ellipse(16, 17, 2.8, 3.6, BELLY, { line: false }),
      // 머리 (가면 같은 투구)
      ellipse(16, 7, 4.4, 3.8, NAVY),
      ellipse(20, 8.5, 2.6, 1.8, NAVY, { line: false }),
      poly(
        [
          [13, 5],
          [9, 0.5],
          [15, 3.5],
        ],
        STEEL,
      ),
      // 가까운 팔 (금속 발톱)
      capsule(20, 12, 24, 16, 2, NAVY),
      poly(
        [
          [23, 14.5],
          [29.5, 13],
          [27, 16],
          [30, 17.5],
          [24.5, 18.5],
        ],
        STEEL,
      ),
    ],
    [
      stamp(16, 6, EYE, ['RR.', '.R.']),
      stamp(19, 10, { E: '#14121c', T: '#ffffff' }, ['TETE']),
      // 가슴 띠
      stamp(12, 12, { B: '#151c33' }, ['B......B']),
      stamp(10, 29, { T: '#ffffff' }, ['T.T']),
      stamp(19, 29, { T: '#ffffff' }, ['T.T.T']),
    ],
  ),

  cyberdramon: build(
    32,
    [
      // 큰 날개 둘 (뒤)
      poly(
        [
          [13, 9],
          [1, 1],
          [2, 9],
          [0.5, 15],
          [10, 15],
        ],
        DWING,
      ),
      poly(
        [
          [18, 9],
          [31, 0.5],
          [30, 8],
          [31.5, 14],
          [21, 14],
        ],
        DWING,
      ),
      // 꼬리
      capsule(13, 22, 5, 29, 2, DARK_D, { r1: 1 }),
      // 먼 팔
      capsule(11, 12, 8, 19, 2.2, DARK_D),
      poly(
        [
          [8, 18],
          [4.5, 23],
          [7.5, 22],
          [7.5, 25],
          [10, 20],
        ],
        STEEL,
      ),
      // 다리
      capsule(13, 21, 11, 29.5, 2.8, DARK_D),
      capsule(18, 21, 20.5, 29.5, 2.9, DARK),
      // 몸통 (갑옷)
      poly(
        [
          [10, 9.5],
          [21, 9.5],
          [19.5, 22],
          [11.5, 22],
        ],
        DARK,
      ),
      poly(
        [
          [13, 11],
          [18, 11],
          [17, 17],
          [14, 17],
        ],
        ['#a8c4a4', '#6c8a6a', '#3d5640'],
      ),
      // 머리 (묶인 투구)
      ellipse(15.5, 6, 4, 3.8, DARK),
      ellipse(19, 7.2, 2.4, 1.7, DARK, { line: false }),
      // 가까운 팔
      capsule(20, 11.5, 24, 17.5, 2.3, DARK),
      poly(
        [
          [23, 16],
          [29, 19],
          [26, 19.5],
          [27.5, 22.5],
          [22.5, 19.5],
        ],
        STEEL,
      ),
    ],
    [
      // 눈가리개 띠와 초록 눈
      stamp(12, 5, { B: '#8a5a32', G: EYE.G }, ['BBBBGBGB']),
      stamp(18, 8, { E: '#14121c', T: '#ffffff' }, ['TETE']),
      // 몸을 묶은 띠
      stamp(11, 19, { B: '#8a5a32', b: '#5e3a1e' }, ['bBBBBBBBb']),
      stamp(10, 29, { T: '#ffffff' }, ['T.T']),
      stamp(19, 29, { T: '#ffffff' }, ['T.T.T']),
    ],
  ),

  justimon: build(
    32,
    [
      // 붉은 목도리 (뒤로 날림)
      poly(
        [
          [13, 8.5],
          [3, 6],
          [5, 9],
          [1, 11.5],
          [12, 11],
        ],
        RED,
      ),
      // 먼 다리
      capsule(14, 19, 11.5, 29.5, 2.3, SUIT_D),
      // 먼 팔
      capsule(12, 10, 9, 17.5, 1.8, SUIT_D),
      // 가까운 다리
      capsule(17.5, 19, 19.5, 29.5, 2.4, SUIT),
      // 몸통
      poly(
        [
          [11.5, 9],
          [20.5, 9],
          [19, 20],
          [13, 20],
        ],
        SUIT,
      ),
      poly(
        [
          [13.5, 9.5],
          [18.5, 9.5],
          [16, 14.5],
        ],
        SILVER,
      ),
      // 머리 (은색 투구)
      ellipse(16, 5.2, 3.4, 3.6, SILVER),
      poly(
        [
          [14, 2.5],
          [16, -0.5],
          [18, 2.5],
        ],
        SILVER,
      ),
      // 목도리 앞
      poly(
        [
          [12.5, 8],
          [19.5, 8],
          [19, 10],
          [13, 10],
        ],
        RED,
      ),
      // 가까운 팔: 크고 단단한 팔 갑옷
      capsule(20, 10.5, 23, 14.5, 2.2, SUIT),
      ellipse(24.5, 16.5, 3.4, 3.6, SILVER),
      ellipse(25.5, 20.5, 2.4, 2, SILVER),
    ],
    [
      // 붉은 눈가리개
      stamp(14, 5, { R: EYE.R, r: '#8a1c22' }, ['rRRRr']),
      // 허리띠
      stamp(13, 18, { Y: '#ffd84a', y: '#b8861c', B: '#16181f' }, ['BBYYBB']),
      // 팔 갑옷 무늬
      stamp(23, 16, { R: RED[1] }, ['RRR']),
      // 부츠
      stamp(9, 29, { B: '#16181f', b: '#4a5064' }, ['bBBB']),
      stamp(18, 29, { B: '#16181f', b: '#9aa2b4' }, ['bBBBB']),
    ],
  ),
};
