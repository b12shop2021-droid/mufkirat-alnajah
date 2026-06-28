/* ===================================================================
   WeeklyWrapped.tsx — قصة الأسبوع القابلة للمشاركة
   ملخص نشاط آخر 7 أيام بتصميم بطاقة احتفالية + زر نسخ/مشاركة.
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../core/useCore';

const toDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const dateBefore = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return toDateStr(d);
};

const ARABIC_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function WeeklyWrapped({ embedded = false }: { embedded?: boolean }) {
  const core = useCore();
  const s = core.state;
  const [copied, setCopied] = useState(false);

  /* نطاق الأسبوع الماضي (آخر 7 أيام بما فيها اليوم) */
  const days = Array.from({ length: 7 }, (_, i) => dateBefore(6 - i));
  const [start, end] = [days[0], days[6]];

  const inRange = (date: string) => date >= start && date <= end;

  /* إحصائيات الأسبوع */
  const stats = {
    mood: s.moodLog.filter((m) => inRange(m.date)).length,
    gratitude: s.gratitudeLog.filter((g) => inRange(g.date)).length,
    quran: s.quranMinutes.filter((q) => inRange(q.date)).reduce((sum, q) => sum + q.minutes, 0),
    notes: s.notes.filter((n) => inRange(n.date)).length,
    workouts: s.workoutLogs.filter((w) => inRange(w.date)).length,
    routine: (() => {
      const all = [...s.routine.morning, ...s.routine.evening];
      return all.filter((t) => inRange(t.doneDate)).length;
    })(),
    sleep: s.sleepLog.filter((sl) => inRange(sl.date)).length,
    goals: s.goals.filter((g) => g.steps.some((st) => st.done)).length,
  };

  /* أكثر يوم نشاطاً */
  const dayActivity = days.map((d) => ({
    label: ARABIC_DAYS[new Date(d + 'T00:00:00').getDay()],
    count:
      (s.moodLog.some((m) => m.date === d) ? 1 : 0) +
      (s.gratitudeLog.some((g) => g.date === d) ? 1 : 0) +
      (s.quranMinutes.some((q) => q.date === d) ? 1 : 0) +
      (s.notes.some((n) => n.date === d) ? 1 : 0) +
      (s.workoutLogs.some((w) => w.date === d) ? 1 : 0),
  }));
  const bestDay = dayActivity.reduce((a, b) => (b.count > a.count ? b : a), dayActivity[0]);
  const maxCount = Math.max(...dayActivity.map((d) => d.count), 1);

  /* جملة التشجيع */
  const totalActions = Object.values(stats).reduce((a, b) => a + b, 0);
  const encouragement =
    totalActions === 0
      ? 'ما في تسجيل هذا الأسبوع — يلا نبدأ من الأسبوع الجاي 💪'
      : totalActions < 10
        ? 'بداية كويسة — كل خطوة تحسب! 🌱'
        : totalActions < 25
          ? 'أسبوع منتج — أنت في الطريق الصح 🔥'
          : 'أسبوع خرافي — انت واحد من المميزين 👑';

  /* نص المشاركة */
  const shareText = `📊 قصة أسبوعي في الهمّة (${start} ← ${end})

🎯 ${stats.routine} مهمة روتين منجزة
🙏 ${stats.gratitude} لحظة امتنان
📖 ${stats.quran} دقيقة قرآن
💪 ${stats.workouts} تمرين
😊 ${stats.mood} يوم سجّلت فيه مزاجي
📝 ${stats.notes} ملاحظة

${encouragement}
#مفكرة_النجاح`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        /* المستخدم ألغى — نرجع للنسخ */
      }
    }
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  /* تنسيق التاريخ للعرض */
  const fmt = (d: string) => {
    const [, m, day] = d.split('-');
    return `${parseInt(day)}/${parseInt(m)}`;
  };

  return (
    <div className={embedded ? '' : 'page'}>
      <div className="wrapped-card">
        <div className="wrapped-header">
          <div className="wrapped-title">قصة الأسبوع ✨</div>
          <div className="wrapped-range">{fmt(start)} — {fmt(end)}</div>
        </div>

        <div className="wrapped-grid">
          <div className="wrapped-stat">
            <span className="ws-icon">🔄</span>
            <span className="ws-num">{stats.routine}</span>
            <span className="ws-label">مهمة روتين</span>
          </div>
          <div className="wrapped-stat">
            <span className="ws-icon">🙏</span>
            <span className="ws-num">{stats.gratitude}</span>
            <span className="ws-label">امتنان</span>
          </div>
          <div className="wrapped-stat">
            <span className="ws-icon">📖</span>
            <span className="ws-num">{stats.quran}</span>
            <span className="ws-label">دقيقة قرآن</span>
          </div>
          <div className="wrapped-stat">
            <span className="ws-icon">💪</span>
            <span className="ws-num">{stats.workouts}</span>
            <span className="ws-label">تمرين</span>
          </div>
          <div className="wrapped-stat">
            <span className="ws-icon">😊</span>
            <span className="ws-num">{stats.mood}</span>
            <span className="ws-label">يوم مزاج</span>
          </div>
          <div className="wrapped-stat">
            <span className="ws-icon">📝</span>
            <span className="ws-num">{stats.notes}</span>
            <span className="ws-label">ملاحظة</span>
          </div>
        </div>

        <div className="wrapped-days">
          <div className="wd-title">أنشط أيام الأسبوع</div>
          <div className="wd-bars">
            {dayActivity.map((d) => (
              <div className="wd-col" key={d.label}>
                <div
                  className={`wd-bar ${d.label === bestDay.label && d.count > 0 ? 'best' : ''}`}
                  style={{ height: `${Math.max((d.count / maxCount) * 52, 4)}px` }}
                />
                <div className="wd-name">{d.label.slice(0, 2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="wrapped-msg">{encouragement}</div>

        <button className={`wrapped-share-btn ${copied ? 'copied' : ''}`} onClick={handleShare}>
          {copied ? '✅ تم النسخ!' : '📤 شارك قصتك'}
        </button>
      </div>
    </div>
  );
}
