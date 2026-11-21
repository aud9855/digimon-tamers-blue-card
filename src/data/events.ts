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
      { label: '괜찮다고 한다', effects: [{ op: 'gainBits', amount: 40 }] },
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
  // ── 확장 1차 (02 14.2): 카드 지우기·강화, 최대 HP ──
  {
    id: 'data_recycle',
    acts: [1, 2],
    title: '데이터 분해기',
    text: '길가에 버려진 분해 장치가 아직 웅웅 돌아간다. 쓸모없는 카드를 넣으면 깨끗이 지워 줄 것 같다.',
    choices: [
      { label: '카드를 넣는다', effects: [{ op: 'removeCard' }] },
      { label: '지나간다', effects: [] },
    ],
  },
  {
    id: 'kazu_trade',
    acts: [1, 2, 3],
    title: '강재호의 카드 교환',
    text: '강재호가 카드 묶음을 펼쳐 보이며 교환하자고 한다. 내 카드 한 장을 주면 자기 카드 중 하나를 골라 주겠단다.',
    choices: [
      {
        label: '교환한다',
        effects: [{ op: 'addRandomCard', rarity: 'uncommon' }, { op: 'removeCard' }],
      },
      { label: '구경만 한다', effects: [] },
    ],
  },
  {
    id: 'training_ground',
    acts: [1],
    title: '공터의 연습장',
    text: '아무도 없는 공터에 낡은 표적이 서 있다. 땀을 좀 흘리면 손에 익은 카드가 더 날카로워질 것 같다.',
    choices: [
      { label: '연습한다', effects: [{ op: 'loseHp', amount: 6 }, { op: 'upgradeCard' }] },
      { label: '쉰다', effects: [{ op: 'heal', amount: 8 }] },
    ],
  },
  {
    id: 'old_server',
    acts: [1, 2],
    title: '낡은 서버',
    text: '먼지 쌓인 서버에서 쓸 만한 보강 데이터가 새어 나온다. 몸에 맞추어 넣을 수도, 부품째 떼어 팔 수도 있다.',
    choices: [
      { label: '몸에 맞춘다', effects: [{ op: 'changeMaxHp', amount: 6 }] },
      { label: '부품을 판다', effects: [{ op: 'gainBits', amount: 50 }] },
    ],
  },
  {
    id: 'calumon_song',
    acts: [1, 2],
    title: '동글몬의 노래',
    text: '동글몬이 귀를 흔들며 콧노래를 부른다. 듣고 있으면 지친 몸이 풀리고, 따라 부르면 가슴 한쪽이 단단해지는 것 같다.',
    choices: [
      { label: '가만히 듣는다', effects: [{ op: 'heal', amount: 12 }] },
      { label: '함께 부른다', effects: [{ op: 'changeMaxHp', amount: 4 }] },
    ],
  },
  {
    id: 'tamer_note',
    acts: [1, 2, 3],
    title: '테이머의 쪽지',
    text: '벤치 위에 누군가 두고 간 덱 정리 쪽지가 있다. 쪽지대로 덱을 다듬어 볼 수도, 끼워 둔 비트만 챙길 수도 있다.',
    choices: [
      { label: '덱을 정리한다', effects: [{ op: 'removeCard' }] },
      { label: '비트만 챙긴다', effects: [{ op: 'gainBits', amount: 30 }] },
    ],
  },
  {
    id: 'glitch_mirror',
    acts: [2, 3],
    title: '깨진 거울',
    text: '금 간 거울 속의 파트너가 한 박자 늦게 움직인다. 오래 들여다보면 무언가를 얻겠지만 무언가를 빼앗길 것 같다.',
    choices: [
      { label: '들여다본다', effects: [{ op: 'changeMaxHp', amount: -6 }, { op: 'upgradeCard' }] },
      { label: '외면한다', effects: [] },
    ],
  },
  {
    id: 'light_grains',
    acts: [2],
    title: '빛 알갱이',
    text: '하늘에서 반짝이는 데이터 알갱이가 눈처럼 내린다. 모으려면 뜨거운 알갱이에 손을 데어야 한다.',
    choices: [
      {
        label: '주워 모은다',
        effects: [
          { op: 'loseHp', amount: 5 },
          { op: 'changeMaxHp', amount: 8 },
        ],
      },
      { label: '그냥 둔다', effects: [] },
    ],
  },
  {
    id: 'data_forge',
    acts: [2, 3],
    title: '데이터 대장간',
    text: '붉게 달아오른 코드 덩어리가 망치질을 기다린다. 카드를 넣어 두드리면 더 단단해지지만 불똥이 튄다.',
    choices: [
      { label: '단련한다', effects: [{ op: 'loseHp', amount: 8 }, { op: 'upgradeCard' }] },
      { label: '구경한다', effects: [] },
    ],
  },
  {
    id: 'reaper_trace',
    acts: [3],
    title: '디 리퍼의 흔적',
    text: '붉은 얼룩이 덱 가장자리까지 번져 있다. 물든 카드를 떼어 내면 깨끗해지겠지만 손끝이 저릴 것이다.',
    choices: [
      { label: '떼어 낸다', effects: [{ op: 'loseHp', amount: 6 }, { op: 'removeCard' }] },
      { label: '피해 간다', effects: [] },
    ],
  },
  {
    id: 'hypnos_support',
    acts: [3],
    title: '히프노스의 지원',
    text: '히프노스가 마지막 지원 프로그램을 보내왔다. 카드 강화와 회복 중 하나만 받을 수 있다.',
    choices: [
      { label: '강화 프로그램', effects: [{ op: 'upgradeCard' }] },
      { label: '회복 프로그램', effects: [{ op: 'heal', amount: 15 }] },
    ],
  },
  {
    id: 'heavy_armor',
    acts: [3],
    title: '무거운 갑옷 데이터',
    text: '두꺼운 갑옷 데이터가 바닥에 굴러다닌다. 걸치면 몸은 단단해지지만 덱에 쓸모없는 조각이 섞여 든다.',
    choices: [
      {
        label: '걸친다',
        effects: [
          { op: 'changeMaxHp', amount: 10 },
          { op: 'addCard', cardId: 'bug_data' },
        ],
      },
      { label: '벗어 둔다', effects: [] },
    ],
  },
] satisfies EventDef[];
