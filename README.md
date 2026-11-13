# 디지몬 덱 로그 (가제, DIGIMON DECK ROGUE)

디지몬 테이머즈를 바탕으로 한 **덱빌딩 로그라이크** 팬 게임입니다. 새 테이머가 되어 카드를 긁어(카드 슬래시) 파트너 디지몬을 싸움 중에 진화시키며, 현실 세계와 디지털 월드를 3막에 걸쳐 지나갑니다.

지금은 **기획 단계**입니다. 코드는 아직 없습니다.

## 문서

| 문서 | 내용 |
| :--- | :--- |
| [docs/01_GAME_DESIGN_DRAFT.md](docs/01_GAME_DESIGN_DRAFT.md) | 기획 초안: 컨셉, 막 구성, 전투·진화 규칙, 보상, 메타 진행, 기술 스택, 로드맵, 열린 질문 |

## 계획한 구조

```
DigimonDeckRogue.sln
├─ src/DigimonDeckRogue.Core/    게임 규칙 (엔진 무관, net8.0)
├─ src/DigimonDeckRogue.Godot/   Godot 4 .NET 화면
├─ tools/DigimonDeckRogue.Sim/   자동 플레이 봇 · 밸런스 측정
└─ tests/DigimonDeckRogue.Tests/ 단위 테스트
```

## 저작권 고지

- 이 프로젝트는 **비공식·비영리 팬 제작물**입니다. 판매·광고 등 상업적으로 쓰지 않습니다.
- 디지몬(Digimon), 디지몬 테이머즈 관련 명칭·캐릭터·이미지의 권리는 © BANDAI, © TOEI ANIMATION, © WiZ 등 각 권리자에게 있습니다.
- 공식 카드 이미지와 공식 카드 데이터는 넣지 않습니다.
