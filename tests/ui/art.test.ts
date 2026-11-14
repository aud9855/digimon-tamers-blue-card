// 도트 그림 검사 (04 7절): 규격, 팔레트, 빠진 그림
import { describe, expect, it } from 'vitest';
import { getChips, getEnemies, getForms, getTamers } from '../../src/data/index';
import { CHIP_ART, ENEMY_ART, FORM_ART, NODE_ART, TAMER_ART } from '../../src/ui/art/index';
import { ART_SIZE, type PixelArt } from '../../src/ui/art/types';
import { pixelRuns } from '../../src/ui/components/PixelArtView';

function checkArt(name: string, art: PixelArt, size: number) {
  expect(art.rows, `${name} 줄 수`).toHaveLength(size);
  art.rows.forEach((row, y) => {
    expect(row.length, `${name} ${y}번째 줄 길이`).toBe(size);
    for (const ch of row) {
      if (ch === '.') continue;
      expect(art.palette[ch], `${name}의 색 '${ch}'`).toBeDefined();
    }
  });
  // 비어 있지 않음
  expect(pixelRuns(art).length, `${name} 빈 그림`).toBeGreaterThan(0);
}

describe('도트 그림 규격 (04 7절)', () => {
  it('디지몬 24×24, 얼굴 16×16, 아이콘 12×12, 쓰는 글자는 모두 팔레트에', () => {
    for (const [id, a] of Object.entries(FORM_ART)) checkArt(`형태 ${id}`, a, ART_SIZE.creature);
    for (const [id, a] of Object.entries(ENEMY_ART)) checkArt(`적 ${id}`, a, ART_SIZE.creature);
    for (const [id, a] of Object.entries(TAMER_ART)) checkArt(`테이머 ${id}`, a, ART_SIZE.face);
    for (const [id, a] of Object.entries(CHIP_ART)) checkArt(`칩 ${id}`, a, ART_SIZE.icon);
    for (const [id, a] of Object.entries(NODE_ART)) {
      checkArt(`칸 ${id}`, a, ART_SIZE.icon);
    }
  });

  it('같은 색이 이어지면 사각형 하나로 묶음', () => {
    const runs = pixelRuns({ palette: { A: '#f00', B: '#00f' }, rows: ['AAB.', '.BBB'] });
    expect(runs).toEqual([
      { x: 0, y: 0, w: 2, color: '#f00' },
      { x: 2, y: 0, w: 1, color: '#00f' },
      { x: 1, y: 1, w: 3, color: '#00f' },
    ]);
  });
});

describe('빠진 그림 없음', () => {
  it('파트너 형태마다 도트 (G2)', () => {
    for (const f of getForms()) expect(FORM_ART[f.id], f.id).toBeDefined();
  });

  it('적·보스마다 도트 (G3)', () => {
    for (const e of getEnemies()) expect(ENEMY_ART[e.id], e.id).toBeDefined();
  });

  it('테이머마다 얼굴 (G4)', () => {
    for (const t of getTamers()) expect(TAMER_ART[t.id], t.id).toBeDefined();
  });

  it('보이는 칩마다 아이콘, 지도 칸 7종 아이콘 (G5)', () => {
    for (const c of getChips().filter((c) => !c.hidden)) expect(CHIP_ART[c.id], c.id).toBeDefined();
    expect(Object.keys(NODE_ART).sort()).toEqual([
      'battle',
      'boss',
      'elite',
      'event',
      'rest',
      'shop',
      'treasure',
    ]);
  });
});
