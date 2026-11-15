// 일어난 일(GameEvent) → 띄울 도트 효과 (04 V1). 규칙을 다시 계산하지 않고 이벤트에 적힌 값만 봅니다.
import type { GameEvent, Who } from '../../core/index';
import { getFormById } from '../../data/index';
import type { FxKey } from './library';

export interface VfxCue {
  fx: FxKey;
  /** 효과가 붙을 대상 */
  who: Who;
  /** 색 띠 (PAL 이름). 없으면 효과의 기본 색 */
  palette?: 'ice' | 'heal' | 'blood' | 'cyber' | 'gold';
  /** 화면을 흔드는지 */
  shake?: boolean;
  /** 좌우 뒤집기 (파트너 쪽에서 맞는 효과) */
  flip?: boolean;
}

export function vfxFor(event: GameEvent): VfxCue[] {
  switch (event.type) {
    case 'damage': {
      const lost = event.hpLost + event.tempHpLost;
      if (event.target === 'player') {
        if (lost > 0) return [{ fx: 'bluntHit', who: 'player', shake: true, flip: true }];
        return event.blocked > 0 ? [{ fx: 'parry', who: 'player' }] : [];
      }
      if (lost > 0) {
        return event.attrMult > 1
          ? [{ fx: 'critHit', who: event.target, shake: true }]
          : [{ fx: 'hitSpark', who: event.target }];
      }
      return event.blocked > 0 ? [{ fx: 'parry', who: event.target }] : [];
    }
    case 'hpLost':
      return event.amount > 0
        ? [{ fx: 'bluntHit', who: 'player', palette: 'blood', flip: true }]
        : [];
    case 'healed':
      return event.amount > 0 ? [{ fx: 'collectBurst', who: 'player', palette: 'heal' }] : [];
    case 'shieldGained':
      return event.amount > 0 ? [{ fx: 'collectBurst', who: event.target, palette: 'ice' }] : [];
    case 'enemyDied':
      return [{ fx: 'poof', who: event.enemyIndex }];
    case 'evolved': {
      if (getFormById(event.formId).rampage) {
        return [{ fx: 'darkExplosion', who: 'player', shake: true }];
      }
      return [{ fx: 'holyPillar', who: 'player', palette: event.to === 'mega' ? 'gold' : 'cyber' }];
    }
    default:
      return [];
  }
}
