// 처음 하는 사람을 위한 안내 (04 T1-10). 수치는 data에서 읽어 규칙과 어긋나지 않게 함.
import { constants } from '../../data/index';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h3 className="mb-1 font-bold text-sky-200">{title}</h3>
      <div className="text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

export function GuideContent() {
  const accelPct = Math.round(constants.ACCEL_PER_POINT * 100);
  return (
    <div data-testid="guide">
      <Section title="목표">
        카드를 모아 덱을 키우며 지도를 따라 올라가, 막 끝의 보스를 쓰러뜨리면 승리합니다. HP가 0이
        되면 처음부터 다시 합니다.
      </Section>
      <Section title="카드 내기">
        카드를 <b>위로 끌어 올리면</b> 냅니다. 적을 고르는 카드는 <b>적 위에 놓습니다</b>. 끌기가
        불편하면 카드를 눌러 고른 뒤, 적이나 &quot;여기를 눌러 내기&quot;를 누르세요. 카드를 길게
        누르면 크게 볼 수 있습니다.
      </Section>
      <Section title="메모리">
        카드 왼쪽 위 숫자가 메모리 비용입니다. 메모리는 턴마다 다시 채워집니다. 턴마다{' '}
        {constants.HAND_SIZE}장을 뽑고, 쓰지 않은 카드는 턴이 끝나면 버려집니다.
      </Section>
      <Section title="진화 (디아크)">
        진화 버튼을 누르면 메모리를 써서 파트너가 한 단계 진화합니다. 진화하면 임시 HP와 더 센
        공격력, 그리고 필살기 카드를 얻습니다. 진화는 그 전투가 끝나면 풀립니다.
        <br />
        <b>지금 카드를 낼까, 진화에 아껴 둘까</b>가 이 게임의 고민거리입니다.
      </Section>
      <Section title="당겨쓰기와 가속">
        메모리가 모자라도 -{constants.MAX_OVERDRAW}까지 당겨 쓸 수 있습니다. 대신 메모리가 0 아래인
        채로 턴을 끝내면, 모자란 만큼 모든 적이 <b>가속</b>을 얻어 다음 공격이 1점당 +{accelPct}%
        세집니다. 당겨쓰기 전에 화면에 경고가 나옵니다.
      </Section>
      <Section title="적의 인텐트">
        적 위의 표시가 다음 행동입니다. ⚔는 공격과 피해량, 🛡는 방어, ▲는 강해지기, ▼는 방해, ✦는
        여러 가지입니다.
      </Section>
      <Section title="속성">
        백신은 바이러스에, 바이러스는 데이터에, 데이터는 백신에 강합니다. 강한 쪽은 피해가 ×
        {constants.ATTR_STRONG}, 약한 쪽은 ×{constants.ATTR_WEAK}입니다.
      </Section>
      <Section title="지도">
        빛나는 칸만 갈 수 있습니다. 전투, 강적(☠), 이벤트(?), 상점(¤), 휴식(♨), 보물(◆)이 있습니다.
        휴식에서는 HP를 회복하거나 카드를 강화합니다.
      </Section>
    </div>
  );
}
