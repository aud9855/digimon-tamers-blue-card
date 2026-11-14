// 지금 할 수 있는 행동을 버튼으로 늘어놓음. 화면을 만들기 전 임시 조작과 디버그용.
import { getLegalActions, type Action, type GameState } from '../../core/index';
import { getCard, getChip, getEnemy } from '../../data/index';
import { useGame } from '../store';

function cardName(state: GameState, uid: number): string {
  const card =
    state.battle?.hand.find((c) => c.uid === uid) ?? state.run?.deck.find((c) => c.uid === uid);
  if (!card) return `#${uid}`;
  return `${getCard(card.defId).name}${card.upgraded ? '+' : ''}`;
}

export function actionLabel(state: GameState, action: Action): string {
  switch (action.type) {
    case 'startRun':
      return `시작: ${action.tamerId}`;
    case 'chooseNode': {
      const node = state.run?.map.nodes.find((n) => n.id === action.nodeId);
      return `칸: ${node ? `${node.row}행 ${node.type}` : action.nodeId}`;
    }
    case 'playCard': {
      const target =
        action.targetIndex === undefined
          ? ''
          : ` → ${getEnemy(state.battle?.enemies[action.targetIndex]?.defId ?? '').name}`;
      return `내기: ${cardName(state, action.cardUid)}${target}`;
    }
    case 'evolve':
      return '진화';
    case 'endTurn':
      return '턴 끝';
    case 'pickCard': {
      const offer = state.pending?.kind === 'reward' ? state.pending.offers[0] : undefined;
      const c = offer?.cards[action.index];
      return `고르기: ${c ? `${getCard(c.defId).name}${c.upgraded ? '+' : ''}` : action.index}`;
    }
    case 'skipCards':
      return '건너뛰기';
    case 'shopBuyCard': {
      const item = state.pending?.kind === 'shop' ? state.pending.cards[action.index] : undefined;
      return `카드 사기: ${item ? `${getCard(item.defId).name} (${item.price})` : action.index}`;
    }
    case 'shopBuyChip': {
      const item = state.pending?.kind === 'shop' ? state.pending.chips[action.index] : undefined;
      return `칩 사기: ${item ? `${getChip(item.chipId).name} (${item.price})` : action.index}`;
    }
    case 'shopRemoveCard':
      return `지우기: ${cardName(state, action.cardUid)}`;
    case 'restHeal':
      return '회복';
    case 'restUpgrade':
      return `강화: ${cardName(state, action.cardUid)}`;
    case 'eventChoose':
      return `선택지 ${action.index + 1}`;
    case 'proceed':
      return '계속';
  }
}

export function ActionList() {
  const state = useGame((s) => s.state);
  const dispatch = useGame((s) => s.dispatch);
  const actions = getLegalActions(state);
  return (
    <div className="flex flex-col gap-2">
      {actions.map((action) => (
        <button
          key={JSON.stringify(action)}
          type="button"
          className="min-h-11 rounded-lg bg-slate-800 px-3 text-left text-sm active:bg-slate-700"
          onClick={() => dispatch(action)}
        >
          {actionLabel(state, action)}
        </button>
      ))}
    </div>
  );
}
