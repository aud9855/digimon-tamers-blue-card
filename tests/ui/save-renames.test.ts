// 옛 저장의 id 바꾸기 (확장 1차 기반 작업)
import { describe, expect, it } from 'vitest';
import { isConsistentState } from '../../src/ui/save';
import { ID_RENAMES, renameSavedIds, type IdRenames } from '../../src/ui/saveRenames';
import { makeBattle } from '../helpers/battle';

const empty = (): IdRenames => ({ cards: {}, enemies: {}, chips: {}, events: {}, encounters: {} });

describe('저장 id 바꾸기', () => {
  it('옛 카드·적·칩 id를 새 id로 바꿔 이어 할 수 있게 함', () => {
    const now = makeBattle({ enemies: ['kuwagamon'], hand: ['strike'], chips: ['guard_chip'] });
    // 옛 저장: 같은 상태인데 id가 옛 이름
    const old = JSON.parse(
      JSON.stringify(now)
        .replaceAll('"defId":"strike"', '"defId":"old_strike"')
        .replaceAll('"defId":"kuwagamon"', '"defId":"old_kuwaga"')
        .replaceAll('"guard_chip"', '"old_guard"'),
    );
    expect(isConsistentState(old)).toBe(false);
    const renames = empty();
    renames.cards.old_strike = 'strike';
    renames.enemies.old_kuwaga = 'kuwagamon';
    renames.chips.old_guard = 'guard_chip';
    renameSavedIds(old, renames);
    expect(old).toEqual(JSON.parse(JSON.stringify(now)));
    expect(isConsistentState(old)).toBe(true);
  });

  it('적 목록 안의 defId는 카드 표가 아니라 적 표로 바꿈', () => {
    const state = { battle: { enemies: [{ defId: 'same' }], hand: [{ defId: 'same' }] } };
    const renames = empty();
    renames.cards.same = 'card_new';
    renames.enemies.same = 'enemy_new';
    renameSavedIds(state, renames);
    expect(state.battle.enemies[0]?.defId).toBe('enemy_new');
    expect(state.battle.hand[0]?.defId).toBe('card_new');
  });

  it('표의 새 id는 지금 데이터에 있어야 함', async () => {
    const { getCard, getEnemy, getChip, getEvent } = await import('../../src/data/index');
    for (const id of Object.values(ID_RENAMES.cards)) expect(() => getCard(id)).not.toThrow();
    for (const id of Object.values(ID_RENAMES.enemies)) expect(() => getEnemy(id)).not.toThrow();
    for (const id of Object.values(ID_RENAMES.chips)) expect(() => getChip(id)).not.toThrow();
    for (const id of Object.values(ID_RENAMES.events)) expect(() => getEvent(id)).not.toThrow();
  });
});
