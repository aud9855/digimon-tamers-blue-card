// 일어난 일(GameEvent) → 띄울 도트 효과 (04 V1). 규칙을 다시 계산하지 않고 이벤트에 적힌 값만 봅니다.
import type { GameEvent, Who } from '../../core/index';
import { getFormById } from '../../data/index';
import type { FxKey } from './library';

/**
 * 손맛 등급 (game-feel 스킬의 등급표를 참고): 흔들림(trauma 0~1)과 타격 정지(초).
 * 화면 연출 값이라 규칙 수치가 아니며, 규칙(src/core)에는 영향이 없습니다.
 */
export const FEEL = {
  small: { trauma: 0.2, stop: 0 },
  medium: { trauma: 0.35, stop: 0.05 },
  large: { trauma: 0.8, stop: 0.12 },
} as const;
export type FeelTier = keyof typeof FEEL;

export interface VfxCue {
  fx: FxKey;
  /** 효과가 붙을 대상 */
  who: Who;
  /** 색 띠 (PAL 이름). 없으면 효과의 기본 색 */
  palette?: 'ice' | 'heal' | 'blood' | 'cyber' | 'gold';
  /** 손맛 등급 (FEEL): 화면 흔들림·타격 정지의 크기 */
  tier?: FeelTier;
  /** 좌우 뒤집기 (파트너 쪽에서 맞는 효과) */
  flip?: boolean;
}

export function vfxFor(event: GameEvent): VfxCue[] {
  switch (event.type) {
    case 'damage': {
      const lost = event.hpLost + event.tempHpLost;
      if (event.target === 'player') {
        if (lost > 0) return [{ fx: 'bluntHit', who: 'player', tier: 'medium', flip: true }];
        return event.blocked > 0 ? [{ fx: 'parry', who: 'player' }] : [];
      }
      if (lost > 0) {
        return event.attrMult > 1
          ? [{ fx: 'critHit', who: event.target, tier: 'large' }]
          : [{ fx: 'hitSpark', who: event.target, tier: 'small' }];
      }
      return event.blocked > 0 ? [{ fx: 'parry', who: event.target }] : [];
    }
    case 'hpLost':
      return event.amount > 0
        ? [{ fx: 'bluntHit', who: 'player', palette: 'blood', flip: true, tier: 'small' }]
        : [];
    case 'healed':
      return event.amount > 0 ? [{ fx: 'collectBurst', who: 'player', palette: 'heal' }] : [];
    case 'shieldGained':
      return event.amount > 0 ? [{ fx: 'collectBurst', who: event.target, palette: 'ice' }] : [];
    case 'enemyDied':
      return [{ fx: 'poof', who: event.enemyIndex }];
    case 'evolved': {
      if (getFormById(event.formId).rampage) {
        return [{ fx: 'darkExplosion', who: 'player', tier: 'large' }];
      }
      return [{ fx: 'holyPillar', who: 'player', palette: event.to === 'mega' ? 'gold' : 'cyber' }];
    }
    default:
      return [];
  }
}

/** 몸 움직임 종류: 맞음(번쩍+밀림), 덤빔(물러났다 튀어 나감) */
export type BodyMotion = 'hurt' | 'lunge';

export interface MotionCue {
  who: Who;
  motion: BodyMotion;
}

/** 일어난 일 → 도트 몸의 움직임 (효과가 스티커처럼 보이지 않게, 맞는 쪽과 때리는 쪽이 반응) */
export function motionFor(event: GameEvent): MotionCue[] {
  switch (event.type) {
    case 'damage': {
      if (event.hpLost + event.tempHpLost <= 0) return [];
      if (event.target === 'player') return [{ who: 'player', motion: 'hurt' }];
      return [
        { who: 'player', motion: 'lunge' },
        { who: event.target, motion: 'hurt' },
      ];
    }
    case 'hpLost':
      return event.amount > 0 ? [{ who: 'player', motion: 'hurt' }] : [];
    case 'enemyMoved':
      return [{ who: event.enemyIndex, motion: 'lunge' }];
    default:
      return [];
  }
}
