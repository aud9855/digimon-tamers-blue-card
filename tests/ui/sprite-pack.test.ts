// 도트 팩 (04 P1): 파일 이름 → 디지몬 id 맞추기
import { describe, expect, it } from 'vitest';
import { getEnemies, getForms } from '../../src/data/index';
import { packableIds, packIdFromFileName } from '../../src/ui/spritePack';

describe('packIdFromFileName', () => {
  const ids = ['guilmon', 'pico_devimon', 'reaper_horn_striker'];

  it('id 이름 파일을 그 id로', () => {
    expect(packIdFromFileName('guilmon.png', ids)).toBe('guilmon');
    expect(packIdFromFileName('pico_devimon.gif', ids)).toBe('pico_devimon');
  });

  it('대소문자·밑줄·하이픈·공백·경로는 무시', () => {
    expect(packIdFromFileName('Guilmon.PNG', ids)).toBe('guilmon');
    expect(packIdFromFileName('pico-devimon.png', ids)).toBe('pico_devimon');
    expect(packIdFromFileName('Pico Devimon.png', ids)).toBe('pico_devimon');
    expect(packIdFromFileName('C:\\pack\\guilmon.png', ids)).toBe('guilmon');
    expect(packIdFromFileName('pack/reaper-horn-striker.webp', ids)).toBe('reaper_horn_striker');
  });

  it('맞는 id가 없으면 null', () => {
    expect(packIdFromFileName('agumon.png', ids)).toBeNull();
    expect(packIdFromFileName('guilmon2.png', ids)).toBeNull();
  });
});

describe('packableIds', () => {
  it('파트너 형태와 적을 모두 담고 겹치지 않음', () => {
    const all = packableIds();
    expect(all.length).toBe(getForms().length + getEnemies().length);
    expect(new Set(all).size).toBe(all.length);
  });
});
