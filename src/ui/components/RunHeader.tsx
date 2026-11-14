// 런 정보 줄: HP, 비트, 덱 장수, 칩 (전투 밖 화면 위쪽)
import { useState } from 'react';
import { describeChip, type GameState } from '../../core/index';
import { getChip, getTamer } from '../../data/index';
import { SettingsButton } from './Settings';

export function RunHeader({ state }: { state: GameState }) {
  const run = state.run;
  const [open, setOpen] = useState(false);
  if (!run) return null;
  const chips = run.chips.filter((id) => !getChip(id).hidden);
  return (
    <div className="px-4 pt-3" data-testid="run-header">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-bold">{getTamer(run.tamerId).name}</span>
        <span className="text-rose-300">
          HP {Math.max(0, run.hp)}/{run.maxHp}
        </span>
        <span className="text-amber-300">{run.bits} 비트</span>
        <span className="text-slate-300">덱 {run.deck.length}</span>
        <span className="text-slate-400">{run.act}막</span>
        <SettingsButton />
      </div>
      {chips.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1 flex min-h-8 w-full flex-wrap items-center gap-1 text-left text-xs text-sky-200"
        >
          {chips.map((id) => (
            <span key={id} className="rounded bg-sky-900/70 px-1.5 py-0.5">
              {getChip(id).name}
            </span>
          ))}
        </button>
      )}
      {open && (
        <div className="mt-1 rounded-lg bg-slate-900 p-2 text-xs text-slate-300">
          {chips.map((id) => (
            <p key={id}>
              <b className="text-sky-200">{getChip(id).name}</b> {describeChip(id)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
