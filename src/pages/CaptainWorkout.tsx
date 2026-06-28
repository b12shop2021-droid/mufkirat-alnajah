/* ===================================================================
   CaptainWorkout.tsx — جدول "الكابتن سعود" (6 أيام)
   تسجيل أداء بكل جولة، كشف الرقم الشخصي، مؤقت راحة بـ timestamp،
   صورة لكل تمرين، سجل تمارين تاريخي. الحالة الدائمة عبر useCore.
   =================================================================== */

import { useState, useRef, useEffect } from 'react';
import { useCore } from '../core/useCore';
import { useWorkoutTimer } from '../core/useWorkoutTimer';
import { WORKOUT_DAYS, type CaptainExercise } from '../data/workoutDays';
import BackButton from '../components/BackButton';
import { fireConfetti } from '../components/Confetti';

const REST_SECONDS = 75;
const MAX_IMG = 1_500_000;

interface SetEntry {
  weight: string;
  reps: string;
  done: boolean;
}

export default function CaptainWorkout({ embedded = false }: { embedded?: boolean }) {
  const core = useCore();
  const [dayIdx, setDayIdx] = useState(0);
  const [sets, setSets] = useState<Record<string, SetEntry[]>>({});
  const [restKey, setRestKey] = useState<string | null>(null);
  const [prKey, setPrKey] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const rest = useWorkoutTimer();
  const sessionStart = useRef<number>(Date.now());

  const day = WORKOUT_DAYS[dayIdx];
  const exKey = (exId: number) => `${day.id}:${exId}`;
  const remaining = Math.max(0, REST_SECONDS - rest.seconds);

  /* إيقاف مؤقت الراحة عند انتهاء العدّ */
  useEffect(() => {
    if (restKey && remaining <= 0) {
      rest.stop();
      setRestKey(null);
      setHint('⏱️ انتهت الراحة! استعد للجولة القادمة 💪');
    }
  }, [remaining, restKey, rest]);

  /* جلب جولات تمرين (تهيئة كسولة من بيانات اليوم) */
  const getSets = (ex: CaptainExercise): SetEntry[] => {
    const k = exKey(ex.id);
    return sets[k] ?? Array.from({ length: ex.sets }, () => ({ weight: '', reps: '', done: false }));
  };

  const updateSet = (ex: CaptainExercise, idx: number, field: 'weight' | 'reps', value: string) => {
    const k = exKey(ex.id);
    const cur = getSets(ex).map((s) => ({ ...s }));
    cur[idx][field] = value;
    setSets({ ...sets, [k]: cur });
  };

  const toggleSetDone = (ex: CaptainExercise, idx: number) => {
    const k = exKey(ex.id);
    const cur = getSets(ex).map((s) => ({ ...s }));
    cur[idx].done = !cur[idx].done;
    setSets({ ...sets, [k]: cur });
    if (cur[idx].done) {
      // بدء مؤقت الراحة (تصاعدي بـ timestamp)
      rest.reset();
      rest.start();
      setRestKey(k);
      // كشف الرقم الشخصي
      const w = Number(cur[idx].weight);
      if (w > 0 && core.recordPR(k, w)) {
        setPrKey(k);
        fireConfetti();
        window.setTimeout(() => setPrKey((p) => (p === k ? null : p)), 4000);
      }
    }
  };

  /* تبديل إكمال تمرين + فحص اكتمال اليوم */
  const handleToggleDone = (ex: CaptainExercise) => {
    const k = exKey(ex.id);
    const wasDone = core.state.completedExercises.includes(k);
    core.toggleExerciseDone(k);
    if (!wasDone) {
      // فحص اكتمال اليوم — الاحتفال للإنجاز الكبير فقط (إكمال اليوم)
      const doneKeys = new Set([...core.state.completedExercises, k]);
      const allDone = day.exercises.every((e) => doneKeys.has(exKey(e.id)));
      if (allDone) {
        fireConfetti();
        const duration = Math.floor((Date.now() - sessionStart.current) / 1000);
        core.logWorkoutDay(day.id, duration, day.exercises.map((e) => exKey(e.id)));
      }
    }
  };

  /* رفع صورة اليوم (يُفضّل 1080×1920) */
  const handleDayImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setHint('⚠️ لازم تكون صورة'); return; }
    if (file.size > MAX_IMG) { setHint('⚠️ الصورة كبيرة (الحد 1.5 ميجا)'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') core.setWorkoutDayImage(day.id, reader.result);
    };
    reader.readAsDataURL(file);
  };
  const dayImage = core.state.workoutDayImages[day.id];

  const doneCount = day.exercises.filter((e) =>
    core.state.completedExercises.includes(exKey(e.id)),
  ).length;
  const dayPct = Math.round((doneCount / day.exercises.length) * 100);
  const dayComplete = doneCount === day.exercises.length;

  return (
    <div className="page">
      {!embedded && <BackButton />}

      {day.image && (
        <img
          className="day-infographic"
          src={day.image}
          alt={`صورة تمارين ${day.label}`}
          width={760}
          height={1602}
        />
      )}

      <label className="day-photo">
        {dayImage ? (
          <img src={dayImage} alt="صورة اليوم" />
        ) : (
          <div className="day-photo-empty">
            <div style={{ fontSize: '1.8rem' }}>📸</div>
            <div>ضِف صورة لهذا اليوم (1080×1920)</div>
          </div>
        )}
        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleDayImage} />
      </label>

      <div className="day-header">
        <div className="day-title-row">
          <div>
            <div className="day-title">{day.title}</div>
            <div className="day-focus">{day.focus}</div>
          </div>
          <div className="day-pct-circle">{dayPct}%</div>
        </div>
        <div className="day-progress-bg">
          <div className="day-progress-fill" style={{ width: `${dayPct}%` }} />
        </div>
      </div>

      <div className="day-pills">
        {WORKOUT_DAYS.map((d, i) => {
          const dDone = d.exercises.every((e) =>
            core.state.completedExercises.includes(`${d.id}:${e.id}`),
          );
          return (
            <button
              key={d.id}
              className={`day-pill ${i === dayIdx ? 'active' : ''} ${dDone ? 'completed' : ''}`}
              onClick={() => setDayIdx(i)}
            >
              <span className="dp-num">{i + 1}</span>
              {d.label}
            </button>
          );
        })}
      </div>

      {day.warmup && (
        <div className="warmup-note">
          🔥 تسخين خاص بيوم الأرجل: ١٠ دقائق تسخين للرجل + ٥ دقائق إطالات للجسم كامل. لا تتخطّى هالخطوة!
        </div>
      )}

      {day.exercises.map((ex, idx) => {
        const k = exKey(ex.id);
        const exSets = getSets(ex);
        const completed = core.state.completedExercises.includes(k);
        return (
          <div className="ex-card" key={k}>
            <div className="ex-banner">
              <div className="ex-banner-top">
                <span className="ex-num-badge">تمرين {idx + 1} من {day.exercises.length}</span>
                <span className={ex.advanced ? 'ex-diff-badge advanced' : 'ex-diff-badge'}>📊 {ex.difficulty}</span>
              </div>
              <div className="ex-name-ar">{ex.nameAr}</div>
              <div className="ex-name-en">{ex.nameEn}</div>
              {ex.sameDay && <div className="same-day-tag">🔁 {ex.sameDay}</div>}
            </div>

            <div className="ex-body">
              <div className="ex-muscles">💪 <strong>العضلات المستهدفة:</strong> {ex.muscles}</div>
              <div className="ex-stats-row">
                <div className="ex-stat"><div className="ex-stat-num">{ex.sets}</div><div className="ex-stat-label">جولات</div></div>
                <div className="ex-stat"><div className="ex-stat-num">{ex.reps}</div><div className="ex-stat-label">تكرارات</div></div>
                <div className="ex-stat"><div className="ex-stat-num">60-90</div><div className="ex-stat-label">ثانية راحة</div></div>
              </div>

              <div className="coach-note">
                <div className="coach-head">
                  <div className="coach-avatar">🏋🏻‍♂️</div>
                  <div className="coach-name">المدرب سعود</div>
                </div>
                <div className="coach-text">{ex.note}</div>
              </div>

              <div className="sets-label">📝 سجّل أداءك</div>
              {exSets.map((s, i) => (
                <div className="set-row" key={i}>
                  <div className="set-num">{i + 1}</div>
                  <div className="set-input-wrap">
                    <input
                      type="number" className="set-input" placeholder="كجم" min={0}
                      value={s.weight} onChange={(e) => updateSet(ex, i, 'weight', e.target.value)}
                    />
                    <input
                      type="number" className="set-input" placeholder={ex.reps} min={0}
                      value={s.reps} onChange={(e) => updateSet(ex, i, 'reps', e.target.value)}
                    />
                  </div>
                  <button
                    className={s.done ? 'set-check done' : 'set-check'}
                    aria-label="إنهاء الجولة"
                    onClick={() => toggleSetDone(ex, i)}
                  >
                    {s.done ? '✓' : i + 1}
                  </button>
                </div>
              ))}

              {prKey === k && <div className="pr-banner">🏆 رقم شخصي جديد! تجاوزت نفسك</div>}

              {restKey === k && (
                <div className="rest-card">
                  <div className="rest-circle">{remaining}</div>
                  <div className="rest-text">⏱️ وقت الراحة... استعد للجولة التالية</div>
                  <button className="btn-ghost" onClick={() => { rest.stop(); setRestKey(null); }}>
                    تخطي
                  </button>
                </div>
              )}

              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: 16 }}
                onClick={() => handleToggleDone(ex)}
              >
                {completed ? '✓ تـم' : 'تـم'}
              </button>
            </div>
          </div>
        );
      })}

      {dayComplete && (
        <div className="workout-complete-card">
          <div className="wc-icon">🏆</div>
          <div className="wc-title">أحسنت! أكملت {day.label}</div>
          <div className="wc-sub">{day.exercises.length} تمارين، استمرارية رائعة في رحلتك</div>
          <div className="wc-xp">⚡ +{day.exercises.length * 15 + 10} XP لهذا اليوم</div>
          {day.id === 'legs_b' && (
            <div className="wc-xp" style={{ marginTop: 8 }}>
              👑 أسبوع كامل من النظام! يا بطل حقيقي
            </div>
          )}
        </div>
      )}

      {hint && <div className="hint-msg ok">{hint}</div>}
    </div>
  );
}
