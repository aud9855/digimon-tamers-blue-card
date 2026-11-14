import { constants, getEvent, getTamers } from '../data/index';
import { canEvolve, evolve } from './battle/evolve';
import { canRampage, rampage } from './battle/rampage';
import { cardNeedsTarget, isCardPlayable, playCard } from './battle/cards';
import { chooseHandGroup, endTurn } from './battle/turn';
import { isUpgradable, livingEnemyIndexes } from './helpers';
import { chooseFormTrait, startNextAct } from './run/act';
import { reachableNodeIds } from './run/map';
import { returnToMap } from './phase';
import { restHeal, restUpgrade } from './run/rest';
import { pickCard, skipCards } from './run/reward';
import {
  canBuyCard,
  canBuyChip,
  canRemoveCard,
  shopBuyCard,
  shopBuyChip,
  shopRemoveCard,
} from './run/shop';
import { chooseNode, chooseStartChip, startRun } from './run/start';
import { eventChoose } from './run/event';
import type { Action, GameEvent, GameState } from './types';

/** 지금 할 수 없는 행동을 넣었을 때 던집니다 (03 5절 약속 3). */
export class IllegalActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IllegalActionError';
  }
}

/** 지금 할 수 있는 모든 행동 (03 5.2, 02 2절의 표) */
export function getLegalActions(state: GameState): Action[] {
  const run = state.run;
  switch (state.phase) {
    case 'title':
      return getTamers()
        .filter((t) => state.unlocks.tamers.includes(t.id))
        .map((t) => ({ type: 'startRun', tamerId: t.id }));

    case 'map':
      return reachableNodeIds(state).map((nodeId) => ({ type: 'chooseNode', nodeId }));

    case 'battle': {
      const battle = state.battle;
      if (!battle) return [];
      // 두 사람의 카드: 묶음을 고르기 전에는 고르기만 (02 13.3)
      if (battle.handChoice) {
        return battle.handChoice.map((_, index) => ({ type: 'chooseHandGroup', index }));
      }
      const actions: Action[] = [];
      for (const card of battle.hand) {
        if (!isCardPlayable(state, card)) continue;
        if (cardNeedsTarget(card)) {
          for (const targetIndex of livingEnemyIndexes(battle)) {
            actions.push({ type: 'playCard', cardUid: card.uid, targetIndex });
          }
        } else {
          actions.push({ type: 'playCard', cardUid: card.uid });
        }
      }
      if (canEvolve(state)) actions.push({ type: 'evolve' });
      if (canRampage(state)) actions.push({ type: 'rampage' });
      actions.push({ type: 'endTurn' });
      return actions;
    }

    case 'reward': {
      const offer = state.pending?.kind === 'reward' ? state.pending.offers[0] : undefined;
      const actions: Action[] = (offer?.cards ?? []).map((_, index) => ({
        type: 'pickCard',
        index,
      }));
      actions.push({ type: 'skipCards' });
      return actions;
    }

    case 'shop': {
      if (state.pending?.kind !== 'shop' || !run) return [];
      const actions: Action[] = [];
      state.pending.cards.forEach((_, index) => {
        if (canBuyCard(state, index)) actions.push({ type: 'shopBuyCard', index });
      });
      state.pending.chips.forEach((_, index) => {
        if (canBuyChip(state, index)) actions.push({ type: 'shopBuyChip', index });
      });
      if (canRemoveCard(state)) {
        for (const card of run.deck) actions.push({ type: 'shopRemoveCard', cardUid: card.uid });
      }
      actions.push({ type: 'proceed' });
      return actions;
    }

    case 'rest': {
      const actions: Action[] = [{ type: 'restHeal' }];
      for (const card of run?.deck ?? []) {
        if (isUpgradable(card)) actions.push({ type: 'restUpgrade', cardUid: card.uid });
      }
      return actions;
    }

    case 'event': {
      if (state.pending?.kind !== 'event') return [];
      return getEvent(state.pending.eventId).choices.map((_, index) => ({
        type: 'eventChoose',
        index,
      }));
    }

    case 'startChip':
      return state.pending?.kind === 'startChip'
        ? state.pending.chipIds.map((_, index) => ({ type: 'chooseStartChip', index }))
        : [];

    case 'actClear':
      // 형태 특성을 먼저 고르고, 그 뒤 다음 막으로 (02 12.5)
      if (state.pending?.kind === 'actClear' && state.pending.traitStage) {
        return constants.FORM_TRAITS.map((_, index) => ({ type: 'chooseFormTrait', index }));
      }
      return [{ type: 'proceed' }];

    case 'treasure':
      return [{ type: 'proceed' }];

    case 'runWon':
    case 'runLost':
      return [];
  }
}

/** 두 행동이 같은지 (값이 undefined인 필드는 없는 것으로 봄) */
function sameAction(a: Action, b: Action): boolean {
  const ra = a as unknown as Record<string, unknown>;
  const rb = b as unknown as Record<string, unknown>;
  const keys = new Set([...Object.keys(ra), ...Object.keys(rb)]);
  for (const key of keys) {
    if (ra[key] !== rb[key]) return false;
  }
  return true;
}

/** getLegalActions와 같은 판정을 씁니다 (03 5절 약속 4) */
export function isLegalAction(state: GameState, action: Action): boolean {
  return getLegalActions(state).some((legal) => sameAction(legal, action));
}

function dispatch(draft: GameState, events: GameEvent[], action: Action): void {
  switch (action.type) {
    case 'startRun':
      return startRun(draft, events, action.tamerId);
    case 'chooseNode':
      return chooseNode(draft, events, action.nodeId);
    case 'playCard':
      return playCard(draft, events, action.cardUid, action.targetIndex);
    case 'evolve':
      return evolve(draft, events);
    case 'rampage':
      return rampage(draft, events);
    case 'chooseHandGroup':
      return chooseHandGroup(draft, events, action.index);
    case 'endTurn':
      return endTurn(draft, events);
    case 'pickCard':
      return pickCard(draft, events, action.index);
    case 'skipCards':
      return skipCards(draft, events);
    case 'shopBuyCard':
      return shopBuyCard(draft, events, action.index);
    case 'shopBuyChip':
      return shopBuyChip(draft, events, action.index);
    case 'shopRemoveCard':
      return shopRemoveCard(draft, events, action.cardUid);
    case 'restHeal':
      return restHeal(draft, events);
    case 'restUpgrade':
      return restUpgrade(draft, events, action.cardUid);
    case 'eventChoose':
      return eventChoose(draft, events, action.index);
    case 'chooseStartChip':
      return chooseStartChip(draft, events, action.index);
    case 'chooseFormTrait':
      return chooseFormTrait(draft, events, action.index);
    case 'proceed':
      if (draft.phase === 'actClear') return startNextAct(draft, events);
      return returnToMap(draft, events);
  }
}

/** 받은 state는 고치지 않고 복사본을 고쳐 돌려줍니다 (03 5절 약속 1). */
export function applyAction(
  state: GameState,
  action: Action,
): { state: GameState; events: GameEvent[] } {
  if (!isLegalAction(state, action)) {
    throw new IllegalActionError(
      `'${state.phase}' 국면에서 할 수 없는 행동: ${JSON.stringify(action)}`,
    );
  }
  const draft = structuredClone(state);
  const events: GameEvent[] = [];
  dispatch(draft, events, action);
  return { state: draft, events };
}
