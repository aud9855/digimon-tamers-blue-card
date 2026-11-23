// 옛 저장의 id 바꾸기 (확장 1차 기반 작업). 데이터의 카드·적·칩·이벤트·조우 id를 바꾸거나 합칠 때
// 여기에 "옛 id → 새 id"를 적으면, 옛 저장을 불러올 때 새 id로 바꿔 이어 할 수 있습니다.
// (적지 않으면 지금 데이터에 없는 id가 남아 그 저장은 이어 하지 못하고 처음부터 시작합니다.)
// 지운 것은 비슷한 것으로 바꿔 적습니다. 바꾼 줄은 지우지 않습니다 (더 옛 저장도 있으므로).

export interface IdRenames {
  cards: Record<string, string>;
  enemies: Record<string, string>;
  chips: Record<string, string>;
  events: Record<string, string>;
  encounters: Record<string, string>;
}

/** 지금까지 바꾼 id (아직 없음) */
export const ID_RENAMES: IdRenames = {
  cards: {},
  enemies: {},
  chips: {},
  events: {},
  encounters: {},
};

/**
 * 저장된 상태(JSON에서 읽은 값)의 id를 표대로 바꿈. 상태를 직접 고침.
 * 키 이름으로 종류를 압니다: defId(적 목록 안이면 적, 아니면 카드)·cardId → 카드, chipId·chipIds·chips → 칩,
 * startChips → 칩, eventId → 이벤트, encounterId → 조우.
 */
export function renameSavedIds(value: unknown, renames: IdRenames = ID_RENAMES): void {
  walk(value, false, renames);
}

function rename(table: Record<string, string>, id: unknown): unknown {
  return typeof id === 'string' && Object.hasOwn(table, id) ? table[id] : id;
}

function walk(value: unknown, inEnemies: boolean, r: IdRenames): void {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const item: unknown = value[i];
      if (typeof item === 'object' && item !== null) walk(item, inEnemies, r);
    }
    return;
  }
  if (typeof value !== 'object' || value === null) return;
  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    switch (key) {
      case 'defId':
        obj[key] = rename(inEnemies ? r.enemies : r.cards, v);
        break;
      case 'cardId':
        obj[key] = rename(r.cards, v);
        break;
      case 'chipId':
        obj[key] = rename(r.chips, v);
        break;
      case 'eventId':
        obj[key] = rename(r.events, v);
        break;
      case 'encounterId':
        obj[key] = rename(r.encounters, v);
        break;
      case 'chipIds':
      case 'chips':
      case 'startChips':
        // 칩 id 문자열 목록 (상점의 chips는 객체 목록이라 아래에서 chipId로 바뀜)
        if (Array.isArray(v)) {
          for (let i = 0; i < v.length; i++) {
            if (typeof v[i] === 'string') v[i] = rename(r.chips, v[i]);
          }
        }
        walk(v, false, r);
        break;
      default:
        walk(v, key === 'enemies', r);
    }
  }
}
