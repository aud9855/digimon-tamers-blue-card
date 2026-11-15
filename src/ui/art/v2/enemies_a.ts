// 적 2판 도트 앞쪽 12종 (04 7절 2판, 32×32). 직접 그린 것입니다.
// 원작 그림을 따라 그리지 않고, 1판과 같은 색과 큰 특징(날개, 집게, 갑옷, 무기 등)만 살렸습니다.
import { build, capsule, ellipse, poly, stamp, type Part, type Stamp } from '../build';
import type { PixelArt } from '../types';

const S = 32;

/** 좌우 대칭 짝 (가운데 x=16 기준) */
function mirror(p: Part): Part {
  if (p.kind === 'ellipse') return { ...p, cx: S - p.cx, rot: p.rot ? -p.rot : undefined };
  if (p.kind === 'capsule') return { ...p, x0: S - p.x0, x1: S - p.x1 };
  return { ...p, pts: p.pts.map(([x, y]) => [S - x, y] as const) };
}
const both = (p: Part): Part[] => [p, mirror(p)];
function mirrorStamp(s: Stamp): Stamp {
  const w = Math.max(...s.rows.map((r) => r.length));
  return {
    ...s,
    x: S - s.x - w,
    rows: s.rows.map((r) => [...r.padEnd(w, '.')].reverse().join('')),
  };
}
const bothStamp = (s: Stamp): Stamp[] => [s, mirrorStamp(s)];

// ── 재질 (밝은 색 → 기본 → 그림자, 4톤이면 맨 앞이 반짝임) ──
const GOB = ['#b6e47a', '#7cbf45', '#4f8a2c', '#2f5a1c'] as const;
const WOOD = ['#c48a52', '#8a5a32', '#5a381c'] as const;
const CLOTH_R = ['#f07a6e', '#d0463a', '#8a2a22'] as const;
const VILE = ['#a487cf', '#6f56a0', '#4a3a6e', '#2c2245'] as const;
const VILE_W = ['#6f56a0', '#4a3a6e', '#2c2245'] as const;
const ALLO = ['#ffc98a', '#ec9a48', '#c06d26', '#7a3f14'] as const;
const ALLO_D = ['#c06d26', '#94511c', '#5e3010'] as const;
const CREAM = ['#fff6e2', '#f1dfbf', '#c2a986'] as const;
const FUR = ['#ffffff', '#e6e6ea', '#b4b4bf', '#6f6f7d'] as const;
const FACE_D = ['#6a6676', '#45414f', '#25222c'] as const;
const METAL = ['#c3cad8', '#7f889a', '#454b5c'] as const;
const HARPY = ['#b9d4ff', '#6d9ae6', '#3f68b0', '#243e74'] as const;
const SKIN = ['#ffe8cf', '#f2c9a0', '#c48e64'] as const;
const PINK = ['#ffc6e0', '#ec88b6', '#b55684'] as const;
const TALON = ['#fff0a0', '#e8b93a', '#9a7417'] as const;
const TBIRD = ['#fff6b0', '#f5d43c', '#c79c1c', '#7d5f10'] as const;
const ICE = ['#ffffff', '#d6f0ff', '#9cc8ea', '#5f8fbf'] as const;
const ICE_W = ['#a9d2f0', '#6a9fd0', '#3d6fa8'] as const;
const ICE_B = ['#6c9fd8', '#3d6fa8', '#244a78'] as const;
const NAVY = ['#8d9bd2', '#4a5890', '#2c3666', '#181d3c'] as const;
const SAMU_R = ['#f07a6e', '#c43c3c', '#7e2222'] as const;
const STEEL = ['#ffffff', '#d4dbe6', '#8b95a6'] as const;
const ROCK = ['#ececf2', '#b4b4be', '#84848f', '#52525c'] as const;
const FROG = ['#c2f29a', '#74c25e', '#43893b', '#285626'] as const;
const FROG_Y = ['#fff6b0', '#f2d03c', '#b99a1e'] as const;
const FROG_O = ['#ffb070', '#e8873a', '#a85520'] as const;
const BEETLE = ['#ff9a8a', '#d8463c', '#9a2a24', '#5a1614'] as const;
const PINCER = ['#ffffff', '#e2ddd2', '#a9a296', '#625c54'] as const;
const LEG_D = ['#6a5656', '#3a2a2a', '#1e1414'] as const;
const PICO = ['#8a7cb0', '#5a4f7a', '#3b3550', '#221e2e'] as const;
const PICO_W = ['#5a4f7a', '#3b3550', '#221e2e'] as const;

const RED_EYE = { R: '#ff4a4a', r: '#a01c1c', H: '#ffffff' };
const YEL_EYE = { Y: '#ffe04a', y: '#c99a1c', E: '#120d12', H: '#ffffff' };

const goblimon = build(
  S,
  [
    // 몽둥이 (뒤)
    capsule(25, 22, 28.5, 10, 1.4, WOOD, { r1: 2.8 }),
    ...both(
      poly(
        [
          [11, 8],
          [2, 4],
          [4, 9],
          [10, 13],
        ],
        GOB,
      ),
    ),
    // 다리·몸
    ...both(capsule(13.5, 24, 13, 29.5, 2.3, GOB)),
    ellipse(16, 20.5, 5.6, 5.4, GOB),
    poly(
      [
        [10.5, 21],
        [21.5, 21],
        [20, 26.5],
        [16, 25],
        [12, 26.5],
      ],
      CLOTH_R,
    ),
    // 팔
    capsule(11, 17, 8, 22.5, 1.9, GOB),
    capsule(21, 17, 24.5, 21, 1.9, GOB),
    // 머리
    ellipse(16, 10.5, 7.2, 6.4, GOB),
  ],
  [
    stamp(11, 9, YEL_EYE, ['YY....YY', 'YEY..YEY', '.y....y.']),
    stamp(12, 13, { M: '#2a1418', T: '#fff6e8' }, ['MMMMMMMM', '.TMMMMT.']),
    stamp(15, 11, { n: '#2f5a1c' }, ['n.n']),
    stamp(23, 19, { h: '#2f5a1c' }, ['hh', 'hh']),
  ],
);

const vilemon = build(
  S,
  [
    ...both(
      poly(
        [
          [13, 13],
          [2, 4],
          [3, 9],
          [1, 13],
          [5, 13],
          [3, 18],
          [9, 16],
          [12, 20],
        ],
        VILE_W,
      ),
    ),
    ...both(
      poly(
        [
          [12, 9],
          [9, 2],
          [14, 7],
        ],
        VILE,
      ),
    ),
    ...both(capsule(13.5, 23, 13, 29.5, 1.9, VILE)),
    ellipse(16, 18, 6, 6.6, VILE),
    ellipse(16, 11, 5.4, 4.6, VILE, { line: false }),
  ],
  [
    ...bothStamp(stamp(12, 10, RED_EYE, ['RR', 'rR'])),
    stamp(13, 14, { M: '#1a1222', T: '#fff6e8' }, ['MMMMMM', 'TMTTMT']),
    stamp(14, 19, { m: '#2c2245' }, ['m..m', '.mm.']),
    ...bothStamp(stamp(11, 29, { C: '#d9d2c6' }, ['CC'])),
  ],
);

const allomon = build(
  S,
  [
    // 꼬리 (오른쪽 뒤), 먼 다리
    capsule(21, 22, 29, 27, 3.6, ALLO, { r1: 1.6 }),
    capsule(20.5, 24, 21.5, 29.5, 2.8, ALLO_D),
    capsule(20, 18, 23, 21, 1.6, ALLO_D),
    // 몸
    ellipse(17.5, 20.5, 6.4, 7, ALLO),
    ellipse(15.4, 22.4, 3.8, 4.8, CREAM),
    capsule(15, 25.5, 14, 29.5, 3.1, ALLO),
    // 머리 (왼쪽을 봄)
    ellipse(17, 10, 7, 6, ALLO),
    ellipse(9.5, 12, 7, 3.8, ALLO, { line: false }),
    // 가까운 팔
    capsule(13.5, 18, 10.5, 20.5, 1.7, ALLO),
  ],
  [
    stamp(13, 8, YEL_EYE, ['.YYY.', 'yEYHY', 'yEYYY', '.yyy.']),
    stamp(4, 14, { M: '#4a1a0a', T: '#fff6e8' }, ['MMMMMMMMMM', '..TT..TT..']),
    stamp(18, 4, { s: '#7a3f14' }, ['s.s', '.s.s']),
    stamp(22, 15, { s: '#7a3f14' }, ['s', '.s', 's']),
    stamp(13, 30, { C: '#e4ded2', c: '#9c958a' }, ['CcCcC']),
    stamp(20, 30, { C: '#e4ded2', c: '#9c958a' }, ['cCcC']),
    stamp(8, 20, { C: '#e4ded2', c: '#9c958a' }, ['C.', 'cC']),
  ],
);

const gorillamon = build(
  S,
  [
    ...both(capsule(12, 23, 11.5, 29.5, 2.8, FUR)),
    ellipse(16, 18.5, 8.2, 7.2, FUR),
    // 왼팔 주먹
    capsule(8.5, 15, 6, 25, 2.9, FUR),
    ellipse(6, 26.5, 2.6, 2.2, FACE_D),
    // 오른팔 대포
    capsule(23.5, 15, 25.5, 24.5, 3.4, METAL),
    // 머리
    ellipse(16, 9, 6, 5.4, FUR),
    ellipse(16, 10.4, 4.6, 3.9, FACE_D),
  ],
  [
    stamp(12, 8, { W: '#ffffff', E: '#120d12', b: '#8a8696' }, [
      '.bb...bb.',
      '.WW...WW.',
      '.WE...EW.',
    ]),
    stamp(14, 12, { n: '#8a8696' }, ['n..n']),
    stamp(23, 25, { C: '#4fd6ff', c: '#1f8fb8', H: '#e8fbff' }, ['cCHCc', '.cCc.']),
    stamp(22, 18, { b: '#2f3442' }, ['b.b.b.b']),
    stamp(13, 17, { f: '#b4b4bf' }, ['f.f..f', '.f..f.']),
  ],
);

const harpymon = build(
  S,
  [
    ellipse(16, 8.5, 6.6, 5.4, PINK),
    ...both(
      poly(
        [
          [12.5, 11],
          [2, 5],
          [1, 12],
          [3, 18],
          [7, 21],
          [12.5, 19],
        ],
        HARPY,
      ),
    ),
    ...both(capsule(14, 23, 13, 28.5, 1.2, TALON)),
    ellipse(16, 18, 4.2, 6, HARPY),
    ellipse(16, 10, 4.4, 4.4, SKIN),
  ],
  [
    stamp(12, 5, { P: '#ec88b6', p: '#b55684' }, ['PPPPPPPP', 'PpPPPPpP']),
    stamp(13, 10, { E: '#2a1a3a', H: '#ffffff' }, ['EH..EH']),
    stamp(15, 13, { m: '#c4566a' }, ['mm']),
    stamp(13, 17, { F: '#f2c9a0' }, ['.FFFF.', '..FF..']),
    ...bothStamp(stamp(3, 12, { f: '#243e74' }, ['f..', '.f.', '..f', 'f..', '.f.'])),
    stamp(10, 29, { Y: '#e8b93a', y: '#9a7417' }, ['YyY.....YyY']),
  ],
);

const thunderbirdmon = build(
  S,
  [
    ...both(
      poly(
        [
          [13, 13],
          [1, 5],
          [2, 10],
          [0.5, 14],
          [5, 17],
          [3, 21],
          [9, 20],
          [13, 22],
        ],
        TBIRD,
      ),
    ),
    poly(
      [
        [12.5, 21],
        [19.5, 21],
        [21, 29],
        [16, 26.5],
        [11, 29],
      ],
      TBIRD,
    ),
    ellipse(16, 16, 5, 7, TBIRD),
    ellipse(16, 8.5, 4.2, 4.2, TBIRD),
  ],
  [
    stamp(13, 7, YEL_EYE, ['E....E']),
    stamp(15, 9, { B: '#e8873a', b: '#a85520' }, ['BB', 'bb', '.b']),
    // 어두운 날개 무늬
    ...bothStamp(stamp(4, 9, { D: '#45405e' }, ['DD....', '.DDD..', '...DDD', '.....D'])),
    stamp(14, 14, { D: '#45405e' }, ['D..D', '.DD.']),
    // 번개
    ...bothStamp(stamp(1, 1, { L: '#9be7ff', l: '#ffffff' }, ['..L', '.L.', 'LlL', '.L.', 'L..'])),
    stamp(12, 29, { T: '#c79c1c' }, ['TT....TT']),
  ],
);

const icedevimon = build(
  S,
  [
    ...both(
      poly(
        [
          [12, 12],
          [3, 2],
          [4, 8],
          [1, 12],
          [5, 14],
          [3, 19],
          [9, 17],
          [12, 21],
        ],
        ICE_W,
      ),
    ),
    ...both(
      poly(
        [
          [13, 6],
          [11, 1],
          [15, 5],
        ],
        ICE,
      ),
    ),
    ...both(capsule(14, 22, 13, 29.5, 1.8, ICE)),
    ...both(capsule(12, 15, 8.5, 24, 1.4, ICE)),
    ellipse(16, 17.5, 4.6, 5.6, ICE),
    poly(
      [
        [11.5, 20],
        [20.5, 20],
        [20, 22],
        [12, 22],
      ],
      ICE_B,
    ),
    ellipse(16, 9.5, 4.6, 4.4, ICE),
  ],
  [
    stamp(13, 9, RED_EYE, ['RR..RR', '.r..r.']),
    stamp(14, 12, { M: '#3d6fa8' }, ['MMMM']),
    ...bothStamp(stamp(7, 24, { C: '#3d6fa8' }, ['C.C', '.C.'])),
    stamp(14, 15, { s: '#9cc8ea' }, ['s..s', '.ss.']),
  ],
);

const musyamon = build(
  S,
  [
    // 칼 (뒤)
    capsule(24.5, 21, 29.5, 6, 0.8, STEEL),
    ...both(capsule(13, 24, 12.5, 29.5, 2.3, NAVY)),
    poly(
      [
        [9.5, 20.5],
        [22.5, 20.5],
        [23.5, 25.5],
        [8.5, 25.5],
      ],
      NAVY,
    ),
    ellipse(16, 17.5, 5.6, 5, SAMU_R),
    ...both(ellipse(9.8, 15, 3.2, 2.6, NAVY)),
    capsule(9, 16, 7.5, 22, 1.7, NAVY),
    capsule(23, 16, 24.5, 21.5, 1.7, NAVY),
    ellipse(16, 8.5, 5.8, 4.6, NAVY),
    ellipse(16, 11, 3.6, 3, SKIN),
  ],
  [
    stamp(14, 1, { Y: '#e9c04a', y: '#a27e1c' }, ['Y..Y', 'YYYY', '.yy.']),
    stamp(14, 10, { E: '#120d12' }, ['E..E']),
    stamp(15, 12, { m: '#8a4a3a' }, ['mm']),
    stamp(15, 16, { G: '#e9c04a', g: '#a27e1c' }, ['GG', 'gg']),
    stamp(22, 21, { G: '#e9c04a', g: '#a27e1c' }, ['gGGg']),
    stamp(6, 22, { F: '#f2c9a0' }, ['FF']),
    stamp(10, 22, { a: '#181d3c' }, ['a...a...a...']),
  ],
);

const gotsumon = build(
  S,
  [
    ...both(capsule(12.5, 24, 12, 29.5, 2.8, ROCK)),
    ellipse(16, 19.5, 7.2, 6.6, ROCK),
    ...both(capsule(9, 16, 6, 23, 2.7, ROCK)),
    ellipse(16, 10, 6.8, 5.8, ROCK),
    ellipse(11, 6, 2.2, 2, ROCK),
    ellipse(21, 5.5, 2.4, 2, ROCK),
  ],
  [
    stamp(11, 8, { W: '#ffffff', E: '#1a1a22' }, ['WW....WW', 'WEE..EEW', '.EE..EE.']),
    stamp(14, 13, { M: '#3a3a44' }, ['MMMM']),
    stamp(18, 17, { c: '#52525c' }, ['c.', '.c', '.c', 'c.']),
    stamp(10, 21, { c: '#52525c' }, ['.c', 'c.']),
    stamp(17, 6, { c: '#84848f' }, ['cc']),
  ],
);

const gekomon = build(
  S,
  [
    capsule(16, 11, 16, 6, 1.1, FROG_Y, { r1: 1.8 }),
    ellipse(16, 5, 3, 1.6, FROG_Y),
    ...both(capsule(11, 25, 7.5, 29.5, 2.2, FROG)),
    ellipse(16, 19.5, 8.4, 7.6, FROG),
    ellipse(16, 22, 4.6, 4.2, FROG_Y),
    ...both(capsule(9, 18, 5.5, 23, 1.7, FROG)),
    ...both(ellipse(11, 11, 3.4, 3.2, FROG)),
    poly(
      [
        [9, 15.5],
        [23, 15.5],
        [21, 18],
        [11, 18],
      ],
      FROG_O,
    ),
  ],
  [
    ...bothStamp(stamp(9, 10, { W: '#ffffff', E: '#120d12' }, ['WWW', 'WEW'])),
    stamp(14, 4, { h: '#fff6b0', o: '#7d5f10' }, ['hh..', '.ooo']),
    stamp(15, 21, { g: '#b99a1e' }, ['gg', 'g.']),
    ...bothStamp(stamp(5, 29, { f: '#285626' }, ['f.f.f'])),
  ],
);

const kuwagamon = build(
  S,
  [
    ...both(
      poly(
        [
          [13.5, 9],
          [7, 1],
          [3.5, 1.5],
          [8, 7],
          [5, 9],
          [11.5, 12.5],
        ],
        PINCER,
      ),
    ),
    ...both(capsule(11, 19, 4.5, 23, 1.1, LEG_D)),
    ...both(capsule(11, 23, 5, 28.5, 1.1, LEG_D)),
    ...both(capsule(13, 26, 11, 30, 1.1, LEG_D)),
    ellipse(16, 19.5, 7.4, 8, BEETLE),
    ellipse(16, 10.2, 4.8, 3.6, BEETLE),
  ],
  [
    stamp(13, 9, { Y: '#ffe04a', E: '#120d12' }, ['YE..EY']),
    stamp(16, 14, { l: '#5a1614' }, ['l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l']),
    ...bothStamp(stamp(6, 5, { t: '#625c54' }, ['t.', '.t'])),
    stamp(12, 16, { h: '#ffb6a6' }, ['hh', 'h.']),
  ],
);

const pico_devimon = build(
  S,
  [
    ...both(
      poly(
        [
          [13, 19],
          [4, 12],
          [5, 16],
          [3, 19],
          [7, 20],
          [6, 24],
          [12, 23],
        ],
        PICO_W,
      ),
    ),
    ...both(
      poly(
        [
          [13, 15],
          [11, 9],
          [15, 14],
        ],
        PICO,
      ),
    ),
    ...both(capsule(14, 25, 13.5, 29.5, 1.4, PICO)),
    ellipse(16, 20.5, 5.4, 5.6, PICO),
  ],
  [
    stamp(13, 18, YEL_EYE, ['YY..YY', '.y..y.']),
    stamp(14, 22, { M: '#1a1222', T: '#ffffff' }, ['TMMT', '.TT.']),
  ],
);

export const ENEMY_A_ART: Record<string, PixelArt> = {
  goblimon,
  vilemon,
  allomon,
  gorillamon,
  harpymon,
  thunderbirdmon,
  icedevimon,
  musyamon,
  gotsumon,
  gekomon,
  kuwagamon,
  pico_devimon,
};
