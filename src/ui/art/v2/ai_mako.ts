// 임프몬 계열 2판 도트 (04 7절 2판, 32×32). 직접 그린 것입니다.
// 원작 그림을 따라 그리지 않고, 색과 큰 특징(빨간 두건·목도리, 흰 장갑, 가죽 옷, 산탄총 등)만 살렸습니다.
import { build, capsule, ellipse, poly, stamp } from '../build';
import type { PixelArt } from '../types';

const PURPLE = ['#c79bff', '#8f5ad8', '#5a3496', '#331c5c'] as const;
const PURPLE_D = ['#8f5ad8', '#6a40ab', '#3d2470'] as const;
const RED = ['#ff8a7a', '#e0453a', '#9a2622'] as const;
const GLOVE = ['#ffffff', '#ebe8f2', '#aaa4b8'] as const;
const LEATHER = ['#6a6478', '#3a3546', '#22202c', '#121018'] as const;
const LEATHER_D = ['#3a3546', '#26232f', '#14121a'] as const;
const STEEL = ['#eef1f6', '#b7bdc9', '#6e7686'] as const;
const WOOD = ['#c48a52', '#8e5a2e', '#5a3618'] as const;
const EYE = { R: '#ff3a3a', r: '#a01818', E: '#14121c', H: '#ffffff', Y: '#ffd84a' };

export const AI_MAKO_ART: Record<string, PixelArt> = {
  impmon: build(
    32,
    [
      // 꼬리 (뒤)
      capsule(11, 24, 6, 26, 1.4, PURPLE_D, { r1: 1 }),
      // 다리
      capsule(13, 24, 12, 29.5, 2.2, PURPLE_D),
      capsule(17.5, 24, 18.5, 29.5, 2.3, PURPLE),
      // 몸
      ellipse(15, 21.5, 5, 4.8, PURPLE),
      // 먼 팔 (흰 장갑)
      capsule(10.5, 19, 8, 22, 1.5, PURPLE_D),
      ellipse(7.6, 22.5, 1.9, 1.9, GLOVE),
      // 머리
      ellipse(15.5, 12.5, 7, 6.2, PURPLE),
      ellipse(20, 14.5, 3.2, 2.4, PURPLE, { line: false }),
      // 뾰족 귀
      poly(
        [
          [9.5, 10],
          [6, 3],
          [12, 7.5],
        ],
        PURPLE,
      ),
      poly(
        [
          [17, 7],
          [21, 2.5],
          [20.5, 9],
        ],
        PURPLE,
      ),
      // 목도리
      poly(
        [
          [9.5, 17.5],
          [21, 17.5],
          [20, 20],
          [10, 20],
        ],
        RED,
      ),
      poly(
        [
          [10, 19],
          [13, 19],
          [10.5, 24],
        ],
        RED,
      ),
      // 가까운 팔
      capsule(19.5, 19, 22, 21, 1.5, PURPLE),
      ellipse(23, 21, 2.1, 2.1, GLOVE),
    ],
    [
      // 두건 띠 (이마)
      stamp(11, 7, { R: RED[1], r: RED[2] }, ['RRRRRRRR', '.rrrrrr.']),
      // 노란 눈, 씩 웃는 입
      stamp(16, 11, EYE, ['YY.YY', 'EY.EY']),
      stamp(16, 15, { M: '#331c5c', T: '#ffffff' }, ['M.....M', '.MTMTM.']),
    ],
  ),

  beelzemon: build(
    32,
    [
      // 먼 다리
      capsule(13, 19, 10.5, 29.5, 2.4, LEATHER_D),
      // 먼 팔
      capsule(11, 11, 7.5, 18, 1.9, LEATHER_D),
      // 가까운 다리
      capsule(17, 19, 19.5, 29.5, 2.6, LEATHER),
      // 몸통 (가죽 재킷)
      poly(
        [
          [10.5, 9.5],
          [20.5, 9.5],
          [19, 20.5],
          [12, 20.5],
        ],
        LEATHER,
      ),
      poly(
        [
          [13.8, 10],
          [17.2, 10],
          [16.2, 16],
          [14.8, 16],
        ],
        ['#8a8496', '#5a5468', '#3a3546'],
      ),
      poly(
        [
          [10.5, 9.5],
          [13.8, 9.5],
          [14.6, 16],
          [12.4, 15],
        ],
        ['#8a8496', '#4e485c', '#2a2634'],
        { line: true },
      ),
      // 머리 + 투구
      ellipse(15.5, 5.5, 3.8, 4, LEATHER),
      poly(
        [
          [12, 3],
          [9, -0.5],
          [13.5, 2],
        ],
        LEATHER,
      ),
      poly(
        [
          [19, 3],
          [22, -0.5],
          [17.5, 2],
        ],
        LEATHER,
      ),
      ellipse(16.5, 7.6, 2.9, 2.2, ['#d8b4ff', '#a77ae6', '#6a40ab'], { line: false }),
      // 가까운 팔
      capsule(20, 11, 23.5, 15.5, 2, LEATHER),
      // 산탄총
      poly(
        [
          [19, 15.5],
          [31, 12.2],
          [31.4, 15],
          [21, 18.4],
        ],
        STEEL,
      ),
      poly(
        [
          [17, 16.5],
          [21.5, 15.5],
          [22, 19],
          [18, 19.5],
        ],
        WOOD,
      ),
    ],
    [
      // 세 개의 빨간 눈
      stamp(14, 4, EYE, ['R.R', '.R.']),
      // 입
      stamp(15, 8, { E: '#14121c', T: '#ffffff' }, ['TETE']),
      // 재킷 지퍼·벨트
      stamp(12, 17, { Y: '#c0c4cc', y: '#6e7686', R: '#a01818' }, ['YYYRYYy']),
      // 손 (장갑 끝)
      stamp(22, 15, { G: '#3a3546' }, ['GG']),
      // 총구
      stamp(30, 13, { E: '#14121c' }, ['E', 'E']),
      // 부츠
      stamp(8, 29, { B: '#121018', b: '#3a3546' }, ['bBBB']),
      stamp(18, 29, { B: '#121018', b: '#6a6478' }, ['bBBBB']),
    ],
  ),
};
