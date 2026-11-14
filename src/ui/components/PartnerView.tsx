import { previewEvolveCost, type GameState } from '../../core/index';
import { getForm, getTamer } from '../../data/index';
import { HpBar, StatusRow } from './Bars';
import { ATTRIBUTE_BG, STAGE_LABEL } from './labels';

/** 파트너(HP·실드·임시 HP·단계)와 디아크 진화 버튼 */
export function PartnerView({ state, onEvolve }: { state: GameState; onEvolve?: () => void }) {
  const run = state.run;
  const battle = state.battle;
  if (!run || !battle) return null;
  const form = getForm(getTamer(run.tamerId).line, battle.stage);
  const cost = previewEvolveCost(state);
  return (
    <div className="flex items-center gap-3 px-4" data-testid="partner">
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${ATTRIBUTE_BG[form.attribute]} p-1 text-center text-xs font-bold text-white`}
      >
        {form.name}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-bold">{getTamer(run.tamerId).name}</span>
          <span className="text-slate-400">{STAGE_LABEL[battle.stage]}</span>
        </div>
        <HpBar hp={run.hp} maxHp={run.maxHp} shield={battle.shield} tempHp={battle.tempHp} />
        <StatusRow statuses={battle.statuses} />
      </div>
      <button
        type="button"
        data-testid="evolve"
        disabled={cost === null || !onEvolve}
        onClick={onEvolve}
        className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-sky-600 text-xs font-bold disabled:bg-slate-700 disabled:text-slate-500"
      >
        <span>진화</span>
        <span>{cost === null ? '—' : `◆${cost}`}</span>
      </button>
    </div>
  );
}
