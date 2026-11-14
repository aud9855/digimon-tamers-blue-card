// 효과음 (02 13.7): Web Audio로 코드에서 합성합니다. 소리 파일은 쓰지 않습니다.
// 규칙이 아니라 화면의 일이므로 core는 이 파일을 모릅니다.
import type { GameEvent } from '../core/index';
import { getForms } from '../data/index';

export type SoundKind =
  | 'card'
  | 'hit'
  | 'hurt'
  | 'block'
  | 'shield'
  | 'heal'
  | 'evolve'
  | 'rampage'
  | 'enemyDown'
  | 'win'
  | 'runWon'
  | 'runLost';

/** 한 음: 주파수(Hz), 시작(초), 길이(초), 파형, 크기, 끝 주파수(미끄러짐) */
interface Tone {
  freq: number;
  at: number;
  dur: number;
  wave: OscillatorType;
  gain: number;
  to?: number;
}

const tone = (
  freq: number,
  at: number,
  dur: number,
  wave: OscillatorType = 'square',
  gain = 0.12,
  to?: number,
): Tone => (to === undefined ? { freq, at, dur, wave, gain } : { freq, at, dur, wave, gain, to });

/** 소리마다 음 목록 (직접 만든 짧은 효과음) */
export const SOUNDS: Record<SoundKind, Tone[]> = {
  card: [tone(660, 0, 0.05, 'triangle', 0.1, 880)],
  hit: [tone(220, 0, 0.08, 'square', 0.12, 90), tone(110, 0, 0.06, 'sawtooth', 0.06)],
  hurt: [tone(160, 0, 0.14, 'sawtooth', 0.12, 60)],
  block: [tone(880, 0, 0.05, 'square', 0.06, 700)],
  shield: [tone(440, 0, 0.08, 'triangle', 0.1, 660), tone(660, 0.06, 0.08, 'triangle', 0.08)],
  heal: [tone(523, 0, 0.1, 'sine', 0.12), tone(784, 0.08, 0.14, 'sine', 0.1)],
  evolve: [
    tone(392, 0, 0.09, 'square', 0.08),
    tone(523, 0.08, 0.09, 'square', 0.08),
    tone(659, 0.16, 0.09, 'square', 0.08),
    tone(784, 0.24, 0.25, 'triangle', 0.12, 1046),
  ],
  rampage: [
    tone(110, 0, 0.5, 'sawtooth', 0.14, 55),
    tone(116, 0, 0.5, 'sawtooth', 0.1, 58),
    tone(880, 0.3, 0.3, 'square', 0.05, 220),
  ],
  enemyDown: [tone(330, 0, 0.18, 'square', 0.1, 80)],
  win: [
    tone(523, 0, 0.1, 'square', 0.08),
    tone(659, 0.1, 0.1, 'square', 0.08),
    tone(784, 0.2, 0.22, 'square', 0.1),
  ],
  runWon: [
    tone(523, 0, 0.12, 'square', 0.08),
    tone(659, 0.12, 0.12, 'square', 0.08),
    tone(784, 0.24, 0.12, 'square', 0.08),
    tone(1046, 0.36, 0.5, 'triangle', 0.12),
  ],
  runLost: [
    tone(392, 0, 0.2, 'triangle', 0.1),
    tone(330, 0.2, 0.2, 'triangle', 0.1),
    tone(262, 0.4, 0.5, 'triangle', 0.1, 196),
  ],
};

/** 일 하나에 맞는 소리 (없으면 null) */
export function soundFor(event: GameEvent): SoundKind | null {
  switch (event.type) {
    case 'cardPlayed':
      return 'card';
    case 'damage':
      if (event.target === 'player') return event.hpLost + event.tempHpLost > 0 ? 'hurt' : 'block';
      return event.hpLost > 0 ? 'hit' : 'block';
    case 'shieldGained':
      return event.target === 'player' ? 'shield' : null;
    case 'healed':
      return event.amount > 0 ? 'heal' : null;
    case 'evolved':
      return getForms().find((f) => f.id === event.formId)?.rampage ? 'rampage' : 'evolve';
    case 'enemyDied':
      return 'enemyDown';
    case 'battleEnded':
      return event.won ? 'win' : null;
    case 'runEnded':
      return event.won ? 'runWon' : 'runLost';
    default:
      return null;
  }
}

/** 한꺼번에 처리한 일들(재생을 건너뛸 때)에서 낼 소리: 종류마다 한 번, 중요한 것 몇 개만 */
export function soundsForBatch(events: readonly GameEvent[], max = 3): SoundKind[] {
  const kinds: SoundKind[] = [];
  for (const e of events) {
    const kind = soundFor(e);
    if (kind && !kinds.includes(kind)) kinds.push(kind);
  }
  // 끝을 알리는 소리가 있으면 그것을 앞에
  const order: SoundKind[] = ['runWon', 'runLost', 'win', 'rampage', 'evolve'];
  kinds.sort((a, b) => rank(order, a) - rank(order, b));
  return kinds.slice(0, max);
}

function rank(order: SoundKind[], kind: SoundKind): number {
  const i = order.indexOf(kind);
  return i < 0 ? order.length : i;
}

let context: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined' || typeof window.AudioContext === 'undefined') return null;
  try {
    context ??= new window.AudioContext();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
}

/** 소리 내기. 꺼져 있거나 Web Audio가 없으면 아무 일도 없음 */
export function playSound(kind: SoundKind): void {
  if (!enabled) return;
  const ctx = audio();
  if (!ctx) return;
  const now = ctx.currentTime;
  for (const t of SOUNDS[kind]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = t.wave;
    osc.frequency.setValueAtTime(t.freq, now + t.at);
    if (t.to !== undefined) osc.frequency.exponentialRampToValueAtTime(t.to, now + t.at + t.dur);
    gain.gain.setValueAtTime(0.0001, now + t.at);
    gain.gain.exponentialRampToValueAtTime(t.gain, now + t.at + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + t.at + t.dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + t.at);
    osc.stop(now + t.at + t.dur + 0.02);
  }
}
