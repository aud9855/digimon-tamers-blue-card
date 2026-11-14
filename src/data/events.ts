// 이벤트 (02 9.6, 12.10). 글은 게임용으로 새로 쓴 것입니다.
import type { EventDef } from '../core/types';

export const events = [
  {
    id: 'calumon_play',
    acts: [1, 2],
    title: '길 잃은 동글몬',
    text: '골목 끝에서 하얀 디지몬이 귀를 펄럭이며 놀아 달라고 조른다. 함께 있으면 마음이 조금 가벼워질 것 같다. 어디론가 데려가고 싶어 하는 눈치이기도 하다.',
    choices: [
      { label: '같이 논다', effects: [{ op: 'heal', amount: 10 }] },
      { label: '따라가 본다', effects: [{ op: 'addRandomCard', rarity: 'common' }] },
    ],
  },
  {
    id: 'card_pile',
    acts: [1, 2],
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
  {
    id: 'kenta_snack',
    acts: [1, 2, 3],
    title: '이성우의 간식',
    text: '이성우가 주머니에서 과자 봉지를 꺼내 흔든다. 배가 고프면 싸움도 못 한다며 반을 내민다. 남은 용돈도 조금 보태 주겠다고 한다.',
    choices: [
      {
        label: '나눠 먹는다',
        effects: [
          { op: 'heal', amount: 8 },
          { op: 'gainBits', amount: 20 },
        ],
      },
      { label: '괜찮다고 한다', effects: [] },
    ],
  },
  {
    id: 'hypnos_data',
    acts: [2, 3],
    title: '히프노스의 데이터',
    text: '히프노스의 통신이 디아크로 흘러든다. 전투에 쓸 만한 데이터를 보내 주겠다지만, 전송 중에 몸이 버틸지는 알 수 없다.',
    choices: [
      {
        label: '데이터를 받는다',
        effects: [
          { op: 'loseHp', amount: 8 },
          { op: 'addRandomCard', rarity: 'rare' },
        ],
      },
      { label: '거절한다', effects: [] },
    ],
  },
  {
    id: 'deva_shrine',
    acts: [2],
    title: '데바의 제단',
    text: '버려진 제단 위에서 디아크 칩 하나가 희미하게 빛난다. 둘레에는 깨진 데이터가 엉겨 있어, 집으면 무언가가 딸려 올 것 같다.',
    choices: [
      {
        label: '칩을 가져간다',
        effects: [{ op: 'addRandomChip' }, { op: 'addCard', cardId: 'bug_data' }],
      },
      { label: '지나간다', effects: [] },
    ],
  },
  {
    id: 'digital_storm',
    acts: [2, 3],
    title: '디지털 폭풍',
    text: '앞길에 데이터 조각이 소용돌이친다. 뚫고 지나가면 다칠 테지만, 폭풍 속에는 쓸 만한 카드 데이터가 섞여 있다.',
    choices: [
      {
        label: '뚫고 간다',
        effects: [
          { op: 'loseHp', amount: 10 },
          { op: 'offerCards', count: 3, upgraded: true },
        ],
      },
      { label: '돌아간다', effects: [] },
    ],
  },
  {
    id: 'juri_cheer',
    acts: [1, 2, 3],
    title: '황주연의 응원',
    text: '황주연이 숨을 고르며 달려와 손에 쥔 카드를 흔든다. 다치지 말라며 응급 상자를 내밀고, 같이 가면 힘이 되어 주겠다고 한다.',
    choices: [
      { label: '고맙다고 한다', effects: [{ op: 'heal', amount: 15 }] },
      { label: '함께 가자고 한다', effects: [{ op: 'addCard', cardId: 'juri' }] },
    ],
  },
  {
    id: 'calumon_glow',
    acts: [3],
    title: '동글몬의 빛',
    text: '지친 동글몬의 이마에서 붉은 빛이 희미하게 깜빡인다. 손을 잡아 주면 그 빛이 디아크로 흘러들 것 같다. 아니면 조용히 쉬게 둘 수도 있다.',
    choices: [
      { label: '손을 잡는다', effects: [{ op: 'addCard', cardId: 'calumon' }] },
      { label: '쉬게 한다', effects: [{ op: 'heal', amount: 20 }] },
    ],
  },
] satisfies EventDef[];
