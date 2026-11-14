// 설정 창 (04 T1-7): 연출 속도, 판 포기
import { useState } from 'react';
import type { PlaybackSpeed } from '../playback';
import { useGame } from '../store';

const SPEED_OPTIONS: { value: PlaybackSpeed; label: string }[] = [
  { value: 'normal', label: '보통' },
  { value: 'fast', label: '빠르게' },
  { value: 'off', label: '끄기' },
];

export function SettingsButton() {
  const open = useGame((s) => s.setSettingsOpen);
  return (
    <button
      type="button"
      data-testid="settings"
      aria-label="설정"
      onClick={() => open(true)}
      className="-my-3 min-h-11 min-w-11 rounded-lg text-lg text-slate-300 active:bg-slate-800"
    >
      ⚙
    </button>
  );
}

export function SettingsPanel() {
  const isOpen = useGame((s) => s.settingsOpen);
  const setOpen = useGame((s) => s.setSettingsOpen);
  const speed = useGame((s) => s.speed);
  const setSpeed = useGame((s) => s.setSpeed);
  const phase = useGame((s) => s.state.phase);
  const newGame = useGame((s) => s.newGame);
  const [confirmQuit, setConfirmQuit] = useState(false);
  if (!isOpen) return null;
  const inRun = phase !== 'title' && phase !== 'runWon' && phase !== 'runLost';

  const close = () => {
    setConfirmQuit(false);
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-6"
      data-testid="settings-panel"
    >
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-5">
        <h2 className="text-lg font-black">설정</h2>

        <p className="mt-4 mb-2 text-sm text-slate-400">전투 연출</p>
        <div className="grid grid-cols-3 gap-2">
          {SPEED_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              data-speed={o.value}
              onClick={() => setSpeed(o.value)}
              className={`min-h-11 rounded-lg text-sm font-bold ${
                speed === o.value ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {inRun && (
          <>
            <p className="mt-5 mb-2 text-sm text-slate-400">이번 판</p>
            <button
              type="button"
              data-testid="quit-run"
              onClick={() => {
                if (!confirmQuit) return setConfirmQuit(true);
                close();
                newGame();
              }}
              className="min-h-11 w-full rounded-lg bg-rose-900 text-sm font-bold text-rose-100 active:bg-rose-800"
            >
              {confirmQuit ? '정말 포기할까요? 한 번 더 누르면 처음으로' : '포기하고 처음으로'}
            </button>
          </>
        )}

        <p className="mt-5 text-xs text-slate-500">
          진행 상황은 행동할 때마다 이 기기에 저장됩니다.
        </p>

        <button
          type="button"
          onClick={close}
          className="mt-4 min-h-11 w-full rounded-lg bg-slate-700 font-bold active:bg-slate-600"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
