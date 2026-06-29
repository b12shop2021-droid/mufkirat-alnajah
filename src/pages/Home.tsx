/* ===================================================================
   Home.tsx — الصفحة الرئيسية (لوحة معلومات)
   ملخص ذكي + همسة الفجر (تتغير حسب أداء الأمس) + شبكة الوصول + نظرة الأسبوع.
   كل القيم من useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCore } from '../core/useCore';
import XPBar from '../components/XPBar';
import { getDailyQuote } from '../data/quotes';

const DAY_NAMES = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

const MOTIVATIONS = [
  'كل خطوة صغيرة تقرّبك لحلمك — لا تستهين فيها',
  'النجاح عادة يومية، مو ضربة حظ',
  'لا تقارن بدايتك بنهايات غيرك — قارن نفسك بأمسك',
  'انضباطك اليوم هو فخرك بكرة',
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

  const greeting = s.profile.nickname || s.profile.name || 'بطل';

  /* التاريخ الهجري (أم القرى) — لمسة سعودية */
  const hijriDate = (() => {
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        weekday: 'long', day: 'numeric', month: 'long',
      }).format(new Date());
    } catch {
      return '';
    }
  })();

  /* تحية حسب توقيت اليوم (لهجة سعودية شبابية) */
  const getTimeGreet = () => {
    const h = new Date().getHours();
    if (h >= 4 && h < 11) return { text: 'صباح النشاط', badge: '🌅', night: false };
    if (h >= 11 && h < 15) return { text: 'نهارك سعيد', badge: '🌞', night: false };
    if (h >= 15 && h < 18) return { text: 'مساء الخير', badge: '🌇', night: false };
    if (h >= 18 && h < 23) return { text: 'مساك ورد', badge: '🌙', night: true };
    return { text: 'ليلة هادئة', badge: '✨', night: true };
  };
  const tg = getTimeGreet();

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

  /* صيغة الخطاب حسب الجنس */
  const fem = s.profile.gender === 'female';
  const v = (m: string, f: string) => (fem ? f : m);

  /* همسة الفجر حسب أداء الأمس (لهجة سعودية شبابية) */
  const yChips = activityOn(dateBefore(1));
  const whisper =
    yChips >= 3
      ? `🔥 صباح النجاح يا ${greeting}! أمس كان ولا أروع — ${v('كمّل', 'كمّلي')} عالخطى`
      : yChips >= 1
        ? `💪 يومٌ جديد يا ${greeting} — فرصتك ${v('تكون', 'تكونين')} أحسن من أمس`
        : `🌱 ${v('ابدأ', 'ابدئي')} بخطوة صغيرة يا ${greeting} — المهم ما ${v('توقف', 'توقفين')}`;

  /* خطوتك اليوم — اقتراح ذكي لأهم إجراء ناقص */
  const gratToday = s.gratitudeLog.filter((g) => g.date === today).length;
  const moodToday = s.moodLog.some((m) => m.date === today);
  const next =
    routine.length === 0
      ? { t: '✍️ جهّز روتينك اليومي', to: '/routine' }
      : doneToday < routine.length
        ? { t: '☀️ كمّل روتين اليوم', to: '/routine' }
        : !moodToday
          ? { t: '😊 سجّل مزاجك اليوم', to: '/mood' }
          : gratToday < 3
            ? { t: '🙏 اكتب شكر اليوم', to: '/notes' }
            : { t: '🎉 يومك كامل، كفو!', to: '/achievements' };

  /* نظرة الأسبوع */
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = dateBefore(6 - i);
    return { day: DAY_NAMES[new Date(date + 'T00:00:00').getDay()], v: Math.round((activityOn(date) / 5) * 100) };
  });

  const motiv = MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];

  /* نِيّة اليوم — كلمة/جملة تركيز يكتبها البطل */
  const intentionToday = s.dailyIntention?.date === today ? s.dailyIntention.text : '';
  const [intentDraft, setIntentDraft] = useState('');
  const [editingIntent, setEditingIntent] = useState(false);
  const [showIntentArchive, setShowIntentArchive] = useState(false);
  const saveIntent = () => {
    if (intentDraft.trim() === '') return;
    core.setDailyIntention(intentDraft);
    setIntentDraft('');
    setEditingIntent(false);
  };

  /* عدّاد الالتزام: كم يوم متتالي (شامل اليوم) كتبت فيه نِيّة */
  const intentStreak = (() => {
    const dates = new Set(s.intentionLog.map((e) => e.date));
    let n = 0;
    for (let i = 0; ; i++) {
      if (dates.has(dateBefore(i))) n++;
      else break;
    }
    return n;
  })();

  const tiles = [
    { icon: '/icons/more.webp', label: 'الهمّة', to: '/more', streak: s.streak.current },
    { icon: '/icons/routine.webp', label: 'روتيني الصح', to: '/routine' },
    { icon: '/icons/goals.webp', label: 'الأهداف', to: '/goals' },
    { icon: '/icons/expenses.webp', label: 'دراهمي', to: '/expenses' },
    { icon: '/icons/workouts.webp', label: 'قم لـ جيم', to: '/workouts' },
    { icon: '/icons/meals.webp', label: 'أكلي الصح', to: '/meals' },
    { icon: '/icons/analytics.webp', label: 'إنجازي الأسبوعي', to: '/analytics' },
    { icon: '/icons/pledges.webp', label: 'وعد الحر دين', to: '/pledges' },
    { icon: '/icons/achievements.webp', label: 'منصة التتويج', to: '/achievements' },
  ];

  return (
    <div className="page">
      <XPBar />

      <div className={tg.night ? 'home-hero night' : 'home-hero'}>
        <div className="home-hero-stars" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="hero-star" style={{ ['--i' as string]: i }} />
          ))}
        </div>
        <div className="home-hero-row">
          <div>
            <div className="home-hero-greet">
              {tg.badge} {tg.text} يا {greeting}
            </div>
            {hijriDate && <div className="home-hero-date">🗓️ {hijriDate} هـ</div>}
            <div className="home-hero-title">حقق حلمك وكن ملهماً ✨</div>
          </div>
          <div className="home-hero-badge">{tg.badge}</div>
        </div>
        <div className="home-progress-wrap">
          <span className="home-progress-label">{dayPct}%</span>
          <div className="home-progress-bg">
            <div className="home-progress-fill" style={{ width: `${dayPct}%` }} />
          </div>
          <span className="home-progress-label">إنجاز يومك</span>
        </div>
      </div>

      <div className={intentionToday && !editingIntent ? 'intent-card set' : 'intent-card'}>
        {intentionToday && !editingIntent ? (
          <>
            <div className="intent-head">
              <span className="intent-tag">🎯 نِيّة اليوم</span>
              <button
                className="intent-edit"
                aria-label="غيّر نِيّتك"
                onClick={() => {
                  setIntentDraft(intentionToday);
                  setEditingIntent(true);
                }}
              >
                ✏️
              </button>
            </div>
            <div className="intent-text">«{intentionToday}»</div>
            <div className="intent-sub">
              عليها نمشي اليوم — وش تبي أكثر من كذا 💪
              {intentStreak > 1 && <> · 🔥 {intentStreak} يوم متتالي على نِيّة</>}
            </div>
            {s.intentionLog.length > 1 && (
              <>
                <button
                  className="intent-archive-toggle"
                  onClick={() => setShowIntentArchive((v) => !v)}
                >
                  📿 نِيّاتك السابقة ({s.intentionLog.length}) {showIntentArchive ? '▲' : '▾'}
                </button>
                {showIntentArchive && (
                  <div className="intent-archive">
                    {s.intentionLog.filter((e) => e.date !== today).slice(0, 14).map((e) => (
                      <div className="intent-archive-row" key={e.date}>
                        <span className="intent-archive-date">{e.date}</span>
                        <span className="intent-archive-text">«{e.text}»</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="intent-tag">🎯 وش نِيّتك اليوم يا {greeting}؟</div>
            <div className="intent-sub">اكتب كلمة أو جملة تركّز عليها — مثل «صبر» أو «أنجز مشروعي»</div>
            <div className="intent-input-row">
              <input
                className="intent-input"
                type="text"
                maxLength={60}
                value={intentDraft}
                placeholder="نِيّة اليوم..."
                onChange={(e) => setIntentDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveIntent()}
              />
              <button className="intent-btn" onClick={saveIntent} disabled={intentDraft.trim() === ''}>
                {v('ثبّتها', 'ثبّتيها')} ✋
              </button>
            </div>
          </>
        )}
      </div>

      {routine.length > 0 && doneToday === routine.length && (
        <div className="day-done-badge">🏅 أنجزت يومك كامل — كفووو!</div>
      )}

      <div className="greet-strip">{whisper}</div>

      <button className="next-step" onClick={() => navigate(next.to)}>
        <span>{next.t}</span>
        <span>←</span>
      </button>

      <div className={core.weekly.done ? 'weekly-card done' : 'weekly-card'}>
        <div className="weekly-head">
          <span className="weekly-tag">🎯 تحدّي الأسبوع</span>
          <span className="weekly-reward">+{core.weekly.def.reward} نقطة</span>
        </div>
        <div className="weekly-title">
          {core.weekly.def.emoji} {core.weekly.def.title}
        </div>
        <div className="weekly-hint">{core.weekly.def.hint}</div>
        {core.weekly.done ? (
          <div className="weekly-done-badge">✅ {v('أنجزته', 'أنجزتِه')} — كفو! نشوفك بالتحدّي الجاي</div>
        ) : (
          <button className="weekly-btn" onClick={() => core.completeWeeklyChallenge()}>
            {v('أنجزت التحدّي', 'أنجزتِ التحدّي')} ✋
          </button>
        )}
      </div>

      <h2 className="section-title">🧭 رحلتك اليوم</h2>
      <div className="home-grid">
        {tiles.map((t) => (
          <button key={t.label + t.to} className="tile" onClick={() => navigate(t.to)}>
            <div className={t.label === 'الهمّة' ? 'tile-circle glow' : 'tile-circle'}>
              {t.icon.startsWith('/') ? (
                <img className="tile-img" src={t.icon} alt="" width={42} height={42} loading="lazy" decoding="async" />
              ) : (
                <span>{t.icon}</span>
              )}
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

      {/* اقتباس اليوم */}
      {(() => {
        const lastMood = s.moodLog.length > 0 ? s.moodLog[s.moodLog.length - 1].moodIdx : undefined;
        const q = getDailyQuote(lastMood);
        return (
          <div className="quote-card">
            <div className="quote-mark">"</div>
            <div className="quote-text">{q.text}</div>
            <div className="quote-author">— {q.author}</div>
          </div>
        );
      })()}

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

      <button className="fab" aria-label="خطوة سريعة" onClick={() => navigate(next.to)}>
        +
      </button>
    </div>
  );
}
