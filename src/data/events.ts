// 이벤트 (02 9.6). 글은 게임용으로 새로 쓴 것입니다.
import type { EventDef } from '../core/types';

export const events = [
  {
    id: 'calumon_play',
    title: '길 잃은 동글몬',
    text: '골목 끝에서 하얀 디지몬이 귀를 펄럭이며 놀아 달라고 조른다. 함께 있으면 마음이 조금 가벼워질 것 같다. 어디론가 데려가고 싶어 하는 눈치이기도 하다.',
    choices: [
      { label: '같이 논다', effects: [{ op: 'heal', amount: 10 }] },
      { label: '따라가 본다', effects: [{ op: 'addRandomCard', rarity: 'common' }] },
    ],
  },
  {
    id: 'card_pile',
    title: '버려진 카드 더미',
    text: '공터 구석에 카드가 수북이 쌓여 있다. 쓸 만한 것이 섞여 있을지도 모르지만, 손을 넣으면 날카로운 데이터 조각에 베일 것 같다.',
    choices: [
      {
        label: '뒤져 본다',
        effects: [
          { op: 'loseHp', amount: 5 },
          { op: 'offerCards', count: 3 },
        ],
      },
      { label: '지나간다', effects: [] },
    ],
  },
] satisfies EventDef[];
