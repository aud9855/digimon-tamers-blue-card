// 막 클리어 (02 7.6, 2단계부터 실제로 쓰임)
import { PrimaryButton } from '../components/common';
import { RunHeader } from '../components/RunHeader';
import { Screen } from '../components/Screen';
import { STAGE_LABEL } from '../components/labels';
import { useDisplayState, useGame } from '../store';

export function ActClearScreen() {
  const state = useDisplayState();
  const dispatch = useGame((s) => s.dispatch);
  const run = state.run;
  if (!run) return null;
  return (
    <Screen>
      <RunHeader state={state} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-black">{run.act}막 클리어!</h1>
        <p className="text-sm text-slate-300">
          HP를 회복했고, {STAGE_LABEL[run.maxStage]}까지 진화할 수 있으며, 최대 메모리가{' '}
          {run.maxMemory}이(가) 되었습니다.
        </p>
        <div className="w-full max-w-xs">
          <PrimaryButton testId="proceed" onClick={() => dispatch({ type: 'proceed' })}>
            다음 막으로
          </PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}
