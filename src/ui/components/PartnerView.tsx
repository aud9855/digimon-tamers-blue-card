import { currentForm, isMatrix, previewEvolveCost, type GameState } from '../../core/index';
import { getTamer } from '../../data/index';
import { HpBar, StatusRow } from './Bars';
import { ATTRIBUTE_BG, STAGE_LABEL } from './labels';

/** 파트너(HP·실드·임시 HP·단계)와 디아크 진화 버튼, 폭주 버튼 */
export function PartnerView({
  state,
  onEvolve,
  onRampage,
}: {
  state: GameState;
  onEvolve?: () => void;
  /** 폭주 진화를 할 수 있을 때만 (02 13.2) */
  onRampage?: () => void;
}) {
  const run = state.run;
  const battle = state.battle;
  if (!run || !battle) return null;
  const form = currentForm(state);
  const cost = previewEvolveCost(state);
  const stageLabel = battle.rampage
    ? '폭주'
    : isMatrix(state)
      ? '궁극체 · 매트릭스'
      : STAGE_LABEL[battle.stage];
  return (
    <div className="flex items-center gap-3 px-4" data-testid="partner">
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl ${ATTRIBUTE_BG[form.attribute]} p-1 text-center text-xs font-bold text-white ${
          battle.rampage ? 'ring-4 ring-rose-500' : isMatrix(state) ? 'ring-4 ring-amber-300' : ''
        }`}
      >
        {form.name}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-bold">{getTamer(run.tamerId).name}</span>
          <span className={battle.rampage ? 'text-rose-400' : 'text-slate-400'}>{stageLabel}</span>
        </div>
        <HpBar hp={run.hp} maxHp={run.maxHp} shield={battle.shield} tempHp={battle.tempHp} />
        <StatusRow statuses={battle.statuses} />
      </div>
      {onRampage ? (
        <button
          type="button"
          data-testid="rampage"
          onClick={onRampage}
          className="flex h-14 w-14 shrink-0 animate-pulse flex-col items-center justify-center rounded-full bg-rose-700 text-xs font-bold"
        >
          <span>폭주</span>
          <span>◆0</span>
        </button>
      ) : (
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
      )}
    </div>
  );
}
