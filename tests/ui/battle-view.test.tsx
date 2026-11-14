import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getCard, getEnemy } from '../../src/data/index';
import { botBattleState } from '../../src/ui/debug';
import { BattleView } from '../../src/ui/screens/BattleScreen';

describe('전투 화면 (04 T1-2)', () => {
  it('봇이 만든 여러 전투 상태가 화면에 그대로 보인다', () => {
    let checked = 0;
    for (const seed of [1, 2, 3, 7, 10]) {
      for (const steps of [0, 5, 15, 30]) {
        const state = botBattleState(seed, steps);
        const battle = state.battle;
        if (!battle || !state.run) continue;

        const html = renderToStaticMarkup(<BattleView state={state} />).replaceAll('<!-- -->', '');

        for (const enemy of battle.enemies.filter((e) => e.alive)) {
          expect(html).toContain(getEnemy(enemy.defId).name);
          expect(html).toContain(`${enemy.hp}/${enemy.maxHp}`);
        }
        for (const card of battle.hand) expect(html).toContain(getCard(card.defId).name);
        expect(html).toContain(`턴 ${battle.turn}`);
        expect(html).toContain(`뽑을 ${battle.drawPile.length}`);
        expect(html).toContain(`버림 ${battle.discardPile.length}`);
        expect(html).toMatch(new RegExp(`메모리 <b[^>]*>${battle.memory}</b>`));
        expect(html).toContain(`${Math.max(0, state.run.hp)}/${state.run.maxHp}`);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(10);
  });
});
