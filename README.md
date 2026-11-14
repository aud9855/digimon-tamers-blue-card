# 디지몬 테이머즈: 블루 카드

디지몬 테이머즈를 바탕으로 한 **모바일 덱빌딩 로그라이크** 팬 게임입니다. 테이머가 되어 카드를 긁어(카드 슬래시) 파트너 디지몬을 싸움 중에 진화시키며, 현실 세계와 디지털 월드를 3막에 걸쳐 지나갑니다. 한 판 20~30분.

## 지금 상태

**3단계(깊이)까지 끝났습니다.** 3막, 테이머 4명(다영·진은 해금), 매트릭스·폭주 진화, 디지털 해저드 1~10, 도감, 효과음이 들어 있습니다. 밸런스 기록은 [M3](docs/balance/M3.md), 작업 목록은 [04 문서](docs/04_ROADMAP.md)에 있습니다. 그림은 아직 자리표시입니다.

## 해 보기

- **웹**: 휴대폰 브라우저로 **https://aud9855.github.io/digimon-tamers-blue-card/** 를 여세요. 홈 화면에 추가하면 앱처럼 열리고, 한 번 연 뒤에는 오프라인에서도 됩니다.
- **Android 앱**: 휴대폰에서 **https://github.com/aud9855/digimon-tamers-blue-card/releases/latest/download/blue-card.apk** 를 받아 설치하세요. 처음 설치할 때 "출처를 알 수 없는 앱"을 허용해야 합니다. 새 버전도 같은 주소로 받아 덮어 설치하면 저장이 남습니다.

## 명령

Node.js 22 이상이 필요합니다.

```bash
npm install
npm run typecheck   # 타입 검사
npm run lint        # 규칙 검사 (core에서 Math.random·Date 금지 등)
npm test            # 테스트 전체
npm run sim -- --policy greedy --tamer takato --runs 1000   # 봇 1,000판
npm run sim -- --report m0                                  # 밸런스 지표 10개 표
npm run card-texts  # 카드·칩 설명 글을 docs/balance/card-texts.md로
npm run dev         # 개발 서버 (휴대폰에서 같은 와이파이로 접속 가능)
npm run build       # 배포 빌드 (dist/, 서비스 워커 포함)
npm run e2e         # 360px 화면에서 전투 하나를 자동으로 (Chrome·Edge 필요)
```

## 문서

| 문서 | 내용 |
| :--- | :--- |
| [docs/01_GAME_DESIGN.md](docs/01_GAME_DESIGN.md) | 기획: 컨셉, 설계 기둥, 테이머·막 구성, 한국 방영판 이름표, 저작권 원칙 |
| [docs/02_RULES_SPEC.md](docs/02_RULES_SPEC.md) | 규칙 명세: 전투 순서, 피해 공식, 진화, 지도 생성, 보상, 0단계 카드·적 수치, 밸런스 목표 |
| [docs/03_ARCHITECTURE.md](docs/03_ARCHITECTURE.md) | 구조 설계: 폴더, 타입, 엔진 약속, 봇, 테스트, 화면 원칙 |
| [docs/04_ROADMAP.md](docs/04_ROADMAP.md) | 작업 목록: 단계별 작업과 끝났다는 기준 |

## 구조

TypeScript 웹 앱(Vite + React) + Capacitor APK.

```
src/core/   규칙 엔진 (순수 함수, 화면 무관)
src/data/   카드·적·칩 수치
src/sim/    자동 플레이 봇 · 밸런스 측정
src/ui/     모바일 화면 (세로)
tests/      테스트
```

## 저작권 고지

- 이 프로젝트는 **비공식·비영리 팬 제작물**입니다. 판매·광고 등 상업적으로 쓰지 않습니다.
- 디지몬(Digimon), 디지몬 테이머즈 관련 명칭·캐릭터·이미지의 권리는 © BANDAI, © TOEI ANIMATION, © WiZ 등 각 권리자에게 있습니다.
- 공식 카드 이미지와 공식 카드 데이터는 넣지 않습니다.
- 이 저장소의 코드와 문서에는 오픈 소스 라이선스가 없습니다 (All rights reserved). 볼 수는 있지만 허락 없이 가져다 쓸 수는 없습니다.
