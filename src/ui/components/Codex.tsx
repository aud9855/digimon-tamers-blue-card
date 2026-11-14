// 도감 (02 13.5): 진화해 본 형태, 만난 적, 테이머별 기록. 프로필만 읽습니다.
import { getEnemies, getForms, getTamers } from '../../data/index';
import { useGame } from '../store';
import { ATTRIBUTE_BG, STAGE_LABEL } from './labels';

export function CodexContent() {
  const profile = useGame((s) => s.profile);
  const forms = new Set(profile.codex.forms);
  const enemies = new Set(profile.codex.enemies);
  const allForms = getForms();
  const allEnemies = getEnemies();
  return (
    <div className="text-sm" data-testid="codex">
      <p className="mb-2 text-slate-400">테이머 기록</p>
      <ul className="mb-4 space-y-1">
        {getTamers().map((t) => {
          const r = profile.runs[t.id];
          const open = profile.unlocks.tamers.includes(t.id);
          return (
            <li key={t.id} className="flex justify-between rounded bg-slate-800 px-3 py-2">
              <span className={open ? '' : 'text-slate-500'}>{open ? t.name : '???'}</span>
              <span className="text-slate-300">
                {r ? `${r.won}승 / ${r.played}판` : '기록 없음'}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mb-2 text-slate-400">
        형태 {allForms.filter((f) => forms.has(f.id)).length} / {allForms.length}
      </p>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {allForms.map((f) => {
          const seen = forms.has(f.id);
          return (
            <div
              key={f.id}
              data-codex-form={f.id}
              className={`flex min-h-14 flex-col items-center justify-center rounded-lg p-1 text-center text-xs ${
                seen ? `${ATTRIBUTE_BG[f.attribute]} text-white` : 'bg-slate-800 text-slate-500'
              }`}
            >
              <b>{seen ? f.name : '???'}</b>
              <span className="opacity-80">{f.rampage ? '폭주' : STAGE_LABEL[f.stage]}</span>
            </div>
          );
        })}
      </div>

      <p className="mb-2 text-slate-400">
        만난 적 {allEnemies.filter((e) => enemies.has(e.id)).length} / {allEnemies.length}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {allEnemies.map((e) => {
          const seen = enemies.has(e.id);
          return (
            <div
              key={e.id}
              className={`rounded-lg p-2 text-center text-xs ${
                seen ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {seen ? e.name : '???'}
            </div>
          );
        })}
      </div>
      <p className="mt-4 mb-1 text-xs text-slate-500">
        시작 칩 {profile.unlocks.startChips.length}개 열림 · 디지털 해저드 {profile.unlocks.hazard}
        단계까지 열림
      </p>
    </div>
  );
}
