// 전투 화면 (03 9.2 배치: 적·인텐트 → 파트너·진화 → 메모리 → 손패 → 턴 끝·더미)
import type { ReactNode } from 'react';
import type { GameState } from '../../core/index';
import { ActionList } from '../components/ActionList';
import { EnemyView } from '../components/EnemyView';
import { Hand } from '../components/Hand';
import { MemoryGauge } from '../components/MemoryGauge';
import { PartnerView } from '../components/PartnerView';
import { Screen } from '../components/Screen';
import { useGame } from '../store';

/** 상태를 받아 그리기만 함 (테스트에서 바로 씀) */
export function BattleView({ state, footer }: { state: GameState; footer?: ReactNode }) {
  const battle = state.battle;
  const run = state.run;
  if (!battle || !run) return null;

  return (
    <Screen>
      <div className="flex items-center justify-between px-4 pt-2 text-xs text-slate-400">
        <span>
          {run.act}막 ·{' '}
          {battle.kind === 'boss' ? '보스' : battle.kind === 'elite' ? '강적' : '전투'}
        </span>
        <span>턴 {battle.turn}</span>
      </div>

      {/* 적과 인텐트 */}
      <div className="flex justify-center gap-1 px-2 pt-2" data-testid="enemies">
        {battle.enemies.map((_, i) => (
          <EnemyView key={i} state={state} index={i} />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <PartnerView state={state} />
        <MemoryGauge memory={battle.memory} maxMemory={run.maxMemory} />
        <Hand state={state} cards={battle.hand} />
        <div className="flex items-center justify-between gap-2 px-4 pb-3 text-xs text-slate-400">
          <span data-testid="piles">
            뽑을 {battle.drawPile.length} · 버림 {battle.discardPile.length}
            {battle.exhaustPile.length > 0 ? ` · 소멸 ${battle.exhaustPile.length}` : ''}
          </span>
          {footer}
        </div>
      </div>
    </Screen>
  );
}

export function BattleScreen() {
  const state = useGame((s) => s.state);
  return (
    <BattleView
      state={state}
      footer={
        <details className="text-slate-300">
          <summary className="min-h-11 cursor-pointer leading-[44px]">행동 목록</summary>
          <div className="absolute right-4 bottom-16 left-4 z-10 max-h-[50vh] overflow-y-auto rounded-xl bg-slate-900 p-2 shadow-xl">
            <ActionList />
          </div>
        </details>
      }
    />
  );
}
