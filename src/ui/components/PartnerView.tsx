import { currentForm, isMatrix, previewEvolveCost, type GameState } from '../../core/index';
import { getTamer } from '../../data/index';
import { HpBar, StatusRow } from './Bars';
import { BattleSprite, FormSprite, TamerFace } from './Sprites';
import { ATTRIBUTE_RING, STAGE_LABEL } from './labels';

/** 파트너(HP·실드·임시 HP·단계)와 디아크 진화 버튼, 폭주 버튼.
 *  전투 무대 왼쪽 아래에 크게 서고, 정보는 오른쪽 반투명 판에 (04 B1 배치 B) */
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
  const stageLabel = `${form.name} · ${
    battle.rampage ? '폭주' : isMatrix(state) ? '매트릭스' : STAGE_LABEL[battle.stage]
  }`;
  return (
    <div className="flex items-end gap-2 px-2" data-testid="partner">
      <div
        className={`flex h-28 w-28 shrink-0 items-end justify-center ${
          battle.rampage
            ? '[filter:drop-shadow(0_0_6px_#f43f5e)]'
            : isMatrix(state)
              ? '[filter:drop-shadow(0_0_6px_#fcd34d)]'
              : ''
        }`}
        data-form={form.id}
      >
        <BattleSprite className="h-full w-full">
          <FormSprite formId={form.id} className="h-full w-full" scaled />
        </BattleSprite>
      </div>
      <div
        className={`mb-1 min-w-0 flex-1 rounded-lg bg-slate-950/70 px-2 py-1 ring-1 ${ATTRIBUTE_RING[form.attribute]}`}
      >
        <div className="flex min-w-0 items-center gap-1 text-xs">
          <span title={getTamer(run.tamerId).name} className="shrink-0">
            <TamerFace tamerId={run.tamerId} className="h-4 w-4" />
          </span>
          <span
            className={`min-w-0 truncate font-bold ${battle.rampage ? 'text-rose-400' : 'text-slate-100'}`}
          >
            {stageLabel}
          </span>
        </div>
        <HpBar hp={run.hp} maxHp={run.maxHp} shield={battle.shield} tempHp={battle.tempHp} />
        <StatusRow statuses={battle.statuses} />
      </div>
      {onRampage ? (
        <button
          type="button"
          data-testid="rampage"
          onClick={onRampage}
          className="mb-1 flex h-14 w-14 shrink-0 flex-col motion-safe:animate-pulse items-center justify-center rounded-full bg-rose-700 text-xs font-bold"
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
          className="mb-1 flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-sky-600 shadow-[0_2px_0_#053c66] text-xs font-bold disabled:bg-slate-700 disabled:text-slate-500"
        >
          <span>진화</span>
          <span>{cost === null ? '—' : `◆${cost}`}</span>
        </button>
      )}
    </div>
  );
}
