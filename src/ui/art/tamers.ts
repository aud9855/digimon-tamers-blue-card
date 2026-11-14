// 테이머 얼굴 도트 (04 7절, 16×16). 직접 그린 것입니다.
// 원작 캐릭터 디자인을 옮기지 않고, 머리색과 소품 하나씩만 정해 구별합니다.
import { ART_SIZE, fit, type PixelArt } from './types';

const S = ART_SIZE.face;
const SKIN = { F: '#f2cfa8', f: '#d9a87c', M: '#b5503c' };

// 오유민: 갈색 머리, 이마의 고글
const takato = fit(
  S,
  { ...SKIN, H: '#7a4a2a', h: '#563220', G: '#f2c83c', g: '#5ab8ff', B: '#3e6fb8' },
  [
    '....KKKKKKK.....',
    '...KHHHHHHHKK...',
    '..KHHHHHHHHHHK..',
    '..KGGGgGGgGGGK..',
    '..KGGgggGgggGK..',
    '..KHFFFFFFFFHK..',
    '..KHFEFFFFEFHK..',
    '..KFFEFFFFEFFK..',
    '...KFFFffFFFK...',
    '...KFFFMMFFFK...',
    '....KFFFFFFK....',
    '...KBKKFFKKBK...',
    '..KBBBBKKBBBBK..',
    '.KBBBBBBBBBBBBK.',
  ],
);

// 은세나: 주황빛 머리를 묶음, 하트 머리끈
const rika = fit(
  S,
  { ...SKIN, H: '#d9732e', h: '#a14f1c', R: '#e04a6a', W: '#f8f8f2', D: '#3a3a4a' },
  [
    '.....KKKKKKKK.',
    '....KHHHHHHHHK',
    '...KHHHHHHHHRK',
    '..KHHHHHHHHHKK',
    '..KHHFFFFFHHK.',
    '..KHFEFFFEFHK.',
    '..KHFEFFFEFHHK',
    '..KFFFFFFFFFHK',
    '...KFFFffFFKHK',
    '...KFFFMMFFKHK',
    '....KFFFFFK.K.',
    '...KDKKFFKKDK.',
    '..KDDDDKKDDDDK',
    '.KDDDDDDDDDDDDK',
  ],
);

// 곽소룡: 짙은 남색 머리, 주황 조끼
const henry = fit(S, { ...SKIN, H: '#2d3a6a', h: '#1d2648', O: '#e8873a', W: '#f8f8f2' }, [
  '....KKKKKKK.....',
  '...KHHHHHHHKK...',
  '..KHHHHHHHHHHK..',
  '..KHHHhHHhHHHK..',
  '..KHHFFHHFFHHK..',
  '..KHFFFFFFFFHK..',
  '..KHFEFFFFEFHK..',
  '..KFFEFFFFEFFK..',
  '...KFFFffFFFK...',
  '...KFFFMMFFFK...',
  '....KFFFFFFK....',
  '...KOKKFFKKOK...',
  '..KOOOOKWWOOOK..',
  '.KOOOOOKWWOOOOK.',
]);

// 다영·진: 두 사람 (양갈래 머리 누나, 짧은 머리 동생)
const ai_mako = fit(S, { ...SKIN, A: '#e07a9a', P: '#5a8ad8', J: '#4a3a2a', Y: '#f2c83c' }, [
  '.KK.......KKKK..',
  'KAAK.KK..KJJJJK.',
  'KAAKKAAKKJJJJJJK',
  '.KAAAAAAKJJJJJJK',
  '.KAFFFFAKJFFFFJK',
  '.KAEFFEAKJEFFEJK',
  '.KFFFFFFKKFFFFK.',
  '..KFMMFK.KFMMFK.',
  '...KFFK...KFFK..',
  '..KAKKAK.KPKKPK.',
  '.KAAAAAAKPPPPPPK',
  '.KAAYYAAKPPPPPPK',
]);

export const TAMER_ART_LIST: Record<string, PixelArt> = { takato, rika, henry, ai_mako };
