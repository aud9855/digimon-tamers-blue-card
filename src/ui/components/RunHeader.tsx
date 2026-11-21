// 런 정보 줄: HP, 비트, 덱 장수, 칩, 변이 (전투 밖 화면 위쪽)
import { useState } from 'react';
import { describeChip, describeMutation, describeTamer, type GameState } from '../../core/index';
import { getChip, getMutation, getTamer } from '../../data/index';
import { SettingsButton } from './Settings';
import { ChipIcon } from './Sprites';

export function RunHeader({ state }: { state: GameState }) {
  const run = state.run;
  const [open, setOpen] = useState(false);
  if (!run) return null;
  const chips = run.chips.filter((id) => !getChip(id).hidden);
  const mutation = run.mutation ? getMutation(run.mutation) : null;
  return (
    <div
      className="border-b border-sky-400/20 bg-slate-950/70 px-4 pt-3 pb-1 backdrop-blur-[2px]"
      data-testid="run-header"
    >
      <div className="flex items-center justify-between gap-2 text-sm">
        <button
          type="button"
          className="-my-2 min-h-11 font-bold"
          onClick={() => setOpen((v) => !v)}
        >
          {getTamer(run.tamerId).name}
        </button>
        <span className="text-rose-300">
          HP {Math.max(0, run.hp)}/{run.maxHp}
        </span>
        <span className="text-amber-300">{run.bits} 비트</span>
        <span className="text-slate-300">덱 {run.deck.length}</span>
        <span className="text-slate-400">{run.act}막</span>
        <SettingsButton />
      </div>
      {(chips.length > 0 || mutation) && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-1 flex min-h-11 w-full flex-wrap items-center gap-1 text-left text-xs text-sky-200"
        >
          {chips.map((id) => (
            <span key={id} className="flex items-center gap-1 rounded bg-sky-900/70 px-1.5 py-0.5">
              <ChipIcon chipId={id} />
              {getChip(id).name}
            </span>
          ))}
          {mutation && (
            <span
              data-testid="run-mutation"
              className="rounded bg-violet-900/70 px-1.5 py-0.5 text-violet-200"
            >
              변이: {mutation.name}
            </span>
          )}
        </button>
      )}
      {open && (
        <div className="ui-panel mt-1 p-2 text-xs text-slate-300">
          <p>
            <b className="text-sky-200">{getTamer(run.tamerId).trait}</b>{' '}
            {describeTamer(run.tamerId)}
          </p>
          {chips.map((id) => (
            <p key={id}>
              <b className="text-sky-200">{getChip(id).name}</b> {describeChip(id)}
            </p>
          ))}
          {mutation && (
            <p>
              <b className="text-violet-200">변이: {mutation.name}</b>{' '}
              <span className="text-emerald-300">{describeMutation(mutation.id).good}</span>
              {' / '}
              <span className="text-rose-300">{describeMutation(mutation.id).bad}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
