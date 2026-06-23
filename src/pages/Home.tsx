/* ===================================================================
   Home.tsx — الصفحة الرئيسية (لوحة معلومات)
   ملخص ذكي + همسة الفجر (تتغير حسب أداء الأمس) + شبكة الوصول + نظرة الأسبوع.
   كل القيم من useCore المركزي.
   =================================================================== */

import { useLocation } from 'wouter';
import { useCore } from '../core/useCore';
import XPBar from '../components/XPBar';

const DAY_NAMES = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

const MOTIVATIONS = [
  'كل خطوة تقدّم نحو أحلامك تستحق الاحتفال',
  'النجاح مجموع جهود صغيرة تتكرر كل يوم',
  'لا تقارن بدايتك بنهايات الآخرين، قارن نفسك بأمسك',
  'الانضباط جسر بين الأهداف والإنجاز',
];

const dateBefore = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Home() {
  const core = useCore();
  const s = core.state;
  const [, navigate] = useLocation();
  const today = dateBefore(0);

  const greeting = s.profile.nickname || s.profile.name || 'يا بطل';

  /* إنجاز اليوم من الروتين */
  const routine = [...s.routine.morning, ...s.routine.evening];
  const doneToday = routine.filter((t) => t.doneDate === today).length;
  const dayPct = routine.length ? Math.round((doneToday / routine.length) * 100) : 0;

  /* نشاط يوم معيّن */
  const activityOn = (date: string) =>
    (s.moodLog.some((m) => m.date === date) ? 1 : 0) +
    (s.gratitudeLog.some((g) => g.date === date) ? 1 : 0) +
    (s.quranMinutes.some((q) => q.date === date) ? 1 : 0) +
    (s.notes.some((n) => n.date === date) ? 1 : 0) +
    (s.sleepLog.some((e) => e.date === date) ? 1 : 0);

  /* همسة الفجر حسب أداء الأمس */
  const yChips = activityOn(dateBefore(1));
  const whisper =
    yChips >= 3
      ? `✨ صباح النجاح يا ${greeting}! أمسك كان رائعاً — واصل التألق 🥇`
      : yChips >= 1
        ? `🌅 يوم جديد يا ${greeting}، فرصة لتكون أفضل من الأمس 💪`
        : `🌱 ابدأ يومك بخطوة صغيرة يا ${greeting} — الرحلة لا تُقاس بالكمال`;

  /* نظرة الأسبوع */
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = dateBefore(6 - i);
    return { day: DAY_NAMES[new Date(date + 'T00:00:00').getDay()], v: Math.round((activityOn(date) / 5) * 100) };
  });

  const motiv = MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];

  const tiles = [
    { icon: '📖', label: 'مفكرة النجاح', to: '/more', streak: s.streak.current },
    { icon: '🔄', label: 'العادات', to: '/routine' },
    { icon: '🎯', label: 'الأهداف', to: '/goals' },
    { icon: '💳', label: 'المصاريف', to: '/expenses' },
    { icon: '🏋️', label: 'التمارين', to: '/workouts' },
    { icon: '🍽️', label: 'الوجبات', to: '/meals' },
    { icon: '📊', label: 'التحليلات', to: '/analytics' },
    { icon: '🛡️', label: 'العهود', to: '/pledges' },
    { icon: '🏆', label: 'إنجازاتي', to: '/achievements' },
  ];

  return (
    <div className="page">
      <XPBar />

      <div className="home-hero">
        <div className="home-hero-row">
          <div>
            <div className="home-hero-title">حقق حلمك وكن ملهماً ✨</div>
            <div className="home-hero-sub">{s.profile.name || 'مرحباً بك'}</div>
          </div>
          <div className="home-hero-badge">🏆</div>
        </div>
        <div className="home-progress-wrap">
          <span className="home-progress-label">{dayPct}%</span>
          <div className="home-progress-bg">
            <div className="home-progress-fill" style={{ width: `${dayPct}%` }} />
          </div>
          <span className="home-progress-label">إنجاز اليوم</span>
        </div>
      </div>

      <div className="greet-strip">{whisper}</div>

      <h2 className="section-title">🧭 رحلتك اليوم</h2>
      <div className="home-grid">
        {tiles.map((t) => (
          <button key={t.label + t.to} className="tile" onClick={() => navigate(t.to)}>
            <div className={t.label === 'مفكرة النجاح' ? 'tile-circle glow' : 'tile-circle'}>
              <span>{t.icon}</span>
              {t.streak ? <div className="tile-streak-dot">{t.streak}</div> : null}
            </div>
            <div className="tile-label">{t.label}</div>
          </button>
        ))}
      </div>

      <div className="motiv-card">
        <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>✨</div>
        <div className="motiv-text">{motiv}</div>
      </div>

      <div className="week-card">
        <div className="week-head">
          <span className="week-head-title">📈 نشاط الأسبوع</span>
        </div>
        <div className="week-bars">
          {week.map((x, i) => (
            <div className="wb-col" key={i}>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--primary)' }}>{x.v}%</div>
              <div className="wb-bar" style={{ height: `${Math.max(6, x.v * 0.6)}px` }} />
              <div className="wb-lbl">{x.day}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
