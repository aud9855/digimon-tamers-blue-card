// 정보·저작권 고지 (01 10절, 04 T1-10)
// MIT 라이선스는 배포본에도 고지를 담아야 해서 원문을 그대로 불러옴
import pixelfxLicense from '../fx/pixelfx/LICENSE?raw';
import { Capacitor } from '@capacitor/core';

export const SOURCE_URL = 'https://github.com/aud9855/digimon-tamers-blue-card';
/** 가장 최근 출시 APK (Releases에 늘 같은 이름으로 올림) */
export const APK_URL = `${SOURCE_URL}/releases/latest/download/blue-card.apk`;

export function InfoContent() {
  return (
    <div className="text-sm leading-relaxed text-slate-300" data-testid="info">
      <p className="font-bold text-white">디지몬 테이머즈: 블루 카드</p>
      <p className="mt-1">
        디지몬 테이머즈를 바탕으로 한 <b>비공식·비영리 팬 게임</b>입니다. 판매, 광고, 후원 보상이
        없습니다.
      </p>

      {!Capacitor.isNativePlatform() && (
        <>
          <h3 className="mt-4 font-bold text-sky-200">Android 앱</h3>
          <p className="mt-1">
            브라우저 없이 하려면 앱을 받아 설치하세요. 처음 설치할 때 "출처를 알 수 없는 앱"을
            허용해야 합니다.
          </p>
          <a
            href={APK_URL}
            data-testid="apk-link"
            className="mt-2 inline-flex min-h-11 items-center rounded-lg bg-sky-700 px-4 font-bold text-white"
          >
            앱(APK) 받기
          </a>
        </>
      )}

      <h3 className="mt-4 font-bold text-sky-200">저작권</h3>
      <ul className="mt-1 list-disc pl-5">
        <li>
          디지몬(Digimon)과 디지몬 테이머즈 관련 명칭·캐릭터·이미지의 권리는 © BANDAI, © TOEI
          ANIMATION, © WiZ 등 각 권리자에게 있습니다.
        </li>
        <li>이 게임은 위 권리자와 관계가 없습니다.</li>
        <li>
          디지몬 도트는 원작 게임의 3D 모델 그림(한 종은 공식 일러스트)을 도트로 줄인 것입니다
          (출처: Wikimon). 원작 그림이 없는 디지몬과 아이콘·얼굴 그림, 글은 직접 만든 것입니다. 원작
          화면·카드 이미지와 데이터는 쓰지 않습니다.
        </li>
        <li>원작 대사와 장면을 그대로 옮기지 않았습니다.</li>
      </ul>

      <h3 className="mt-4 font-bold text-sky-200">코드</h3>
      <p className="mt-1">
        코드는 공개 저장소에 있지만 오픈 소스 라이선스가 없습니다 (All rights reserved). 볼 수는
        있지만 허락 없이 가져다 쓸 수는 없습니다.
      </p>
      <p className="mt-1 break-all text-xs text-slate-400">{SOURCE_URL}</p>

      <h3 className="mt-4 font-bold text-sky-200">가져다 쓴 코드</h3>
      <p className="mt-1">
        전투 효과는 pixelfx(MIT 라이선스, © 2026 Patch, Hugo Duprez)의 코드를 고쳐 씁니다. pixelfx
        안의 일부는 Sprite Fusion(Hugo Duprez)과 Hollow Crown(rehan-remade)에서 왔고, 모두 MIT
        라이선스입니다.
      </p>
      <details className="mt-1">
        <summary className="cursor-pointer text-xs text-slate-400">pixelfx 라이선스 전문</summary>
        <pre className="mt-1 text-xs whitespace-pre-wrap text-slate-400">{pixelfxLicense}</pre>
      </details>
    </div>
  );
}
