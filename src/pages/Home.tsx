/* ===================================================================
   Home.tsx — الصفحة الرئيسية (لوحة معلومات)
   ملخص ذكي + همسة الفجر (تتغير حسب أداء الأمس) + شبكة الوصول + نظرة الأسبوع.
   كل القيم من useCore المركزي.
   =================================================================== */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useCore } from '../core/useCore';
import XPBar from '../components/XPBar';
import RescueTimer from '../components/RescueTimer';
import RelaxTipButton from '../components/RelaxTipButton';
import { fireConfetti } from '../components/Confetti';
import { getDailyQuote } from '../data/quotes';
import { getRandomWelcome } from '../data/welcomeMessages';
import { DAY_DONE_POPUPS, STREAK_MILESTONE_POPUPS, pickPopup, pickLine, AWAY_LINES, getHarvestBanner, SUNDAY_BANNER, NAG_LINES, AFTERNOON_DONE_MSG, AFTERNOON_LATE_MSG, personalize, type PopupMsg } from '../data/vibes';

const DAY_NAMES = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

/* محيط حلقة التقدّم الدائرية (نصف القطر 26) — ثابت لحساب stroke-dashoffset */
const RING_CIRC = 2 * Math.PI * 26;

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
  /* الاسم الشخصي للبوستات المحفزة (الاسم ← اللقب ← «بطل») */
  const personalName = s.profile.name || s.profile.nickname || 'بطل';

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

  /* التاريخ الميلادي */
  const gregorianDate = (() => {
    try {
      return new Intl.DateTimeFormat('ar-SA', {
        day: 'numeric', month: 'long', year: 'numeric',
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
    if (h >= 18 && h < 23) return { text: 'مسائك ورد وسعادة', badge: '🌸', night: true };
    return { text: 'ليلة هادئة', badge: '✨', night: true };
  };
  const tg = getTimeGreet();

  /* إنجاز اليوم من الروتين */
  const routine = [...s.routine.morning, ...s.routine.evening];
  const doneToday = routine.filter((t) => t.doneDate === today).length;
  const dayPct = routine.length ? Math.round((doneToday / routine.length) * 100) : 0;

  /* عدّاد فتحات الرئيسية اليوم — يزيد مرة واحدة فقط عند فتح الصفحة (lazy init) */
  const [opensToday] = useState(() => {
    try {
      const key = `alhimmah_opens_${today}`;
      const n = Number(localStorage.getItem(key) ?? '0') + 1;
      localStorage.setItem(key, String(n));
      return n;
    } catch {
      return 0;
    }
  });

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

  /* نظرة الأسبوع — من الأحد (بداية الأسبوع) للسبت، يُعرض من اليمين لليسار */
  const todayDow = new Date().getDay(); // الأحد = 0 … السبت = 6
  const week = Array.from({ length: 7 }, (_, i) => {
    // i=0 → الأحد، i=6 → السبت
    const date = dateBefore(todayDow - i);
    return { day: DAY_NAMES[i], v: Math.round((activityOn(date) / 5) * 100) };
  });

  const motiv = MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];

  /* نِيّة اليوم — كلمة/جملة تركيز يكتبها البطل */
  const intentionToday = s.dailyIntention?.date === today ? s.dailyIntention.text : '';
  const [intentDraft, setIntentDraft] = useState('');
  const [editingIntent, setEditingIntent] = useState(false);
  const [showIntentArchive, setShowIntentArchive] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  /* بطاقة ترحيب عشوائية — تظهر مرة كل جلسة وتنغلق بضغطة */
  const [welcome] = useState(() => {
    try {
      if (sessionStorage.getItem('alhimmah_welcome_seen')) return null;
    } catch { /* sessionStorage غير متاح */ }
    return getRandomWelcome();
  });
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const dismissWelcome = () => {
    setWelcomeOpen(false);
    try { sessionStorage.setItem('alhimmah_welcome_seen', '1'); } catch { /* تجاهل */ }
  };

  /* بطاقة «قفل اليوم» — تظهر مرة واحدة باليوم عند إكمال ١٠٠٪ من الروتين */
  const dayComplete = routine.length > 0 && doneToday === routine.length;
  const [dayPopup, setDayPopup] = useState<PopupMsg | null>(null);
  useEffect(() => {
    if (!dayComplete) return;
    const key = `alhimmah_dayclose_${today}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
    } catch { /* تجاهل */ }
    setDayPopup(pickPopup(DAY_DONE_POPUPS));
  }, [dayComplete, today]);

  /* الكونفيتي ينطلق بعد ظهور البطاقة — وقتها مستمع الكونفيتي جاهز أكيد */
  useEffect(() => {
    if (dayPopup) fireConfetti();
  }, [dayPopup]);

  /* بطاقة «محطة السلسلة» — تظهر مرة واحدة عند كل محطة (كل 5 أيام متتالية) */
  const [streakPopup, setStreakPopup] = useState<PopupMsg | null>(null);
  useEffect(() => {
    const n = s.streak.current;
    if (n === 0 || n % 5 !== 0) return;
    const key = `alhimmah_streak_popup_${n}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
    } catch { /* تجاهل */ }
    const msg = pickPopup(STREAK_MILESTONE_POPUPS);
    setStreakPopup({ ...msg, body: msg.body.replace(/\{n\}/g, String(n)) });
  }, [s.streak.current]);

  useEffect(() => {
    if (streakPopup) fireConfetti();
  }, [streakPopup]);

  /* هدية تسجيل الدخول اليومية — أول فتح للتطبيق كل يوم يمنح ريالات مجانية بمصرف الهمّة */
  const [loginBonus, setLoginBonus] = useState(0);
  useEffect(() => {
    const granted = core.claimDailyLoginBonus();
    if (granted > 0) setLoginBonus(granted);
  }, []);

  /* عجلة حظ الأسبوع — تُفتح بعد إنجاز التحدّي الأسبوعي، جائزة ريالات عشوائية مرة كل أسبوع */
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<number | null>(null);
  const handleSpinWheel = () => {
    setWheelSpinning(true);
    window.setTimeout(() => {
      const reward = core.spinLuckWheel();
      setWheelSpinning(false);
      if (reward > 0) setWheelResult(reward);
    }, 900);
  };

  /* بانر السحبة — يظهر لو غاب ٣ أيام أو أكثر (يعتمد آخر فتح للتطبيق) */
  const [awayMsg, setAwayMsg] = useState<string | null>(null);
  useEffect(() => {
    try {
      const last = localStorage.getItem('alhimmah_last_seen');
      if (last && last !== today) {
        const gap = Math.round((Date.parse(today) - Date.parse(last)) / 86_400_000);
        if (gap >= 3) setAwayMsg(pickLine(AWAY_LINES));
      }
      localStorage.setItem('alhimmah_last_seen', today);
    } catch { /* تجاهل */ }
  }, [today]);

  /* عدد المهام المنجزة آخر ٧ أيام (من history كل مهمة روتين) — لمحتوى بانر الحصاد */
  const weeklyTaskCount = routine.reduce((sum, t) => {
    const hist = t.history ?? [];
    const inLastWeek = hist.filter((d) => {
      const diff = (Date.now() - new Date(d + 'T00:00:00').getTime()) / 86_400_000;
      return diff >= 0 && diff < 7;
    }).length;
    return sum + inLastWeek;
  }, 0);

  /* بانر حصاد الأسبوع — نهاية الأسبوع (الخميس/الجمعة)، مرة كل أسبوع */
  const weekKey = (() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 1);
    const week = Math.floor((((d.getTime() - start.getTime()) / 86_400_000) + start.getDay()) / 7);
    return `${d.getFullYear()}-w${week}`;
  })();
  const isWeekend = [4, 5, 6].includes(new Date().getDay()); // الخميس=٤ · الجمعة=٥ · السبت=٦ (نهاية الأسبوع السعودي)
  const [harvestOpen, setHarvestOpen] = useState(() => {
    if (!isWeekend) return false;
    try { return !localStorage.getItem(`alhimmah_harvest_${weekKey}`); } catch { return true; }
  });
  const dismissHarvest = () => {
    setHarvestOpen(false);
    try { localStorage.setItem(`alhimmah_harvest_${weekKey}`, '1'); } catch { /* تجاهل */ }
  };

  /* بانر صدمة بداية الأسبوع — صباح الأحد، مرة كل أسبوع */
  const isSunday = new Date().getDay() === 0;
  const [sundayOpen, setSundayOpen] = useState(() => {
    if (!isSunday) return false;
    try { return !localStorage.getItem(`alhimmah_sunday_${weekKey}`); } catch { return true; }
  });
  const dismissSunday = () => {
    setSundayOpen(false);
    try { localStorage.setItem(`alhimmah_sunday_${weekKey}`, '1'); } catch { /* تجاهل */ }
  };

  /* تفقّد الساعة 5 العصر — إنجاز أو تأخير، مرة واحدة باليوم */
  const isAfternoonCheck = new Date().getHours() >= 17;
  const [afternoonDismissed, setAfternoonDismissed] = useState(() => {
    try { return !!localStorage.getItem(`alhimmah_afternoon_${today}`); } catch { return false; }
  });
  const afternoonOpen = isAfternoonCheck && !afternoonDismissed;
  const dismissAfternoon = () => {
    setAfternoonDismissed(true);
    try { localStorage.setItem(`alhimmah_afternoon_${today}`, '1'); } catch { /* تجاهل */ }
  };

  /* «رصيدك يستنى» — تذكير لطيف لو تجمّع رصيد كبير (١٠٠+ ريال) ما تصرفه، مرة واحدة باليوم */
  const RICH_BALANCE_THRESHOLD = 100;
  const [richDismissed, setRichDismissed] = useState(() => {
    try { return !!localStorage.getItem(`alhimmah_rich_${today}`); } catch { return false; }
  });
  const richOpen = s.rials >= RICH_BALANCE_THRESHOLD && !richDismissed;
  const dismissRich = () => {
    setRichDismissed(true);
    try { localStorage.setItem(`alhimmah_rich_${today}`, '1'); } catch { /* تجاهل */ }
  };

  /* الجلد الدبلوماسي — فتح الرئيسية ٥ مرات فأكثر بدون إنجاز أي مهمة اليوم، مرة واحدة باليوم */
  const [nagDismissed, setNagDismissed] = useState(() => {
    try { return !!localStorage.getItem(`alhimmah_nag_${today}`); } catch { return false; }
  });
  const nagOpen = opensToday >= 5 && doneToday === 0 && !nagDismissed;
  const [nagMsg] = useState(() => pickLine(NAG_LINES));
  const dismissNag = () => {
    setNagDismissed(true);
    try { localStorage.setItem(`alhimmah_nag_${today}`, '1'); } catch { /* تجاهل */ }
  };

  /* تنبيه ذكي سياقي: يختار أهم تذكير حسب حالتك اليوم (الأعلى أولوية) */
  const smartNudge = (() => {
    // ١) السلسلة في خطر
    if (s.streak.current > 0 && s.streak.lastDoneDate !== today) {
      return {
        emoji: '🔥',
        text: `سلسلتك ${s.streak.current} ${s.streak.current === 1 ? 'يوم' : 'أيام'} بتنكسر! ${v('أنجز', 'أنجزي')} أي مهمة اليوم وثبّتها`,
        to: '/routine',
        action: 'كمّل روتينك',
      };
    }
    // ٢) ما سجّل مزاجه اليوم
    if (!s.moodLog.some((m) => m.date === today)) {
      return {
        emoji: '🙂',
        text: `ما ${v('سجّلت', 'سجّلتِ')} مزاجك اليوم — كيف حالك؟ سجّله بثانية`,
        to: '/mood',
        action: 'سجّل مزاجك',
      };
    }
    // ٣) رؤية استباقية: نوم قليل آخر ٥ أيام
    const recent = s.sleepLog
      .filter((e) => {
        const diff = (Date.now() - new Date(e.date + 'T00:00:00').getTime()) / 86_400_000;
        return diff >= 0 && diff < 5;
      })
      .map((e) => e.hours);
    if (recent.length >= 3) {
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      if (avg < 6) {
        return {
          emoji: '😴',
          text: `نومك آخر أيام ${avg.toFixed(1)} ساعة بس — طاقتك بتفرق لو ${v('تنام', 'تنامين')} بدري`,
          to: '/routine',
          action: 'روتين النوم',
        };
      }
    }
    // ٤) ما سجّل امتنان اليوم
    if (!s.gratitudeLog.some((g) => g.date === today)) {
      return {
        emoji: '🙏',
        text: `${v('سجّل', 'سجّلي')} شي تشكر الله عليه اليوم — يرفع مزاجك فعلاً`,
        to: '/notes',
        action: 'لحظة شكر',
      };
    }
    return null;
  })();
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
    { icon: '/icons/more.webp', label: 'الهـمّــة', to: '/more', streak: s.streak.current },
    { icon: '/icons/routine.webp', label: 'روتيني الصح', to: '/routine' },
    { icon: '/icons/goals.webp', label: 'الأهداف', to: '/goals' },
    { icon: '/icons/expenses.webp', label: 'دراهمي', to: '/expenses' },
    { icon: '/icons/workouts.webp', label: 'قم لـ جيم', to: '/workouts' },
    { icon: '/icons/meals.webp', label: 'أكلي الصحي', to: '/meals' },
    { icon: '/icons/analytics.webp', label: 'إنجازي الأسبوعي', to: '/analytics' },
    { icon: '/icons/pledges.webp', label: 'وعد الحر دين', to: '/pledges' },
    { icon: '/icons/achievements.webp', label: 'منصة التتويج', to: '/achievements' },
  ];

  /* ترتيب البلاطات اليدوي — لو المستخدم رتّب من قبل نستخدم ترتيبه، وأي بلاطة جديدة تُضاف بالنهاية */
  const tileOrder = s.homeTileOrder.length ? s.homeTileOrder : tiles.map((t) => t.to);
  const orderedTiles = [
    ...tileOrder.map((to) => tiles.find((t) => t.to === to)).filter((t): t is typeof tiles[number] => !!t),
    ...tiles.filter((t) => !tileOrder.includes(t.to)),
  ];
  const [reorderMode, setReorderMode] = useState(false);
  const moveTile = (to: string, dir: -1 | 1) => {
    const order = orderedTiles.map((t) => t.to);
    const i = order.indexOf(to);
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    [order[i], order[j]] = [order[j], order[i]];
    core.setHomeTileOrder(order);
  };

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
              {s.profile.avatar && (
                <img className="home-hero-avatar" src={s.profile.avatar} alt="" width={28} height={28} />
              )}
              {tg.badge} {tg.text} يا {greeting}
            </div>
            {hijriDate && <div className="home-hero-date">🗓️ {hijriDate} هـ {gregorianDate && `· ${gregorianDate}م`}</div>}
            <div className="home-hero-title">حقق حلمك وكن ملهماً ✨</div>
          </div>
          <div className="home-hero-side">
            <button className="home-hero-search" aria-label="بحث شامل" onClick={() => navigate('/search')}>🔍</button>
            <div className="home-ring" role="img" aria-label={`إنجاز يومك ${dayPct}٪`}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle className="home-ring-track" cx="32" cy="32" r="26" />
                <circle
                  className="home-ring-fill"
                  cx="32"
                  cy="32"
                  r="26"
                  style={{
                    strokeDasharray: RING_CIRC,
                    strokeDashoffset: RING_CIRC * (1 - dayPct / 100),
                  }}
                />
              </svg>
              <span className="home-ring-pct">{dayPct}٪</span>
            </div>
          </div>
        </div>
      </div>

      {welcome && welcomeOpen && (
        <div className="welcome-card">
          <button className="welcome-close" aria-label="إغلاق" onClick={dismissWelcome}>✕</button>
          <div className="welcome-title">{personalize(welcome.title, personalName)}</div>
          <div className="welcome-body">{welcome.body}</div>
          <button className="btn-primary welcome-cta" onClick={dismissWelcome}>يلا نبدأ 🚀</button>
        </div>
      )}

      {loginBonus > 0 && (
        <div className="alert-banner harvest">
          <button className="welcome-close" aria-label="إغلاق" onClick={() => setLoginBonus(0)}>✕</button>
          <div className="welcome-title">🎁 هديتك اليومية وصلت!</div>
          <div className="alert-banner-text">
            فتحت التطبيق اليوم؟ خذ {loginBonus} ريال همّة هدية بس لأنك رجعت. افتح كل يوم واكسب أكثر من مصرف الهمّة!
          </div>
          <button className="btn-primary welcome-cta" onClick={() => { setLoginBonus(0); navigate('/rewards'); }}>
            تفضل مصرف الهمّة ←
          </button>
        </div>
      )}

      {richOpen && (
        <div className="alert-banner harvest">
          <button className="welcome-close" aria-label="إغلاق" onClick={dismissRich}>✕</button>
          <div className="welcome-title">💰 رصيدك يستنّاك!</div>
          <div className="alert-banner-text">
            عندك {s.rials} ريال همّة نايمة بلا فايدة — تفضل اصرفها بمصرف الهمّة على مكافأة تستاهلها، أو افتح قالب من متجر الهمّة!
          </div>
          <button className="btn-primary welcome-cta" onClick={() => { dismissRich(); navigate('/rewards'); }}>
            تفضل مصرف الهمّة ←
          </button>
        </div>
      )}

      {awayMsg && (
        <div className="alert-banner away">
          <button className="welcome-close" aria-label="إغلاق" onClick={() => setAwayMsg(null)}>✕</button>
          <div className="alert-banner-text">{personalize(awayMsg, personalName)}</div>
          <button className="btn-primary welcome-cta" onClick={() => { setAwayMsg(null); navigate('/routine'); }}>
            رتّب مهامي ←
          </button>
        </div>
      )}

      {harvestOpen && (() => {
        const banner = getHarvestBanner(weeklyTaskCount);
        const fill = (t: string) => personalize(t, personalName).replace(/\{count\}/g, String(weeklyTaskCount));
        return (
          <div className="alert-banner harvest">
            <button className="welcome-close" aria-label="إغلاق" onClick={dismissHarvest}>✕</button>
            <div className="welcome-title">{fill(banner.title)}</div>
            <div className="alert-banner-text">{fill(banner.body)}</div>
            <button className="btn-primary welcome-cta" onClick={() => { dismissHarvest(); navigate(banner.to); }}>
              {banner.cta}
            </button>
          </div>
        );
      })()}

      {sundayOpen && (
        <div className="alert-banner harvest">
          <button className="welcome-close" aria-label="إغلاق" onClick={dismissSunday}>✕</button>
          <div className="welcome-title">{personalize(SUNDAY_BANNER.title, personalName)}</div>
          <div className="alert-banner-text">{SUNDAY_BANNER.body}</div>
          <button className="btn-primary welcome-cta" onClick={() => { dismissSunday(); navigate(SUNDAY_BANNER.to); }}>
            {SUNDAY_BANNER.cta}
          </button>
        </div>
      )}

      {afternoonOpen && (
        <div className={doneToday > 0 ? 'alert-banner harvest' : 'alert-banner away'}>
          <button className="welcome-close" aria-label="إغلاق" onClick={dismissAfternoon}>✕</button>
          <div className="alert-banner-text">
            {personalize(doneToday > 0 ? AFTERNOON_DONE_MSG : AFTERNOON_LATE_MSG, personalName)}
          </div>
          {doneToday === 0 && (
            <button className="btn-primary welcome-cta" onClick={() => { dismissAfternoon(); navigate(next.to); }}>
              يلا نخلص ←
            </button>
          )}
        </div>
      )}

      {nagOpen && (
        <div className="alert-banner away">
          <button className="welcome-close" aria-label="إغلاق" onClick={dismissNag}>✕</button>
          <div className="alert-banner-text">{personalize(nagMsg, personalName)}</div>
          <button className="btn-primary welcome-cta" onClick={() => { dismissNag(); navigate(next.to); }}>
            يلا نخلص وحدة ←
          </button>
        </div>
      )}

      {smartNudge && !nudgeDismissed && (
        <div className="smart-nudge">
          <span className="smart-nudge-emoji">{smartNudge.emoji}</span>
          <div className="smart-nudge-body">
            <div className="smart-nudge-text">{smartNudge.text}</div>
            <button className="smart-nudge-action" onClick={() => navigate(smartNudge.to)}>
              {smartNudge.action} ←
            </button>
          </div>
          <button className="smart-nudge-close" aria-label="إخفاء" onClick={() => setNudgeDismissed(true)}>✕</button>
        </div>
      )}

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

      {core.weekly.done && s.luckWheelWeek !== core.weekly.weekKey && (
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>🎡 عجلة حظ الأسبوع فتحت لك!</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
            خلّصت التحدّي — تفضل دورها واكسب ريالات همّة عشوائية (١٠ لين ٥٠)
          </div>
          <button className="btn-primary" style={{ width: '100%' }} disabled={wheelSpinning} onClick={handleSpinWheel}>
            {wheelSpinning ? '🎡 تدور... تدور...' : '🎡 دور العجلة'}
          </button>
        </div>
      )}

      {wheelResult !== null && (
        <div className="popup-overlay" onClick={() => setWheelResult(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-title">🎉 طلعت لك {wheelResult} ريال همّة!</div>
            <div className="popup-body">كفو عليك يا بطل! خذها وصرفها بمصرف الهمّة أو متجر الهمّة.</div>
            <button className="btn-primary welcome-cta" onClick={() => setWheelResult(null)}>تمام 🔥</button>
          </div>
        </div>
      )}

      {/* بطاقة تحفيزية دوّارة — تتغيّر كل ساعة بين همسة الفجر، عبارة تحفيزية، واقتباس اليوم */}
      {(() => {
        const lastMood = s.moodLog.length > 0 ? s.moodLog[s.moodLog.length - 1].moodIdx : undefined;
        const dailyQuote = getDailyQuote(lastMood);
        const candidates = [
          { kind: 'whisper' as const, emoji: '🌅', text: whisper },
          { kind: 'motiv' as const, emoji: '✨', text: motiv },
          { kind: 'quote' as const, text: dailyQuote.text, author: dailyQuote.author },
        ];
        const rotating = candidates[new Date().getHours() % candidates.length];
        return rotating.kind === 'quote' ? (
          <div className="quote-card">
            <div className="quote-mark">"</div>
            <div className="quote-text">{rotating.text}</div>
            <div className="quote-author">— {rotating.author}</div>
          </div>
        ) : (
          <div className="motiv-card">
            <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{rotating.emoji}</div>
            <div className="motiv-text">{rotating.text}</div>
          </div>
        );
      })()}

      <div className="home-grid-head">
        <h2 className="section-title" style={{ margin: 0 }}>🧭 رحلتك اليوم</h2>
        <button className="tile-reorder-toggle" onClick={() => setReorderMode((v) => !v)}>
          {reorderMode ? '✅ تم الترتيب' : '↕️ رتّب'}
        </button>
      </div>
      <div className="home-grid">
        {orderedTiles.map((t) => (
          <div key={t.label + t.to} className="tile-wrap">
            <button className="tile" onClick={() => (reorderMode ? undefined : navigate(t.to))}>
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
            {reorderMode && (
              <div className="tile-reorder-arrows">
                <button aria-label="أقدّم" onClick={() => moveTile(t.to, -1)}>▲</button>
                <button aria-label="أأخّر" onClick={() => moveTile(t.to, 1)}>▼</button>
              </div>
            )}
          </div>
        ))}
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

      <RelaxTipButton />

      <button className="fab" aria-label="خطوة سريعة" onClick={() => navigate(next.to)}>
        +
      </button>
      <RescueTimer />

      {dayPopup && (
        <div className="popup-overlay" onClick={() => setDayPopup(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-title">{personalize(dayPopup.title, personalName)}</div>
            <div className="popup-body">{dayPopup.body}</div>
            <button className="btn-primary welcome-cta" onClick={() => setDayPopup(null)}>تمام 🎉</button>
          </div>
        </div>
      )}

      {streakPopup && (
        <div className="popup-overlay" onClick={() => setStreakPopup(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-title">{personalize(streakPopup.title, personalName)}</div>
            <div className="popup-body">{personalize(streakPopup.body, personalName)}</div>
            <button className="btn-primary welcome-cta" onClick={() => setStreakPopup(null)}>كفو 🔥</button>
          </div>
        </div>
      )}
    </div>
  );
}
