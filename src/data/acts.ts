// 막 이름과 시작 글 (01 3-2, 3-3). 글은 게임용으로 새로 쓴 것입니다.
export interface ActDef {
  act: number;
  name: string;
  intro: string;
}

export const acts: ActDef[] = [
  {
    act: 1,
    name: '현실 세계',
    intro:
      '도시 곳곳에 짙은 안개가 끼고, 그 안에서 와일드 원이 나타나기 시작했다. 디아크가 떨린다.',
  },
  {
    act: 2,
    name: '디지털 월드',
    intro:
      '데이터의 바람이 부는 낯선 땅. 데바들이 길을 막고, 그 너머에서 붉은 날개의 기척이 느껴진다.',
  },
  {
    act: 3,
    name: '디 리퍼',
    intro:
      '현실로 돌아오자 하늘이 붉은 덩어리에 덮여 간다. 모든 것을 지우려는 디 리퍼를 막아야 한다.',
  },
];
