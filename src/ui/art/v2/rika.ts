// 레나몬 계열 2판 도트 (04 7절 2판, 32×32). 직접 그린 것입니다.
// 원작 그림을 따라 그리지 않고, 색과 큰 특징(긴 귀, 꼬리, 팔토시, 도복, 갑옷 등)만 살렸습니다.
import { build, capsule, ellipse, poly, stamp, type Part } from '../build';
import type { PixelArt } from '../types';

const YEL = ['#fff3b0', '#ffd65a', '#e8a92e', '#a0641c'] as const;
const YEL_D = ['#e0a02c', '#b97a20', '#7a4a16'] as const;
const WHITE = ['#ffffff', '#f1ebdf', '#bfb3a2'] as const;
const PURP = ['#c39cf0', '#8a5cc4', '#57348a'] as const;
const FLAME = ['#e8f8ff', '#7cd0ff', '#3a8ce8', '#1d4fa0'] as const;
const ROBE = ['#ffffff', '#ebe6f2', '#b3abc4'] as const;
const ROBE_D = ['#d9d2e6', '#ada4bf', '#746b8a'] as const;
const WOOD = ['#d9a066', '#a86b34', '#6b3f1c'] as const;
const INK = ['#5a5a6e', '#2d2d3a', '#15151c'] as const;
const GOLD = ['#fff6c0', '#f7d45a', '#d4a62a', '#8a6418'] as const;
const GOLD_D = ['#d4a62a', '#a87e20', '#6e5016'] as const;
const HAIR = ['#efe8ff', '#bfaeea', '#7a63b8'] as const;

const EYE = { H: '#ffffff', B: '#59b7ff', b: '#2c6fc4', E: '#0d1530' };
const NOSE = { N: '#2a1820' };

/** 구미호몬의 아홉 꼬리: 밑동에서 위·왼쪽으로 부채꼴 */
function nineTails(bx: number, by: number, len: number): Part[] {
  const parts: Part[] = [];
  for (let k = 0; k < 9; k++) {
    const a = ((72 + k * 22) * Math.PI) / 180;
    const ex = bx + Math.cos(a) * len;
    const ey = by - Math.sin(a) * len;
    parts.push(capsule(bx, by, ex, ey, 0.8, YEL, { r1: 1.3 }));
    parts.push(ellipse(ex, ey, 1.5, 1.5, FLAME));
  }
  return parts;
}

export const RIKA_ART: Record<string, PixelArt> = {
  renamon: build(
    32,
    [
      // 뒤: 꼬리, 먼 다리, 먼 팔
      capsule(13, 21, 6.5, 24.5, 2.4, YEL, { r1: 3.6 }),
      ellipse(4.8, 25.8, 3, 2.8, WHITE),
      capsule(14.2, 22, 13.4, 29.5, 1.7, YEL_D),
      capsule(14, 13.5, 11.5, 18.5, 1.3, YEL_D),
      capsule(11.5, 18.5, 10.8, 21.5, 1.6, PURP),
      // 몸
      ellipse(15.6, 17.5, 3.7, 5, YEL),
      ellipse(17, 15.8, 2.5, 3.1, WHITE),
      ellipse(16.2, 21.6, 3, 2.6, YEL, { line: false }),
      capsule(16.8, 22.5, 17.6, 29.5, 2, YEL),
      // 귀 → 머리
      poly(
        [
          [12, 7],
          [12.2, 0.5],
          [15.2, 5],
        ],
        YEL,
      ),
      poly(
        [
          [16, 4.5],
          [18.6, 0.2],
          [19.8, 5.5],
        ],
        YEL,
      ),
      ellipse(16, 8.6, 4.5, 4, YEL),
      ellipse(20.3, 10, 3, 1.8, YEL, { line: false }),
      ellipse(19.8, 11.2, 2.2, 0.9, WHITE, { line: false }),
      // 가까운 팔과 팔토시
      capsule(17.8, 13.2, 21, 17, 1.4, YEL),
      capsule(21, 17, 22.6, 20.6, 1.9, PURP),
    ],
    [
      stamp(16, 7, EYE, ['HBE', 'bb.']),
      stamp(23, 9, NOSE, ['N']),
      // 귀 안쪽
      stamp(13, 3, { P: '#c97a3a' }, ['P', 'P']),
      stamp(18, 2, { P: '#c97a3a' }, ['P', 'P']),
      // 팔토시 무늬 (음양)
      stamp(21, 18, { W: '#ffffff', K: '#2a1820' }, ['WK']),
      // 발
      stamp(12, 30, { F: YEL_D[1], f: YEL_D[2] }, ['fFf']),
      stamp(16, 30, { F: YEL[2], f: YEL[3] }, ['FFff']),
    ],
  ),

  kyubimon: build(
    32,
    [
      ...nineTails(9.5, 18.5, 8.6),
      // 먼 다리
      capsule(21.5, 21, 22, 29.5, 1.6, YEL_D),
      capsule(11.5, 21, 11, 29.5, 1.6, YEL_D),
      // 몸
      ellipse(16, 20, 6.8, 3.9, YEL),
      ellipse(21.2, 18.2, 3, 3.6, WHITE),
      capsule(13.5, 22, 13.6, 29.5, 1.9, YEL),
      capsule(19.4, 22, 19.8, 29.5, 1.9, YEL),
      // 목·귀·머리
      capsule(20.5, 17, 22.5, 12, 2.4, YEL, { line: false }),
      poly(
        [
          [20.3, 9.5],
          [20.6, 3.6],
          [23, 8],
        ],
        YEL,
      ),
      poly(
        [
          [23.2, 7.2],
          [26, 3],
          [26.5, 8.5],
        ],
        YEL,
      ),
      ellipse(23.5, 10.4, 3.8, 3.3, YEL),
      ellipse(27.4, 11.8, 2.6, 1.5, YEL, { line: false }),
      ellipse(27, 12.9, 1.8, 0.7, WHITE, { line: false }),
    ],
    [
      stamp(24, 9, EYE, ['HBE', 'bb.']),
      stamp(29, 11, NOSE, ['N']),
      stamp(21, 5, { P: '#c97a3a' }, ['P', 'P']),
      // 다리의 보라 무늬
      stamp(13, 25, { P: PURP[1], p: PURP[2] }, ['PP', 'pp']),
      stamp(19, 25, { P: PURP[1], p: PURP[2] }, ['PP', 'pp']),
      stamp(12, 30, { F: YEL[2], f: YEL[3] }, ['FFf']),
      stamp(18, 30, { F: YEL[2], f: YEL[3] }, ['FFff']),
    ],
  ),

  taomon: build(
    32,
    [
      // 먼 소매
      poly(
        [
          [11, 12],
          [5, 22],
          [11, 24],
          [13.5, 16],
        ],
        ROBE_D,
      ),
      capsule(5.5, 22.6, 11, 24.3, 1, PURP),
      // 치마·몸
      poly(
        [
          [10.5, 17],
          [20.5, 17],
          [23.5, 30.5],
          [7.5, 30.5],
        ],
        ROBE,
      ),
      capsule(15.5, 19, 15.5, 30, 0.8, PURP, { line: false }),
      ellipse(15.5, 15.5, 5, 4.4, ROBE),
      // 머리·모자
      ellipse(15.5, 8.8, 4, 3.6, YEL),
      ellipse(19.5, 10.2, 2.4, 1.5, YEL, { line: false }),
      poly(
        [
          [11, 7.5],
          [11.5, 2.5],
          [15.5, 0.5],
          [19.5, 2.5],
          [20, 6],
          [17.5, 4.6],
          [13.5, 4.6],
        ],
        PURP,
      ),
      // 붓 (가까운 손)
      capsule(24.5, 7, 27, 25, 0.9, WOOD),
      ellipse(27.3, 27.4, 1.7, 2.6, INK),
      // 가까운 소매
      poly(
        [
          [18.5, 12.5],
          [26.5, 21],
          [20.5, 24],
          [17, 17],
        ],
        ROBE,
      ),
      capsule(20.5, 23.8, 26.4, 21.2, 1, PURP),
      ellipse(25.3, 19.4, 1.3, 1.3, YEL),
    ],
    [
      stamp(16, 8, EYE, ['HBE', 'bb.']),
      // 여우 가면의 빨간 줄
      stamp(15, 7, { R: '#d8432f' }, ['R...R', '.....', 'R....']),
      stamp(21, 10, NOSE, ['N']),
      // 가슴의 음양 무늬
      stamp(14, 14, { W: '#ffffff', K: '#2a1820', P: PURP[1] }, ['PWP', 'WKP', 'PKP']),
    ],
  ),

  sakuyamon: build(
    32,
    [
      // 뒤: 머리카락, 먼 다리, 먼 팔
      capsule(12.5, 8, 8.5, 21, 2.2, HAIR, { r1: 1.4 }),
      capsule(14, 22, 13.4, 29.5, 1.8, GOLD_D),
      capsule(11, 13, 8.8, 19.5, 1.3, GOLD_D),
      // 지팡이
      capsule(25, 5, 25, 30, 0.6, GOLD_D),
      // 허리 장식, 몸
      poly(
        [
          [10.5, 18],
          [20.5, 18],
          [21.5, 24.5],
          [9.5, 24.5],
        ],
        PURP,
      ),
      capsule(17.2, 22, 18.2, 29.5, 2, GOLD),
      ellipse(15.5, 15.4, 4.2, 4, GOLD),
      ellipse(11, 12.4, 2.6, 2, PURP),
      ellipse(20, 12.4, 2.8, 2.2, PURP),
      // 귀 달린 투구
      poly(
        [
          [12, 6.5],
          [12, 0.5],
          [14.8, 4.5],
        ],
        GOLD,
      ),
      poly(
        [
          [16.5, 4],
          [19.2, 0.5],
          [19.8, 6.5],
        ],
        GOLD,
      ),
      ellipse(15.6, 7.6, 4.2, 3.8, GOLD),
      // 가까운 팔
      capsule(20, 13, 24.2, 16.2, 1.4, GOLD),
      ellipse(24.8, 16.4, 1.3, 1.3, GOLD),
    ],
    [
      // 지팡이 머리 고리
      stamp(23, 0, { G: GOLD[1], g: GOLD[3] }, ['.GGG.', 'G...g', 'G...g', '.ggg.']),
      stamp(21, 3, { G: GOLD[2] }, ['G']),
      stamp(28, 3, { G: GOLD[2] }, ['G']),
      // 투구 가면: 검은 틈과 파란 눈빛
      stamp(14, 8, { K: '#1a1428', B: '#59b7ff' }, ['KKKKK', '.KBK.']),
      // 가슴 보석, 허리 끈
      stamp(13, 14, { R: '#e04a8a', r: '#8a1f55', P: PURP[1] }, ['P.....P', '.P.R.P.', '..PrP..']),
      stamp(12, 19, { P: PURP[0] }, ['P......P']),
      stamp(13, 30, { F: GOLD_D[1], f: GOLD_D[2] }, ['fFf']),
      stamp(17, 30, { F: GOLD[2], f: GOLD[3] }, ['FFff']),
    ],
  ),
};
