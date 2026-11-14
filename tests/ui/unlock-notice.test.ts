// 결과 화면의 해금 알림 (T3-9)
import { describe, expect, it } from 'vitest';
import { createProfile } from '../../src/core/index';
import { unlockNotice } from '../../src/ui/store';

describe('해금 알림', () => {
  it('새로 열린 테이머·시작 칩·해저드만 글로', () => {
    const before = createProfile();
    const after = structuredClone(before);
    after.unlocks.tamers.push('ai_mako');
    after.unlocks.startChips.push('memory_booster');
    after.unlocks.hazard = 1;
    expect(unlockNotice(before, after)).toEqual([
      '새 테이머: 다영 · 진',
      '새 시작 칩: 메모리 부스터',
      '디지털 해저드 1단계가 열렸습니다',
    ]);
    expect(unlockNotice(after, after)).toEqual([]);
  });
});
