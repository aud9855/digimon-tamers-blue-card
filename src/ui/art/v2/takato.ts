// 길몬 계열 2판 도트 (04 7절 2판, 32×32). 직접 그린 것입니다.
// 원작 그림을 따라 그리지 않고, 색과 큰 특징(귀날개, 무늬, 꼬리, 갑옷 등)만 살렸습니다.
import { build, capsule, ellipse, poly, stamp } from '../build';
import type { PixelArt } from '../types';

const RED = ['#ffa178', '#f0613f', '#c93a2a', '#7f2219'] as const;
const RED_D = ['#c93a2a', '#9c2c22', '#64191a'] as const;
const WHITE = ['#fff6e8', '#ead6bd', '#b99f86'] as const;
const CLAW = ['#ffffff', '#e4ded2', '#9c958a'] as const;
const EYE = { Y: '#ffd84a', y: '#d19a16', E: '#120d12', H: '#ffffff' };
const MARK = { B: '#2a1820' };
const SILVER = ['#ffffff', '#d6dae2', '#9aa1ae', '#5d6370'] as const;
const METAL = ['#c9ced8', '#8e95a3', '#5a6070'] as const;
const GUN = ['#5a6070', '#2e323c', '#15171d'] as const;
const ARMOR = ['#ffffff', '#ecedf2', '#c3c7d2', '#808696'] as const;
const GOLD = ['#fff0a0', '#e8b730', '#a8781a'] as const;
const CAPE = ['#c93a2a', '#8e2420', '#561414'] as const;
const LANCE = ['#ffffff', '#e8e2c8', '#b8a868', '#7a6a38'] as const;
const SHIELD = ['#ffffff', '#ecedf2', '#bfc4cf', '#7d8394'] as const;
const DRAGON = ['#d24848', '#9a2430', '#62121f', '#33091a'] as const;
const DRAGON_D = ['#7a1a26', '#4e0f1a', '#2a0710'] as const;
const BONE = ['#f2ead8', '#c8b896', '#857559'] as const;

export const TAKATO_ART: Record<string, PixelArt> = {
  guilmon: build(
    32,
    [
      // 뒤: 꼬리, 먼 다리, 먼 팔, 귀날개
      capsule(12, 24, 5.5, 26, 3.4, RED, { r1: 2.2 }),
      capsule(5.5, 26, 3.5, 22, 2.2, RED, { r1: 1.5 }),
      capsule(11.5, 25, 10.5, 29.5, 2.8, RED_D),
      capsule(10, 18, 7, 21, 1.7, RED_D),
      poly(
        [
          [9, 7],
          [3, 3],
          [4, 8],
          [3, 11],
          [9, 11],
        ],
        RED_D,
      ),
      // 몸
      ellipse(14.5, 21.5, 6.6, 7, RED),
      ellipse(16.5, 22.5, 4.2, 5.2, WHITE),
      capsule(17, 25.5, 18, 29.5, 3.1, RED),
      // 머리
      ellipse(14, 10.5, 8, 7.2, RED),
      ellipse(21.5, 12.5, 7.2, 4.2, RED, { line: false }),
      // 가까운 팔
      capsule(18, 18, 22.5, 21, 2, RED),
    ],
    [
      // 눈 (세로 동공)
      stamp(16, 8, EYE, ['.YYY.', 'YHYEy', 'YYYEy', '.yyy.']),
      // 이마·뺨·팔·꼬리 무늬
      stamp(12, 4, MARK, ['.B.', 'BBB', 'B.B']),
      stamp(9, 12, MARK, ['B.', 'BB']),
      stamp(20, 19, MARK, ['B', '.B']),
      stamp(6, 23, MARK, ['B', '.B']),
      // 입
      stamp(19, 14, { M: '#4a1013', T: '#fff6e8' }, ['MMMMMMMMM', '.TT..TT..']),
      // 배의 무늬
      stamp(16, 22, MARK, ['.B.', 'B.B']),
      // 발톱
      stamp(8, 29, { C: CLAW[1], c: CLAW[2] }, ['CcCc']),
      stamp(16, 30, { C: CLAW[1], c: CLAW[2] }, ['CcCcC']),
      stamp(23, 20, { C: CLAW[1], c: CLAW[2] }, ['C', 'cC']),
    ],
  ),

  growlmon: build(
    32,
    [
      // 뒤: 꼬리, 먼 다리, 먼 팔, 흰 갈기
      capsule(12, 24, 3, 27, 3.6, RED, { r1: 1.6 }),
      capsule(12, 24, 11, 29.5, 3, RED_D),
      poly(
        [
          [9, 18],
          [2.5, 16],
          [8, 21],
        ],
        SILVER,
      ),
      capsule(11, 16, 8, 21, 1.8, RED_D),
      poly(
        [
          [12, 3],
          [4, 4],
          [7, 7],
          [2, 10],
          [7, 12],
          [4, 16],
          [12, 15],
        ],
        WHITE,
      ),
      // 몸
      ellipse(15, 19.5, 7, 8.5, RED),
      ellipse(17.5, 21, 4, 6, WHITE),
      capsule(18, 24, 19, 29.5, 3.4, RED),
      // 머리
      ellipse(16, 8, 6.5, 5.5, RED),
      ellipse(23, 10, 6.5, 3.6, RED, { line: false }),
      // 가까운 팔과 팔꿈치 칼날
      capsule(19, 15, 24, 19, 2.2, RED),
      poly(
        [
          [20, 18],
          [17.5, 23.5],
          [22.5, 19],
        ],
        SILVER,
      ),
    ],
    [
      stamp(18, 6, EYE, ['YYYE', 'HYEy', '.yy.']),
      stamp(13, 3, MARK, ['B.B', '.B.']),
      stamp(11, 9, MARK, ['B', 'BB']),
      stamp(21, 17, MARK, ['B', '.B']),
      stamp(5, 25, MARK, ['B', '.B']),
      stamp(21, 12, { M: '#4a1013', T: '#fff6e8' }, ['MMMMMMMMM', '.T.T.T.T.']),
      stamp(17, 20, MARK, ['.B.', 'B.B']),
      stamp(9, 29, { C: CLAW[1], c: CLAW[2] }, ['CcCc']),
      stamp(17, 30, { C: CLAW[1], c: CLAW[2] }, ['CcCcC']),
      stamp(25, 18, { C: CLAW[1], c: CLAW[2] }, ['C', 'cC']),
    ],
  ),

  wargrowlmon: build(
    32,
    [
      // 뒤: 꼬리, 먼 다리, 갈기, 먼 팔
      capsule(11, 25, 2.5, 28.5, 4, RED, { r1: 1.8 }),
      capsule(11, 24, 10, 29.5, 3.4, RED_D),
      poly(
        [
          [11, 2.5],
          [3, 4],
          [6, 7],
          [2, 10],
          [6, 12],
          [3, 16],
          [11, 14],
        ],
        WHITE,
      ),
      capsule(10, 15, 6, 20, 2, RED_D),
      poly(
        [
          [9, 16],
          [3, 12],
          [7, 18],
        ],
        METAL,
      ),
      // 몸과 가슴 갑옷, 포 둘
      ellipse(15, 18.5, 8, 9.5, RED),
      poly(
        [
          [11, 13],
          [21, 13],
          [21.5, 19],
          [16, 21],
          [11, 19],
        ],
        METAL,
      ),
      capsule(15, 15, 22.5, 15, 1.6, GUN),
      capsule(15, 18.5, 22.5, 18.5, 1.6, GUN),
      capsule(18, 24, 19.5, 29.5, 3.8, RED),
      // 머리와 투구
      ellipse(17, 7.5, 6, 5, RED),
      ellipse(24, 9.5, 6, 3.4, RED, { line: false }),
      poly(
        [
          [11, 6],
          [13, 2.5],
          [20, 2.5],
          [25, 6],
          [21, 7.5],
          [12, 8],
        ],
        METAL,
      ),
      // 가까운 팔과 큰 칼날
      capsule(21, 13, 26, 18, 2.6, RED),
      poly(
        [
          [22, 15],
          [16, 8],
          [26, 13],
        ],
        SILVER,
      ),
    ],
    [
      stamp(19, 7, EYE, ['YYYE', 'HYEy']),
      stamp(22, 14, { G: '#120d12', O: '#ffb347' }, ['O', '.', '.', '.', 'O']),
      stamp(22, 11, { M: '#4a1013', T: '#fff6e8' }, ['MMMMMMMM', '.T.T.T.T']),
      stamp(8, 29, { C: CLAW[1], c: CLAW[2] }, ['CcCc']),
      stamp(17, 30, { C: CLAW[1], c: CLAW[2] }, ['CcCcCc']),
      stamp(27, 17, { C: CLAW[1], c: CLAW[2] }, ['C', 'cC']),
    ],
  ),

  gallantmon: build(
    32,
    [
      // 뒤: 망토, 창
      poly(
        [
          [10, 9],
          [21, 9],
          [25, 29],
          [5, 29],
        ],
        CAPE,
      ),
      capsule(23, 25, 29, 2, 1.4, LANCE, { r1: 0.6 }),
      // 다리
      capsule(13, 21, 12, 29.5, 2.5, ARMOR),
      capsule(18, 21, 19, 29.5, 2.5, ARMOR),
      // 몸통과 어깨
      ellipse(15.5, 16, 5.2, 6.5, ARMOR),
      ellipse(20, 11.5, 2.4, 2, GOLD),
      // 머리 (투구)
      ellipse(16, 7, 4.2, 4.6, ARMOR),
      poly(
        [
          [13, 4],
          [16, 0.5],
          [19, 4],
        ],
        GOLD,
      ),
      // 창 든 팔
      capsule(20, 13, 23, 18, 1.8, ARMOR),
      ellipse(23.5, 19, 1.8, 1.8, GOLD),
      // 둥근 방패
      ellipse(9.5, 18, 5, 6, SHIELD),
    ],
    [
      stamp(16, 6, { V: '#2a1820', Y: '#ffd84a' }, ['VVVV', 'VYYV']),
      stamp(14, 14, { R: '#c93a2a', r: '#7f2219' }, ['RRRR', '.rr.']),
      stamp(8, 15, { R: '#d8432f', r: '#8a2220', G: '#e8b730' }, [
        '.RR.',
        'RRRR',
        'rRRr',
        '.rr.',
        '.G..',
      ]),
      stamp(11, 29, { G: '#c99a1c' }, ['GG']),
      stamp(18, 30, { G: '#c99a1c' }, ['GGG']),
    ],
  ),

  megidramon: build(
    32,
    [
      // 뒤: 큰 날개 둘, 꼬리, 먼 다리
      poly(
        [
          [13, 14],
          [1, 1.5],
          [4, 7],
          [1, 9],
          [5, 13],
          [1, 17],
          [6, 18],
          [3, 23],
          [12, 20],
        ],
        DRAGON_D,
      ),
      poly(
        [
          [17, 11],
          [24, 1],
          [25, 5],
          [30, 4],
          [27, 9],
          [30, 12],
          [21, 14],
        ],
        DRAGON_D,
      ),
      capsule(12, 25, 2, 29, 3.6, DRAGON, { r1: 1.2 }),
      capsule(12, 24, 11, 29.5, 3.2, DRAGON_D),
      // 몸
      ellipse(16, 19, 7, 8, DRAGON),

      capsule(19, 25, 20, 29.5, 3.4, DRAGON),
      // 머리와 뿔
      poly(
        [
          [15, 6],
          [10, 1],
          [12, 0.8],
          [18, 5],
        ],
        BONE,
      ),
      poly(
        [
          [19, 5],
          [17, 1],
          [19, 0.8],
          [22, 5],
        ],
        BONE,
      ),
      ellipse(19, 8.5, 5.5, 4.5, DRAGON),
      ellipse(25, 10.5, 5, 3, DRAGON, { line: false }),
      // 가까운 팔과 발톱
      capsule(21, 16, 26, 21, 2.3, DRAGON),
    ],
    [
      stamp(20, 7, { R: '#ff4a3a', H: '#ffe0a0', K: '#120d12' }, ['KRRK', 'RHRK']),
      stamp(21, 12, { M: '#1a0508', T: '#f2ead8' }, ['MMMMMMMMM', '.T.T.T.T.']),
      stamp(17, 18, { B: '#33091a' }, ['B...B', '.B.B.', '..B..']),
      stamp(5, 5, { B: '#2e0814' }, ['B...', '.B..', '..B.', '...B']),
      stamp(4, 13, { B: '#2e0814' }, ['BB..', '..BB']),
      stamp(8, 29, { C: BONE[0], c: BONE[2] }, ['CcCc']),
      stamp(18, 30, { C: BONE[0], c: BONE[2] }, ['CcCcC']),
      stamp(26, 20, { C: BONE[0], c: BONE[2] }, ['C', 'cC', 'C']),
    ],
  ),
};
