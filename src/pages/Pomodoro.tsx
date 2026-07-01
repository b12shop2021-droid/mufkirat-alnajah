/* ===================================================================
   Pomodoro.tsx — مؤقت البومودورو المدمج
   25 دقيقة تركيز + 5 دقيقة راحة + 15 دقيقة راحة كبيرة.
   مرتبط بمهام الروتين + يكسب XP عند اكتمال كل جلسة.
   =================================================================== */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCore } from '../core/useCore';
import BackButton from '../components/BackButton';
import XPBar from '../components/XPBar';
import { fireConfetti } from '../components/Confetti';

type Mode = 'work' | 'short' | 'long';

const DURATIONS: Record<Mode, number> = {
  work: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

const LABELS: Record<Mode, string> = {
  work: 'تركيز 🧠',
  short: 'راحة قصيرة ☕',
  long: 'راحة طويلة 🌿',
};

const COLORS: Record<Mode, string> = {
  work: 'var(--primary)',
  short: 'var(--warning)',
  long: 'var(--deep)',
};

/* عبارات تشجيعية أثناء عمل المؤقت — حسب الوضع والوقت المنقضي/المتبقي */
function coachMessage(mode: Mode, remaining: number): string {
  if (mode !== 'work') {
    return 'أطلق فزعة! خذ لك 5 دقايق تمدد فيها، اشرب موية، بس تكفى لا تطول في السوشيال ميديا وتضيع 🙏';
  }
  const elapsed = DURATIONS.work - remaining;
  if (remaining <= 120) return 'اللمسات الأخيرة.. هانت، لا تفك التركيز الحين وتخرب اللوحة! 🎨';
  if (elapsed < 300) return 'بداية فنانة.. خلك صامل، الجوال الحين اعتبره طافي. 🔒';
  return 'نص الطريق قفلناه.. كفو، مخك الحين شغال بأعلى كفاءة. 🧠';
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function Pomodoro({ embedded = false }: { embedded?: boolean }) {
  const core = useCore();
  const tasks = [
    ...core.state.routine.morning,
    ...core.state.routine.evening,
  ].filter((t) => t.doneDate !== new Date().toISOString().slice(0, 10));

  const [mode, setMode] = useState<Mode>('work');
  const [remaining, setRemaining] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0); // عدد جلسات العمل المنجزة
  const [linkedTask, setLinkedTask] = useState<string>('');
  const [justDone, setJustDone] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endRef = useRef<number>(0); // طابع زمني لنهاية الجلسة (يمنع انحراف العدّاد بالخلفية)

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  }, []);

  const switchMode = useCallback(
    (m: Mode) => {
      stop();
      setMode(m);
      setRemaining(DURATIONS[m]);
      setJustDone(false);
    },
    [stop],
  );

  /* عند انتهاء الوقت */
  const handleComplete = useCallback(() => {
    stop();

    if (mode === 'work') {
      const next = sessions + 1;
      setSessions(next);
      core.addXP(10); // +10 XP لكل جلسة عمل

      if (next % 4 === 0) {
        /* كل 4 جلسات: راحة طويلة + احتفال */
        fireConfetti();
        core.addXP(20); // +20 XP بونص
        switchMode('long');
      } else {
        switchMode('short');
      }
    } else {
      switchMode('work');
    }

    /* إشعار صوتي بسيط */
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = mode === 'work' ? 880 : 660;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      /* AudioContext غير مدعوم */
    }

    /* يُضبط بعد switchMode (الذي يصفّره) ليبقى true ويظهر رسالة الإكمال */
    setJustDone(true);
  }, [mode, sessions, stop, switchMode, core]);

  /* تشغيل المؤقت — يعتمد على وقت نهاية مطلق فلا ينحرف لو صار التبويب بالخلفية */
  useEffect(() => {
    if (!running) return;
    /* نحسب نهاية الجلسة من المتبقّي لحظة التشغيل/الاستئناف */
    endRef.current = Date.now() + remaining * 1000;
    intervalRef.current = setInterval(() => {
      const left = Math.round((endRef.current - Date.now()) / 1000);
      if (left <= 0) {
        setRemaining(0);
        handleComplete();
      } else {
        setRemaining(left);
      }
    }, 250);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // remaining مقصود استبعاده: نلتقط قيمته عند بدء التشغيل فقط
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, handleComplete]);

  /* تحديث عنوان المتصفح بالوقت المتبقي */
  useEffect(() => {
    if (running) document.title = `${fmt(remaining)} — الهمّة`;
    else document.title = 'الهمّة';
    return () => { document.title = 'الهمّة'; };
  }, [running, remaining]);

  const pct = ((DURATIONS[mode] - remaining) / DURATIONS[mode]) * 100;
  const r = 88;
  const circ = 2 * Math.PI * r;

  return (
    <div className={embedded ? '' : 'page'}>
      {!embedded && <BackButton />}
      {!embedded && <XPBar />}

      {/* أزرار الوضع */}
      <div className="pomo-modes">
        {(['work', 'short', 'long'] as Mode[]).map((m) => (
          <button
            key={m}
            className={`pomo-mode-btn ${mode === m ? 'active' : ''}`}
            onClick={() => switchMode(m)}
          >
            {LABELS[m]}
          </button>
        ))}
      </div>

      {/* المؤقت الدائري */}
      <div className="pomo-circle-wrap">
        <svg viewBox="0 0 200 200" className="pomo-svg">
          <circle cx="100" cy="100" r={r} className="pomo-track" />
          <circle
            cx="100"
            cy="100"
            r={r}
            className="pomo-fill"
            style={{
              stroke: COLORS[mode],
              strokeDasharray: circ,
              strokeDashoffset: circ - (circ * pct) / 100,
            }}
          />
        </svg>
        <div className="pomo-time">{fmt(remaining)}</div>
        <div className="pomo-label">{LABELS[mode]}</div>
      </div>

      {running && (
        <div className="pomo-coach">{coachMessage(mode, remaining)}</div>
      )}

      {justDone && mode !== 'work' && (
        <div className="pomo-done-msg">
          🎉 جلسة مكتملة! +10 XP{sessions % 4 === 0 ? ' + بونص 20 XP 🏆' : ''}
        </div>
      )}

      {/* أزرار التحكم */}
      <div className="pomo-controls">
        <button
          className="pomo-btn-main"
          style={{ background: COLORS[mode] }}
          onClick={() => setRunning((r) => !r)}
        >
          {running ? '⏸ إيقاف مؤقت' : remaining === DURATIONS[mode] ? '▶ يلا بسم الله' : '▶ استمر'}
        </button>
        <button className="pomo-btn-reset" onClick={() => { stop(); setRemaining(DURATIONS[mode]); setJustDone(false); }}>
          ↺ إعادة
        </button>
      </div>

      {/* إحصائيات الجلسة */}
      <div className="card pomo-stats">
        <div className="pomo-stat">
          <div className="ps-num">{sessions}</div>
          <div className="ps-label">جلسة مكتملة</div>
        </div>
        <div className="pomo-stat">
          <div className="ps-num">{sessions * 10 + Math.floor(sessions / 4) * 20}</div>
          <div className="ps-label">XP مكتسب</div>
        </div>
        <div className="pomo-stat">
          <div className="ps-num">{sessions * 25}</div>
          <div className="ps-label">دقيقة تركيز</div>
        </div>
      </div>

      {/* ربط بمهمة */}
      {tasks.length > 0 && (
        <div className="card">
          <div className="section-title" style={{ marginBottom: 8, fontSize: '0.82rem' }}>
            🔗 اربط بمهمة من روتينك
          </div>
          <select
            className="input-field"
            value={linkedTask}
            onChange={(e) => setLinkedTask(e.target.value)}
          >
            <option value="">— اختر مهمة (اختياري) —</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.text}
              </option>
            ))}
          </select>
          {linkedTask && (
            <div className="hint-msg ok" style={{ marginTop: 6 }}>
              ✅ المؤقت مرتبط بـ "{tasks.find((t) => t.id === linkedTask)?.text}"
            </div>
          )}
        </div>
      )}

      {/* نصائح */}
      <div className="card" style={{ background: 'var(--bg)', boxShadow: 'none', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          💡 <strong>تقنية بومودورو:</strong> 25 دقيقة تركيز كامل بدون انقطاع، ثم راحة قصيرة. بعد 4 جلسات — راحة طويلة مكتسبة.
        </div>
      </div>
    </div>
  );
}
