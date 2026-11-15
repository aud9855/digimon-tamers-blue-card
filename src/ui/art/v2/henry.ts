// 테리어몬 계열 2판 도트 (04 7절 2판, 32×32). 직접 그린 것입니다.
// 원작 그림을 따라 그리지 않고, 색과 큰 특징(긴 귀, 초록 무늬, 작은 뿔, 개틀링, 갑옷 등)만 살렸습니다.
import { build, capsule, ellipse, poly, stamp } from '../build';
import type { PixelArt } from '../types';

const CREAM = ['#fffdf2', '#f4ebd2', '#d6c49a', '#9a865c'] as const;
const CREAM_D = ['#d6c49a', '#b8a476', '#7e6b48'] as const;
const GREEN = ['#a6ec8c', '#5cbf55', '#2f7a35'] as const;
const GREEN_D = ['#5cbf55', '#3f9442', '#22582a'] as const;
const JEANS = ['#7fa8e8', '#4a72c4', '#2a4682'] as const;
const STEEL = ['#eef1f6', '#b7bdc9', '#7a8292', '#454b58'] as const;
const STEEL_D = ['#8e96a6', '#626a7a', '#383d48'] as const;
const GOLD = ['#fff2a8', '#f5c842', '#b8861c'] as const;
const RED = ['#ff8a7a', '#e0453a', '#8e2420'] as const;
const EYE = { E: '#14121c', H: '#ffffff', G: '#3f9442' };
const MOUTH = { M: '#6a2f2a', T: '#ffffff' };

export const HENRY_ART: Record<string, PixelArt> = {
  terriermon: build(
    32,
    [
      // 긴 귀 두 개 (머리 뒤로 늘어짐), 끝은 초록
      capsule(19, 9, 25.5, 17.5, 2.5, CREAM_D, { r1: 2.1 }),
      ellipse(25.6, 18.3, 2.1, 2.1, GREEN_D),
      capsule(11.5, 9, 5.5, 18, 2.7, CREAM, { r1: 2.2 }),
      ellipse(5.4, 18.8, 2.3, 2.3, GREEN),
      // 몸·다리
      capsule(12.5, 26, 12, 29.5, 2.1, CREAM_D),
      ellipse(15, 23.8, 5, 5, CREAM),
      capsule(17.5, 26, 18.5, 29.5, 2.2, CREAM),
      capsule(19, 22, 21.5, 24.5, 1.5, CREAM),
      // 머리, 주둥이
      ellipse(15.5, 13.5, 7, 6, CREAM),
      ellipse(19.8, 15.8, 3.4, 2.4, CREAM, { line: false }),
      // 작은 뿔
      poly(
        [
          [14, 8.2],
          [15.5, 4.5],
          [17, 8.2],
        ],
        CREAM,
      ),
    ],
    [
      // 눈 (초록 눈썹 무늬)
      stamp(15, 10, { G: GREEN[1] }, ['GG.GG']),
      stamp(15, 11, EYE, ['EE.EE', 'EH.EH']),
      // 코·입
      stamp(22, 14, { E: '#14121c' }, ['E']),
      stamp(18, 17, MOUTH, ['M..M', '.MM.']),
    ],
  ),

  gargomon: build(
    32,
    [
      // 먼 귀 (뒤로 젖힘)
      capsule(17, 7, 25, 3, 2.4, CREAM_D, { r1: 1.8 }),
      // 먼 팔: 개틀링
      capsule(9, 15, 5, 19, 2.6, STEEL_D),
      capsule(5, 19, 2.5, 22, 2.2, STEEL_D),
      // 다리 (청바지)
      capsule(12, 23, 10.5, 29.4, 3, JEANS),
      capsule(18, 23, 19.5, 29.4, 3.1, JEANS),
      // 몸통
      ellipse(15, 17.5, 6.6, 6.2, CREAM),
      poly(
        [
          [8.6, 20],
          [21.4, 20],
          [21, 24],
          [9, 24],
        ],
        JEANS,
      ),
      poly(
        [
          [8.6, 20],
          [21.4, 20],
          [21.4, 21.2],
          [8.6, 21.2],
        ],
        STEEL,
        { flat: true },
      ),
      // 머리
      ellipse(15.5, 9, 6.6, 5.6, CREAM),
      ellipse(20.5, 10.8, 3.6, 2.6, CREAM, { line: false }),
      // 가까운 귀
      capsule(12, 5, 4, 2, 2.6, CREAM, { r1: 1.9 }),
      capsule(5, 2.3, 2.6, 1.4, 1.8, GREEN),
      // 가까운 팔: 큰 개틀링
      capsule(19, 15, 23, 18, 3, STEEL),
      capsule(23, 18, 28.5, 18, 2.6, STEEL),
    ],
    [
      stamp(15, 6, EYE, ['GG.GG', '.E..E', '.H..H']),
      stamp(14.5 | 0, 3, { G: GREEN[1] }, ['.G.', 'GGG']),
      stamp(19, 11, MOUTH, ['M...M', '.MMM.']),
      // 총구
      stamp(28, 16, { E: '#14121c', S: STEEL[2] }, ['S', 'E', 'E', 'S', 'E']),
      // 가슴 초록 무늬
      stamp(13, 14, { G: GREEN[1] }, ['G..G', '.GG.']),
      // 신발
      stamp(8, 29, { R: RED[1], r: RED[2] }, ['RRRr']),
      stamp(18, 29, { R: RED[1], r: RED[2] }, ['RRRRr']),
    ],
  ),

  rapidmon: build(
    32,
    [
      // 먼 귀 안테나
      capsule(17, 6, 24, 1.5, 1.8, GREEN_D, { r1: 1.2 }),
      // 먼 팔 + 미사일
      capsule(10, 13, 6, 17, 2.2, GREEN_D),
      capsule(6, 17, 3.5, 13, 1.6, STEEL_D),
      // 다리
      capsule(12.5, 21, 10.5, 29.4, 2.8, GREEN),
      capsule(18, 21, 20, 29.4, 2.9, GREEN),
      // 몸통 갑옷
      ellipse(15, 15.5, 6.4, 6.6, GREEN),
      poly(
        [
          [11, 13],
          [19, 13],
          [17.5, 19],
          [12.5, 19],
        ],
        GREEN_D,
      ),
      // 머리 (투구)
      ellipse(15.5, 7.5, 5.6, 4.8, GREEN),
      poly(
        [
          [18, 6.5],
          [24, 7.5],
          [24, 10],
          [18.5, 10.5],
        ],
        GREEN,
      ),
      // 가까운 귀 안테나
      capsule(12, 4.5, 5.5, 0.8, 2, GREEN, { r1: 1.3 }),
      // 가까운 팔 + 미사일
      capsule(19.5, 13, 23, 17, 2.3, GREEN),
      capsule(22, 17.5, 28.5, 14.5, 1.9, STEEL),
      poly(
        [
          [28, 12.5],
          [30.5, 14],
          [29, 16.5],
        ],
        RED,
      ),
    ],
    [
      // 눈 가리개 (노란 바이저)
      stamp(15, 6, { Y: GOLD[1], y: GOLD[2], H: '#ffffff' }, ['YYYYYYy', 'HYYYYyy']),
      // 금 장식
      stamp(11, 10, { Y: GOLD[1] }, ['YYYYYYYY']),
      stamp(12, 14, { Y: GOLD[0], y: GOLD[2] }, ['Y....Y', '.Y..Y.', '..yy..']),
      // 무릎·발 금장
      stamp(9, 25, { Y: GOLD[1] }, ['YYY']),
      stamp(19, 25, { Y: GOLD[1] }, ['YYY']),
      stamp(8, 29, { Y: GOLD[1], y: GOLD[2] }, ['YYYy']),
      stamp(18, 29, { Y: GOLD[1], y: GOLD[2] }, ['YYYYy']),
    ],
  ),

  megagargomon: build(
    32,
    [
      // 등의 미사일 통 (양쪽)
      poly(
        [
          [1, 6],
          [8, 4],
          [9, 13],
          [1, 14],
        ],
        GREEN_D,
      ),
      poly(
        [
          [23, 4],
          [30, 6],
          [30, 14],
          [22, 13],
        ],
        GREEN_D,
      ),
      // 다리
      poly(
        [
          [5, 21],
          [13, 21],
          [13, 30],
          [3, 30],
        ],
        GREEN_D,
      ),
      poly(
        [
          [18, 21],
          [27, 21],
          [28.5, 30],
          [18, 30],
        ],
        GREEN,
      ),
      // 몸통
      ellipse(16, 15.5, 10, 8.5, GREEN),
      poly(
        [
          [9, 19],
          [23, 19],
          [21.5, 23.5],
          [10.5, 23.5],
        ],
        GREEN_D,
      ),
      // 머리
      ellipse(16, 6.5, 5, 4.2, GREEN),
      capsule(13, 3.5, 9, 0.8, 1.6, GREEN, { r1: 1.1 }),
      capsule(19, 3.5, 23, 0.8, 1.6, GREEN, { r1: 1.1 }),
      // 어깨 대포
      capsule(4, 15, 4, 26, 3.2, STEEL_D),
      capsule(28, 15, 28, 26, 3.3, STEEL),
    ],
    [
      // 미사일 머리
      stamp(2, 5, { R: RED[1], r: RED[2] }, ['.R.R.R', '.r.r.r']),
      stamp(24, 5, { R: RED[1], r: RED[2] }, ['R.R.R.', 'r.r.r.']),
      // 눈 바이저
      stamp(13, 6, { Y: GOLD[1], y: GOLD[2] }, ['YYYYYYy']),
      // 가슴 장식
      stamp(13, 12, { Y: GOLD[1], y: GOLD[2], R: RED[1] }, ['yYYYYy', 'YYRRYY', '.yYYy.']),
      // 포구
      stamp(2, 26, { E: '#14121c', S: STEEL_D[2] }, ['SEES', '.EE.']),
      stamp(26, 26, { E: '#14121c', S: STEEL[2] }, ['SEES', '.EE.']),
      // 금 테두리
      stamp(4, 29, { Y: GOLD[2] }, ['YYYYYYYY']),
      stamp(19, 29, { Y: GOLD[1] }, ['YYYYYYYYY']),
    ],
  ),
};
