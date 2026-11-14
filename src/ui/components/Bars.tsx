import type { Statuses } from '../../core/index';
import { STATUS_LABEL } from './labels';

/** HP 막대. 실드·임시 HP는 옆에 숫자로 */
export function HpBar({
  hp,
  maxHp,
  shield = 0,
  tempHp = 0,
}: {
  hp: number;
  maxHp: number;
  shield?: number;
  tempHp?: number;
}) {
  const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  return (
    <div className="w-full">
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-700">
        <div className="h-full bg-rose-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-1 text-xs leading-tight">
        <span>
          {Math.max(0, hp)}/{maxHp}
        </span>
        <span className="flex gap-1">
          {tempHp > 0 && <span className="text-temp-hp">+{tempHp}</span>}
          {shield > 0 && <span className="text-shield">🛡{shield}</span>}
        </span>
      </div>
    </div>
  );
}

/** 상태 효과 표시 (0인 것은 숨김). accel은 적만 */
export function StatusRow({ statuses, accel = 0 }: { statuses: Statuses; accel?: number }) {
  const items = (Object.keys(statuses) as (keyof Statuses)[])
    .filter((k) => statuses[k] !== 0)
    .map((k) => `${STATUS_LABEL[k]} ${statuses[k]}`);
  if (accel > 0) items.push(`가속 ${accel}`);
  if (items.length === 0) return <div className="h-4" />;
  return (
    <div className="flex h-4 flex-wrap justify-center gap-1 text-xs leading-4 text-amber-200">
      {items.map((t) => (
        <span key={t}>{t}</span>
      ))}
    </div>
  );
}
