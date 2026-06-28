/* ===================================================================
   Streak.tsx — السلسلة + الرفيق الذكي + المستويات + الألقاب
   صفحة عرض تقرأ كل قيمها من useCore المركزي (لا حالة مستقلة).
   =================================================================== */

import { useCore, LEVELS } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import PageHero from '../components/PageHero';

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

/* YYYY-MM-DD من كائن Date */
const toDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

export default function Streak({ embedded = false }: { embedded?: boolean }) {
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

  /* عدد أنواع النشاط في يوم معيّن (0..4) لتحديد مستوى الخريطة الحرارية */
  const activityLevel = (dateStr: string): number => {
    let count = 0;
    if (moodLog.some((m) => m.date === dateStr)) count++;
    if (gratitudeLog.some((g) => g.date === dateStr)) count++;
    if (quranMinutes.some((q) => q.date === dateStr)) count++;
    if (notes.some((n) => n.date === dateStr)) count++;
    return count;
  };

  /* بناء خلايا الخريطة الحرارية (365 يوم) مرتّبة في أعمدة أسبوعية */
  const heatmapData = (() => {
    const today = new Date();
    /* ابدأ من أول الأسبوع (الأحد) قبل 364 يوماً */
    const start = new Date(today);
    start.setDate(today.getDate() - 364);
    /* اضبط على بداية الأسبوع (الأحد) */
    start.setDate(start.getDate() - start.getDay());

    const weeks: { date: string; level: number; isFuture: boolean }[][] = [];
    const todayStr = toDateStr(today);
    let cur = new Date(start);

    while (cur <= today || weeks[weeks.length - 1]?.length < 7) {
      if (weeks.length === 0 || weeks[weeks.length - 1].length === 7) {
        weeks.push([]);
      }
      const dateStr = toDateStr(cur);
      const isFuture = dateStr > todayStr;
      weeks[weeks.length - 1].push({
        date: dateStr,
        level: isFuture ? -1 : activityLevel(dateStr),
        isFuture,
      });
      cur.setDate(cur.getDate() + 1);
    }
    return weeks;
  })();

  /* تسميات الأشهر: لكل عمود نحسب الشهر الأول فيه */
  const monthLabels = heatmapData.map((week) => {
    const firstDay = week[0].date;
    const d = new Date(firstDay + 'T00:00:00');
    return { col: 0, month: d.getDate() <= 7 ? ARABIC_MONTHS[d.getMonth()] : '' };
  });

  /* مرحلة الرفيق الحالية + نسبة التقدّم للمرحلة التالية */
  const stageIdx = (() => {
    let idx = 0;
    COMPANION_STAGES.forEach((s, i) => {
      if (streak.current >= s.min) idx = i;
    });
    return idx;
  })();
  const stage = COMPANION_STAGES[stageIdx];

  /* رسالة الرفيق التفاعلية حسب حالة السلسلة */
  const companionMsg =
    streak.current === 0
      ? 'يلا نبدأ من جديد، أنا معك! 🌱'
      : streak.current < 7
        ? `${streak.current} أيام وما وقفت — كفو، كمّل! 💪`
        : streak.current < 30
          ? 'ماشي عدّال يا بطل، خلّك ثابت 🔥'
          : 'إنجاز خرافي! أنت قدوة لغيرك 👑';
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
      {!embedded && <BackButton />}
      {!embedded && <XPBar />}

      <PageHero variant="primary" centered stars>
        <span className="flame-icon">🔥</span>
        <div className="flame-num">{streak.current}</div>
        <div className="flame-label">أيام متتالية من الانضباط</div>
        <div className="flame-best">🏅 أطول سلسلة: <strong>{streak.longest}</strong> يوم</div>
      </PageHero>

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

      <h2 className="section-title">🗓️ خريطة العام</h2>
      <div className="card heatmap-card">
        <div className="heatmap-wrap">
          <div className="heatmap-months">
            {heatmapData.map((_, wi) =>
              monthLabels[wi].month ? (
                <span key={wi} className="hm-month-label" style={{ gridColumn: wi + 1 }}>
                  {monthLabels[wi].month}
                </span>
              ) : null,
            )}
          </div>
          <div className="heatmap-grid">
            {heatmapData.map((week, wi) => (
              <div className="hm-col" key={wi}>
                {week.map((cell, di) => (
                  <div
                    key={di}
                    className={`hm-cell lv-${cell.isFuture ? 'future' : cell.level}`}
                    title={cell.isFuture ? '' : cell.date}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="heatmap-legend">
          <span className="hm-legend-label">أقل</span>
          {[0, 1, 2, 3, 4].map((lv) => (
            <div key={lv} className={`hm-cell lv-${lv}`} />
          ))}
          <span className="hm-legend-label">أكثر</span>
        </div>
      </div>

      <div className="card companion-card">
        <span className="companion-emoji">{stage.emoji}</span>
        <div className="companion-name">رفيقك في الرحلة</div>
        <div className="companion-stage">{stage.stage}</div>
        <div className="companion-msg">{companionMsg}</div>
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
