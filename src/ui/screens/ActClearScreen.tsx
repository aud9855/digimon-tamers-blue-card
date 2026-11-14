// 막 클리어 (02 7.6), 형태 특성 고르기 (02 12.5)
import type { FormTraitId } from '../../core/index';
import { constants, getForm, getTamer } from '../../data/index';
import { PrimaryButton } from '../components/common';
import { RunHeader } from '../components/RunHeader';
import { Screen } from '../components/Screen';
import { STAGE_LABEL } from '../components/labels';
import { useDisplayState, useGame } from '../store';

const TRAIT_TEXT: Record<FormTraitId, { name: string; text: string }> = {
  tough: { name: '단단한 몸', text: `진화할 때 얻는 임시 HP +${constants.FORM_TRAIT_TEMP_HP}` },
  sharp: { name: '날카로운 이빨', text: `공격력 +${constants.FORM_TRAIT_POWER}` },
};

export function ActClearScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  const run = state.run;
  const pending = state.pending?.kind === 'actClear' ? state.pending : null;
  if (!run || !pending) return null;
  const traitStage = pending.traitStage;
  const form = traitStage ? getForm(getTamer(run.tamerId).line, traitStage) : null;

  return (
    <Screen>
      <RunHeader state={state} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-black">{run.act}막 클리어!</h1>
        <p className="text-sm text-slate-300">
          HP를 회복했고, {STAGE_LABEL[run.maxStage]}까지 진화할 수 있으며, 최대 메모리가{' '}
          {run.maxMemory}이(가) 되었습니다.
        </p>
        {form ? (
          <div className="w-full max-w-xs" data-testid="form-traits">
            <p className="mb-3 text-sm text-sky-200">
              {form.name}({STAGE_LABEL[form.stage]})의 특성을 고르세요
            </p>
            <div className="flex flex-col gap-3">
              {constants.FORM_TRAITS.map((id, index) => (
                <button
                  key={id}
                  type="button"
                  data-trait={index}
                  onClick={() => dispatch({ type: 'chooseFormTrait', index })}
                  className="min-h-14 rounded-xl bg-indigo-700 px-4 py-2 text-left active:bg-indigo-600"
                >
                  <b>{TRAIT_TEXT[id].name}</b>
                  <span className="block text-sm text-indigo-200">{TRAIT_TEXT[id].text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-xs">
            <PrimaryButton testId="proceed" onClick={() => dispatch({ type: 'proceed' })}>
              다음 막으로
            </PrimaryButton>
          </div>
        )}
      </div>
    </Screen>
  );
}
