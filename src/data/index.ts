// 데이터를 찾는 길은 이 파일 하나입니다 (03 6절). core는 다른 data 파일을 직접 import하지 않습니다.
import type {
  CardDef,
  ChipDef,
  EncounterDef,
  EnemyDef,
  EventDef,
  FormDef,
  Stage,
  TamerDef,
  TamerId,
} from '../core/types';
import { acts, type ActDef } from './acts';
import { cards } from './cards';
import { henryCards } from './cards-henry';
import { rikaCards } from './cards-rika';
import { chips } from './chips';
import { constants, type Constants } from './constants';
import { encounters } from './encounters';
import { enemies } from './enemies';
import { events } from './events';
import { forms } from './forms';
import { tamers } from './tamers';

export { constants };
export type { Constants };

interface Registry {
  cards: CardDef[];
  forms: FormDef[];
  enemies: EnemyDef[];
  encounters: EncounterDef[];
  chips: ChipDef[];
  events: EventDef[];
  tamers: TamerDef[];
}

const registry: Registry = {
  cards: [...cards, ...rikaCards, ...henryCards],
  forms: [...forms],
  enemies: [...enemies],
  encounters: [...encounters],
  chips: [...chips],
  events: [...events],
  tamers: [...tamers],
};

// 자주 찾는 것은 id로 바로 찾도록 색인을 둡니다. registry가 바뀌면 다시 만듭니다.
let cardIndex = new Map<string, CardDef>();
let enemyIndex = new Map<string, EnemyDef>();
let encounterIndex = new Map<string, EncounterDef>();
let chipIndex = new Map<string, ChipDef>();
let eventIndex = new Map<string, EventDef>();
let tamerIndex = new Map<string, TamerDef>();

function byId<T extends { id: string }>(list: readonly T[]): Map<string, T> {
  return new Map(list.map((item) => [item.id, item]));
}

function rebuildIndexes(): void {
  cardIndex = byId(registry.cards);
  enemyIndex = byId(registry.enemies);
  encounterIndex = byId(registry.encounters);
  chipIndex = byId(registry.chips);
  eventIndex = byId(registry.events);
  tamerIndex = byId(registry.tamers);
}
rebuildIndexes();

function must<T>(value: T | undefined, kind: string, id: string): T {
  if (value === undefined) throw new Error(`없는 ${kind} id: ${id}`);
  return value;
}

export function getCard(id: string): CardDef {
  return must(cardIndex.get(id), '카드', id);
}
export function getCards(): readonly CardDef[] {
  return registry.cards;
}

/** 계열(line)과 단계로 형태를 찾습니다. */
export function getForm(line: string, stage: Stage): FormDef {
  return must(
    registry.forms.find((f) => f.line === line && f.stage === stage),
    '형태',
    `${line}/${stage}`,
  );
}
export function getForms(): readonly FormDef[] {
  return registry.forms;
}

export function getEnemy(id: string): EnemyDef {
  return must(enemyIndex.get(id), '적', id);
}
export function getEnemies(): readonly EnemyDef[] {
  return registry.enemies;
}

export function getEncounter(id: string): EncounterDef {
  return must(encounterIndex.get(id), '조우', id);
}
export function getEncounters(act: number, tier: EncounterDef['tier']): EncounterDef[] {
  return registry.encounters.filter((e) => e.act === act && e.tier === tier);
}
export function getAllEncounters(): readonly EncounterDef[] {
  return registry.encounters;
}

export function getChip(id: string): ChipDef {
  return must(chipIndex.get(id), '칩', id);
}
export function getChips(): readonly ChipDef[] {
  return registry.chips;
}

export function getEvent(id: string): EventDef {
  return must(eventIndex.get(id), '이벤트', id);
}
export function getEvents(): readonly EventDef[] {
  return registry.events;
}

export function getTamer(id: TamerId): TamerDef {
  return must(tamerIndex.get(id), '테이머', id);
}
export function getTamers(): readonly TamerDef[] {
  return registry.tamers;
}

/** 막 이름과 시작 글 (화면용) */
export function getAct(act: number): ActDef {
  return must(
    acts.find((a) => a.act === act),
    '막',
    String(act),
  );
}
export type { ActDef };

export interface RegistryOverride {
  cards?: CardDef[];
  forms?: FormDef[];
  enemies?: EnemyDef[];
  encounters?: EncounterDef[];
  chips?: ChipDef[];
  events?: EventDef[];
  tamers?: TamerDef[];
  constants?: Partial<Constants>;
}

function mergeById<T extends { id: string }>(base: T[], extra: T[] | undefined): T[] {
  if (!extra) return base;
  const result = base.slice();
  for (const item of extra) {
    const i = result.findIndex((x) => x.id === item.id);
    if (i >= 0) result[i] = item;
    else result.push(item);
  }
  return result;
}

/**
 * 테스트 전용 (03 8.1). 정의를 덧붙이거나(같은 id면 바꿈) 상수를 바꾸고,
 * 되돌리는 함수를 돌려줍니다. tests/ 밖에서는 부르지 않습니다.
 */
export function overrideRegistry(partial: RegistryOverride): () => void {
  const savedRegistry: Registry = { ...registry };
  const savedConstants = { ...constants };

  registry.cards = mergeById(registry.cards, partial.cards);
  registry.forms = mergeById(registry.forms, partial.forms);
  registry.enemies = mergeById(registry.enemies, partial.enemies);
  registry.encounters = mergeById(registry.encounters, partial.encounters);
  registry.chips = mergeById(registry.chips, partial.chips);
  registry.events = mergeById(registry.events, partial.events);
  registry.tamers = mergeById(registry.tamers, partial.tamers);
  // constants는 밖에서 같은 객체를 들고 있으므로 자리에서 고칩니다.
  if (partial.constants) Object.assign(constants, partial.constants);
  rebuildIndexes();

  return () => {
    Object.assign(registry, savedRegistry);
    Object.assign(constants, savedConstants);
    rebuildIndexes();
  };
}
