// 원작 도트 (04 7절): 파일 이름이 모두 게임 id이고, 출처 목록과 맞는지
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { OFFICIAL_SPRITE } from '../../src/ui/art/official';
import { packableIds } from '../../src/ui/spritePack';

describe('원작 도트', () => {
  const ids = Object.keys(OFFICIAL_SPRITE);

  it('파일 이름이 모두 파트너 형태·적 id', () => {
    const known = new Set(packableIds());
    for (const id of ids) expect(known.has(id), id).toBe(true);
    expect(ids.length).toBeGreaterThanOrEqual(36);
  });

  it('그림마다 SOURCES.md에 출처가 있음', () => {
    const sources = readFileSync('src/ui/art/official/SOURCES.md', 'utf8');
    for (const id of ids) expect(sources, id).toContain(`| \`${id}\` |`);
  });
});
