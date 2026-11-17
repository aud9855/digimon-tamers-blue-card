import { describe, expect, it } from 'vitest';
import { andParticle, describeCard } from '../../src/core/describe';

describe('설명 글의 말 다듬기 (03 5.3)', () => {
  it('와/과: 받침 있으면 과, 없으면 와. 숫자는 읽는 소리로', () => {
    expect(andParticle('실드 8')).toBe('과'); // 팔
    expect(andParticle('실드 12')).toBe('와'); // 이
    expect(andParticle('메모리 +2')).toBe('와');
    expect(andParticle('피해 6')).toBe('과'); // 육
    expect(andParticle('카드 1장 뽑기')).toBe('와');
    expect(andParticle('힘 +3')).toBe('과'); // 삼
    expect(andParticle('소멸')).toBe('과');
  });

  it("'아니면'이 없는 조건은 앞 효과에 '더'함 (02 9절 돌려차기)", () => {
    expect(describeCard('roundhouse', false)).toContain('냈으면 피해 6 더');
    expect(describeCard('fox_leaf', true)).toContain('냈으면 실드 6 더');
  });

  it("'아니면'이 있는 조건에는 '더'를 붙이지 않음", () => {
    const text = describeCard('rock_breaker', false);
    expect(text).toContain('아니면');
    expect(text).not.toContain('더');
  });
});
