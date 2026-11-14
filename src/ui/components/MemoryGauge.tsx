import { constants } from '../../data/index';

/** 메모리 게이지: 0 아래(당겨쓴 칸)는 빨간 칸으로 */
export function MemoryGauge({ memory, maxMemory }: { memory: number; maxMemory: number }) {
  const slots: ('full' | 'empty' | 'debt' | 'debtEmpty')[] = [];
  for (let i = 1; i <= Math.max(maxMemory, memory); i++) slots.push(i <= memory ? 'full' : 'empty');
  for (let i = 1; i <= constants.MAX_OVERDRAW; i++) {
    slots.unshift(-memory >= i ? 'debt' : 'debtEmpty');
  }
  const color = {
    full: 'bg-memory',
    empty: 'bg-slate-700',
    debt: 'bg-rose-500',
    debtEmpty: 'bg-slate-800 border border-dashed border-slate-600',
  } as const;
  return (
    <div className="flex items-center gap-2 px-4" data-testid="memory">
      <span className="w-14 text-xs text-slate-300">
        메모리 <b className={memory < 0 ? 'text-rose-400' : 'text-memory'}>{memory}</b>
      </span>
      <div className="flex flex-1 gap-1">
        {slots.map((s, i) => (
          <div key={i} className={`h-3 flex-1 rounded-sm ${color[s]}`} />
        ))}
      </div>
    </div>
  );
}
