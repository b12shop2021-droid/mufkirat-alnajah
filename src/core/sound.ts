/* ===================================================================
   sound.ts — أصوات نجاح خفيفة مولّدة برمجياً (Web Audio، بدون ملفات).
   مطفأة افتراضياً؛ تتحكم بها حالة soundOn في النواة عبر setSoundEnabled.
   =================================================================== */

let enabled = false;
let ctx: AudioContext | null = null;

export function setSoundEnabled(on: boolean): void {
  enabled = on;
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    }
    return ctx;
  } catch {
    return null;
  }
}

/* نغمة قصيرة لطيفة (نوتتان صاعدتان) عند الإنجاز */
function tone(c: AudioContext, freq: number, start: number, dur: number): void {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, c.currentTime + start);
  gain.gain.linearRampToValueAtTime(0.18, c.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur);
}

/* نغمة إنجاز عادية (مهمة/حفظ) */
export function playSuccess(): void {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  tone(c, 660, 0, 0.16);
  tone(c, 880, 0.09, 0.22);
}

/* نغمة احتفال أكبر (صعود مستوى) — ثلاث نوتات */
export function playLevelUp(): void {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') void c.resume();
  tone(c, 660, 0, 0.16);
  tone(c, 880, 0.1, 0.16);
  tone(c, 1175, 0.2, 0.3);
}
