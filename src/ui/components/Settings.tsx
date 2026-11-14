// 설정·하는 법·정보 창 (04 T1-7, T1-10)
import { useState, type ReactNode } from 'react';
import type { PlaybackSpeed } from '../playback';
import { useGame, type Panel } from '../store';
import { CodexContent } from './Codex';
import { GuideContent } from './Guide';
import { InfoContent } from './Info';

const SPEED_OPTIONS: { value: PlaybackSpeed; label: string }[] = [
  { value: 'normal', label: '보통' },
  { value: 'fast', label: '빠르게' },
  { value: 'off', label: '끄기' },
];

export function SettingsButton() {
  const setPanel = useGame((s) => s.setPanel);
  return (
    <button
      type="button"
      data-testid="settings"
      aria-label="설정"
      onClick={() => setPanel('settings')}
      className="-my-3 min-h-11 min-w-11 rounded-lg text-lg text-slate-300 active:bg-slate-800"
    >
      ⚙
    </button>
  );
}

function Modal({
  title,
  children,
  onClose,
  testId,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  testId: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-6"
      data-testid={testId}
    >
      <div className="flex max-h-full w-full max-w-sm flex-col rounded-2xl bg-slate-900">
        <h2 className="px-5 pt-5 text-lg font-black">{title}</h2>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-3">{children}</div>
        <div className="p-5 pt-3">
          <button
            type="button"
            data-testid="panel-close"
            onClick={onClose}
            className="min-h-11 w-full rounded-lg bg-slate-700 font-bold active:bg-slate-600"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsContent({ open }: { open: (panel: Panel) => void }) {
  const speed = useGame((s) => s.speed);
  const setSpeed = useGame((s) => s.setSpeed);
  const sound = useGame((s) => s.sound);
  const setSound = useGame((s) => s.setSound);
  const phase = useGame((s) => s.state.phase);
  const newGame = useGame((s) => s.newGame);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const inRun = phase !== 'title' && phase !== 'runWon' && phase !== 'runLost';

  return (
    <>
      <p className="mb-2 text-sm text-slate-400">전투 연출</p>
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

      <p className="mt-4 mb-2 text-sm text-slate-400">효과음</p>
      <div className="grid grid-cols-2 gap-2">
        {[true, false].map((on) => (
          <button
            key={String(on)}
            type="button"
            data-sound={on ? 'on' : 'off'}
            onClick={() => setSound(on)}
            className={`min-h-11 rounded-lg text-sm font-bold ${
              sound === on ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {on ? '켜기' : '끄기'}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          data-testid="open-guide"
          onClick={() => open('guide')}
          className="min-h-11 rounded-lg bg-slate-800 text-sm font-bold active:bg-slate-700"
        >
          하는 법
        </button>
        <button
          type="button"
          data-testid="open-info"
          onClick={() => open('info')}
          className="min-h-11 rounded-lg bg-slate-800 text-sm font-bold active:bg-slate-700"
        >
          정보·저작권
        </button>
      </div>

      {inRun && (
        <>
          <p className="mt-5 mb-2 text-sm text-slate-400">이번 판</p>
          <button
            type="button"
            data-testid="quit-run"
            onClick={() => {
              if (!confirmQuit) return setConfirmQuit(true);
              newGame();
            }}
            className="min-h-11 w-full rounded-lg bg-rose-900 text-sm font-bold text-rose-100 active:bg-rose-800"
          >
            {confirmQuit ? '정말 포기할까요? 한 번 더 누르면 처음으로' : '포기하고 처음으로'}
          </button>
        </>
      )}

      <p className="mt-5 text-xs text-slate-500">진행 상황은 행동할 때마다 이 기기에 저장됩니다.</p>
    </>
  );
}

const TITLES: Record<Panel, string> = {
  settings: '설정',
  guide: '하는 법',
  info: '정보',
  codex: '도감',
};

export function PanelHost() {
  const panel = useGame((s) => s.panel);
  const setPanel = useGame((s) => s.setPanel);
  if (!panel) return null;
  const close = () => setPanel(null);
  return (
    <Modal title={TITLES[panel]} onClose={close} testId={`${panel}-panel`}>
      {panel === 'settings' && <SettingsContent open={setPanel} />}
      {panel === 'guide' && <GuideContent />}
      {panel === 'info' && <InfoContent />}
      {panel === 'codex' && <CodexContent />}
    </Modal>
  );
}
