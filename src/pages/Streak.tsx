/* ===================================================================
   Streak.tsx — السلسلة + الرفيق الذكي + المستويات + الألقاب
   صفحة عرض تقرأ كل قيمها من useCore المركزي (لا حالة مستقلة).
   =================================================================== */

import { useCore, LEVELS } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';

/* مراحل الرفيق الذكي حسب طول السلسلة (0/7/14/30/90) */
const COMPANION_STAGES = [
  { min: 0, emoji: '🌱', stage: 'بذرة صغيرة بدأت بالنمو معك' },
  { min: 7, emoji: '🌿', stage: 'نبتة صغيرة تكبر يوماً بعد يوم' },
  { min: 14, emoji: '🪴', stage: 'شتلة قوية متجذرة بثبات' },
  { min: 30, emoji: '🌳', stage: 'شجرة راسخة تكبر بفخر' },
  { min: 90, emoji: '🌳✨', stage: 'شجرة مزهرة، ملهمة لمن حولها' },
];

/* تاريخ YYYY-MM-DD قبل offset يوماً */
const dateBefore = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
};

export default function Streak() {
  const core = useCore();
  const level = core.level;
  const { streak, moodLog, gratitudeLog, quranMinutes, notes, goals } = core.state;

  /* مفتاح الشهر الحالي لمعرفة حالة بطاقة الحماية */
  const thisMonth = `${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1,
  ).padStart(2, '0')}`;
  const shieldUsed = streak.freezeMonth === thisMonth;

  /* هل يوجد نشاط مسجّل في تاريخ معيّن؟ */
  const hasActivity = (dateStr: string): boolean =>
    moodLog.some((m) => m.date === dateStr) ||
    gratitudeLog.some((g) => g.date === dateStr) ||
    quranMinutes.some((q) => q.date === dateStr) ||
    notes.some((n) => n.date === dateStr);

  /* مرحلة الرفيق الحالية + نسبة التقدّم للمرحلة التالية */
  const stageIdx = (() => {
    let idx = 0;
    COMPANION_STAGES.forEach((s, i) => {
      if (streak.current >= s.min) idx = i;
    });
    return idx;
  })();
  const stage = COMPANION_STAGES[stageIdx];
  const nextStage = COMPANION_STAGES[stageIdx + 1];
  const companionPct = nextStage
    ? Math.round(((streak.current - stage.min) / (nextStage.min - stage.min)) * 100)
    : 100;

  /* عدد خطوات الأهداف المنجزة (مؤشر "مهام منجزة") */
  const doneSteps = goals.reduce(
    (sum, g) => sum + g.steps.filter((s) => s.done).length,
    0,
  );
  const readJuz = Object.keys(core.state.quranJuz).length;

  /* الألقاب — تُحسب من بيانات حقيقية */
  const badges = [
    {
      icon: '🌅',
      title: 'حارس الفجر',
      desc: '30 يوم انضباط متتالي',
      cur: streak.current,
      goal: 30,
    },
    {
      icon: '📖',
      title: 'خاتم القرآن',
      desc: 'ختمة كاملة (30 جزء)',
      cur: readJuz,
      goal: 30,
    },
    {
      icon: '🎯',
      title: 'صانع القرار',
      desc: '100 مهمة منجزة',
      cur: doneSteps,
      goal: 100,
    },
    {
      icon: '🔥',
      title: 'لا يُقهر',
      desc: 'أطول سلسلة 30 يوم',
      cur: streak.longest,
      goal: 30,
    },
    {
      icon: '🙏',
      title: 'قلب شاكر',
      desc: '50 لحظة شكر',
      cur: gratitudeLog.length,
      goal: 50,
    },
  ];

  return (
    <div className="page">
      <BackButton />
      <XPBar />

      <div className="flame-hero">
        <span className="flame-icon">🔥</span>
        <div className="flame-num">{streak.current}</div>
        <div className="flame-label">أيام متتالية من الانضباط</div>
        <div className="flame-best">🏅 أطول سلسلة: <strong>{streak.longest}</strong> يوم</div>
      </div>

      <div className="card shield-card">
        <div className="shield-icon">🛡️</div>
        <div style={{ flex: 1 }}>
          <div className="shield-title">يوم الصفر المسموح</div>
          <div className="shield-sub">
            بطاقة حماية شهرية تلقائية تحافظ على سلسلتك لو فوّتّ يوماً واحداً فقط
          </div>
        </div>
        <div className={shieldUsed ? 'shield-status used' : 'shield-status available'}>
          {shieldUsed ? 'استُخدمت' : 'متاحة ✓'}
        </div>
      </div>

      <h2 className="section-title">📅 آخر 14 يوماً</h2>
      <div className="card">
        <div className="days-row">
          {Array.from({ length: 14 }, (_, i) => 13 - i).map((offset) => {
            const dateStr = dateBefore(offset);
            const dayNum = new Date(dateStr + 'T00:00:00').getDate();
            let cls = 'day-cell';
            if (offset === 0) cls += ' dc-today';
            else if (hasActivity(dateStr)) cls += ' dc-done';
            return (
              <div className={cls} key={offset}>
                {dayNum}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card companion-card">
        <span className="companion-emoji">{stage.emoji}</span>
        <div className="companion-name">رفيقك في الرحلة</div>
        <div className="companion-stage">{stage.stage}</div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${companionPct}%` }} />
        </div>
      </div>

      <h2 className="section-title">🏆 مستويات النجاح</h2>
      <div className="levels-grid">
        {LEVELS.map((name, i) => {
          const unlocked = i <= level;
          const current = i === level;
          let cls = 'level-tile';
          if (unlocked) cls += ' unlocked';
          if (current) cls += ' current';
          return (
            <div className={cls} key={name}>
              {current && <div className="lt-current-badge">الحالي</div>}
              <div className="lt-icon">{name.split(' ').pop()}</div>
              <div className={unlocked ? 'lt-name' : 'lt-name locked'}>
                {name.replace(/\s*\S+$/, '')}
              </div>
              <div className="lt-xp">{i * 100}+ XP</div>
            </div>
          );
        })}
      </div>

      <h2 className="section-title" style={{ marginTop: 18 }}>
        🏷️ الألقاب المكتسبة
      </h2>
      <div className="badges-scroll">
        {badges.map((b) => {
          const earned = b.cur >= b.goal;
          return (
            <div className={earned ? 'badge-card earned' : 'badge-card locked'} key={b.title}>
              <div className="badge-emoji">{b.icon}</div>
              <div className="badge-title">{b.title}</div>
              <div className="badge-desc">{b.desc}</div>
              <div className="badge-progress">
                {earned ? 'مكتسب ✓' : `${Math.min(b.cur, b.goal)} / ${b.goal}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
