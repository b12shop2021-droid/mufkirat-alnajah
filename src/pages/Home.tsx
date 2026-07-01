/* ===================================================================
   Home.tsx — الصفحة الرئيسية (لوحة معلومات)
   ملخص ذكي + همسة الفجر (تتغير حسب أداء الأمس) + شبكة الوصول + نظرة الأسبوع.
   كل القيم من useCore المركزي.
   =================================================================== */

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useCore } from '../core/useCore';
import XPBar from '../components/XPBar';
import RescueTimer from '../components/RescueTimer';
import RelaxTipButton from '../components/RelaxTipButton';
import { fireConfetti } from '../components/Confetti';
import { getDailyQuote } from '../data/quotes';
import { getRandomWelcome } from '../data/welcomeMessages';
import { DAY_DONE_POPUPS, STREAK_MILESTONE_POPUPS, pickPopup, pickLine, AWAY_LINES, getHarvestBanner, SUNDAY_BANNER, NAG_LINES, AFTERNOON_DONE_MSG, AFTERNOON_LATE_MSG, personalize, JOKES, type PopupMsg } from '../data/vibes';
import { WORKOUT_DAYS } from '../data/workoutDays';

/* محيط حلقة التقدّم الدائرية (نصف القطر 26) — ثابت لحساب stroke-dashoffset */
const RING_CIRC = 2 * Math.PI * 26;

const MOTIVATIONS = [
  'كل خطوة صغيرة تقرّبك لحلمك — لا تستهين فيها',
  'النجاح عادة يومية، مو ضربة حظ',
  'لا تقارن بدايتك بنهايات غيرك — قارن نفسك بأمسك',
  'انضباطك اليوم هو فخرك بكرة',
];

/* أماكن مدفونة بالتطبيق — لزر «فاجئني» الاستكشافي */
const DISCOVERY_SPOTS = [
  { label: 'وعد الحر دين', to: '/pledges', emoji: '🛡️' },
  { label: 'نسختي الأفضل', to: '/self-dev', emoji: '🌱' },
  { label: 'متجر الهمّة', to: '/templates', emoji: '🛍️' },
  { label: 'مصرف الهمّة', to: '/rewards', emoji: '🏦' },
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
  const routine = useMemo(
    () => [...s.routine.morning, ...s.routine.evening],
    [s.routine.morning, s.routine.evening],
  );
  const doneToday = useMemo(
    () => routine.filter((t) => t.doneDate === today).length,
    [routine, today],
  );
  const dayPct = routine.length ? Math.round((doneToday / routine.length) * 100) : 0;

  /* وجه المزاج المتحرك حسب نسبة إنجاز اليوم — تعليق خفيف يتغيّر مع تقدّمك */
  const dayMood =
    routine.length === 0
      ? { emoji: '🌱', text: 'جهّز روتينك وخل النسبة تتحرك' }
      : dayPct === 0
        ? { emoji: '😴', text: `لسا الحين يا ${greeting}؟! يومك يستنى منك خطوة` }
        : dayPct < 50
          ? { emoji: '😐', text: 'بداية لا بأس فيها.. كمّل شوي' }
          : dayPct < 100
            ? { emoji: '💪', text: 'قربت تخلص يومك بجدارة!' }
            : { emoji: '🔥', text: 'مبدع اليوم! ما قصّرت أبد' };

  /* رقمك القياسي — أعلى نسبة إنجاز يوم حققتها قبل اليوم (من history كل مهمة روتين) */
  const bestDayPct = useMemo(() => {
    if (routine.length === 0) return 0;
    const counts: Record<string, number> = {};
    routine.forEach((t) => (t.history ?? []).forEach((d) => {
      if (d === today) return;
      counts[d] = (counts[d] ?? 0) + 1;
    }));
    let max = 0;
    Object.values(counts).forEach((c) => {
      const pct = Math.round((c / routine.length) * 100);
      if (pct > max) max = pct;
    });
    return Math.min(max, 100);
  }, [routine, today]);
  const isNewRecord = dayPct > 0 && bestDayPct > 0 && dayPct >= bestDayPct;

  /* تذكيرات معلّقة (مواعيد اتصال مجدولة فاتت أو حان وقتها) — نقطة حمراء على جرس الهيرو */
  const pendingReminders = s.relations.filter((r) => r.scheduledAt && new Date(r.scheduledAt) <= new Date()).length;

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

  /* خطوتك اليوم — اقتراح ذكي واحد يدمج (الخطوة الناقصة + التنبيه السياقي) بأولوية موحّدة
     level: 'urgent' (أحمر/برتقالي) · 'normal' (لون التطبيق) · 'calm' (تدرّج هادئ) — يلوّن البطاقة حسب درجة الأهمية */
  const gratToday = s.gratitudeLog.filter((g) => g.date === today).length;
  const moodToday = s.moodLog.some((m) => m.date === today);
  const todayNudge = useMemo(() => {
    if (routine.length === 0) {
      return { emoji: '✍️', text: 'ما جهّزت روتينك اليومي بعد — خطوة وحدة وتضبط يومك', to: '/routine', action: 'جهّز روتيني', level: 'normal' as const };
    }
    if (doneToday < routine.length) {
      if (s.streak.current > 0 && s.streak.lastDoneDate !== today) {
        return {
          emoji: '🔥',
          text: `سلسلتك ${s.streak.current} ${s.streak.current === 1 ? 'يوم' : 'أيام'} بتنكسر! ${v('أنجز', 'أنجزي')} أي مهمة اليوم وثبّتها`,
          to: '/routine',
          action: 'كمّل روتيني',
          level: 'urgent' as const,
        };
      }
      return { emoji: '☀️', text: `باقي عليك ${routine.length - doneToday} من مهام اليوم — كمّلها وخلّص`, to: '/routine', action: 'كمّل روتيني', level: 'normal' as const };
    }
    if (!moodToday) {
      return { emoji: '🙂', text: `ما ${v('سجّلت', 'سجّلتِ')} مزاجك اليوم — كيف حالك؟ سجّله بثانية`, to: '/mood', action: 'سجّل مزاجك', level: 'normal' as const };
    }
    const recentSleep = s.sleepLog
      .filter((e) => {
        const diff = (Date.now() - new Date(e.date + 'T00:00:00').getTime()) / 86_400_000;
        return diff >= 0 && diff < 5;
      })
      .map((e) => e.hours);
    if (recentSleep.length >= 3) {
      const avg = recentSleep.reduce((a, b) => a + b, 0) / recentSleep.length;
      if (avg < 6) {
        return {
          emoji: '😴',
          text: `نومك آخر أيام ${avg.toFixed(1)} ساعة بس — طاقتك بتفرق لو ${v('تنام', 'تنامين')} بدري`,
          to: '/routine',
          action: 'روتين النوم',
          level: 'calm' as const,
        };
      }
    }
    if (gratToday < 3) {
      return { emoji: '🙏', text: `${v('سجّل', 'سجّلي')} شي تشكر الله عليه اليوم — يرفع مزاجك فعلاً`, to: '/notes', action: 'لحظة شكر', level: 'calm' as const };
    }
    /* اقتراح آخر — يومك الجاي مع المدرب سعود (يعتمد آخر تمرين مسجّل حقيقي، لا جدول مفترض) */
    if (s.workoutLogs.length > 0) {
      const lastLog = [...s.workoutLogs].sort((a, b) => a.date.localeCompare(b.date))[s.workoutLogs.length - 1];
      if (lastLog.date !== today) {
        const idx = WORKOUT_DAYS.findIndex((d) => d.id === lastLog.dayId);
        const nextDay = WORKOUT_DAYS[idx === -1 ? 0 : (idx + 1) % WORKOUT_DAYS.length];
        return { emoji: '💪', text: `يومك الجاي مع المدرب سعود: ${nextDay.title}`, to: '/workouts', action: 'ابدأ التمرين', level: 'calm' as const };
      }
    }
    return null;
  }, [routine, doneToday, s.streak.current, s.streak.lastDoneDate, today, moodToday, s.sleepLog, gratToday, s.workoutLogs, fem]);

  /* «أول خطواتك» — قائمة تعريفية للمستخدم الجديد جداً (أقل من خطوتين تفاعل حقيقي)، تختفي تلقائياً وتتوقف عن الظهور بعدها للأبد
     ملاحظة: نتحقق من التفاعل الفعلي لا مجرد وجود بيانات — تحدّي 21 يوم يزرع روتين وهدف افتراضياً لكل مستخدم جديد،
     فالاعتماد على .length>0 يخلي القائمة تختفي فوراً بلا أي تفاعل حقيقي */
  const onboardingSteps = [
    { done: routine.some((t) => (t.history?.length ?? 0) > 0), label: 'أنجز أول مهمة من روتينك', to: '/routine', emoji: '☀️' },
    { done: s.goals.some((g) => g.completed || g.steps.some((st) => st.done)), label: 'حرّك خطوة بهدفك', to: '/goals', emoji: '🎯' },
    { done: s.pledges.length > 0, label: 'اكتب عهدك الأول', to: '/pledges', emoji: '🛡️' },
    { done: s.moodLog.length > 0, label: 'سجّل مزاجك', to: '/mood', emoji: '🙂' },
  ];
  const showOnboarding = onboardingSteps.filter((st) => st.done).length < 2;

  /* أقرب هدف بموعد نهائي — يُعرض كشريط تذكير خفيف */
  const nearestGoal = useMemo(() => {
    const withDeadline = s.goals.filter((g) => !g.completed && g.deadline);
    if (withDeadline.length === 0) return null;
    const g = [...withDeadline].sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
    const daysLeft = Math.ceil((Date.parse(g.deadline) - Date.parse(today)) / 86_400_000);
    return { title: g.title, daysLeft };
  }, [s.goals, today]);

  /* لقطة سريعة للمصروف اليومي — تُعرض فقط لو المستخدم يستخدم دراهمي فعلاً (صرف اليوم أو ميزانية محدّدة) */
  const expenseSnapshot = useMemo(() => {
    const monthPrefix = today.slice(0, 7);
    const todaySpent = s.expenses
      .filter((e) => e.type === 'expense' && e.date === today)
      .reduce((sum, e) => sum + e.amount, 0);
    const monthBudgetTotal = Object.values(s.budgets).reduce((a, b) => a + b, 0);
    if (todaySpent === 0 && monthBudgetTotal === 0) return null;
    if (monthBudgetTotal === 0) return { text: `💰 صرفت اليوم ${todaySpent} ﷼`, over: false };
    const monthSpent = s.expenses
      .filter((e) => e.type === 'expense' && e.date.startsWith(monthPrefix))
      .reduce((sum, e) => sum + e.amount, 0);
    const pct = Math.round((monthSpent / monthBudgetTotal) * 100);
    return { text: `💰 اليوم: ${todaySpent} ﷼ — الشهر: ${pct}٪ من ميزانيتك`, over: pct >= 100 };
  }, [s.expenses, s.budgets, today]);

  const motiv = MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];
  const joke = JOKES[new Date().getDate() % JOKES.length];

  /* نِيّة اليوم — كلمة/جملة تركيز يكتبها البطل */
  const intentionToday = s.dailyIntention?.date === today ? s.dailyIntention.text : '';
  const [intentDraft, setIntentDraft] = useState('');
  const [editingIntent, setEditingIntent] = useState(false);
  const [intentExpanded, setIntentExpanded] = useState(false);
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

  /* زر «خطوة سريعة» العائم — نخفيه أول الصفحة لأنه مكرّر مع زر بطاقة التنبيه نفسها هناك،
     ونظهره بعد التمرير عشان ما يتراكب بصرياً مع البطاقات فوق */
  const [showFab, setShowFab] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowFab(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

  /* مشاركة سريعة عند إكمال اليوم — نص جاهز لواتساب/أي تطبيق، مع نسخ احتياطي للحافظة */
  const [dayShareCopied, setDayShareCopied] = useState(false);
  const shareDayDone = async () => {
    const text = `🏅 أنجزت يومك كامل في الهمّة يا ${greeting}! 🔥\nسلسلة الالتزام: ${s.streak.current} يوم متواصل.\n#الهمّة #الهمّة_حتى_القمّة`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        /* المستخدم ألغى — نرجع للنسخ */
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setDayShareCopied(true);
      setTimeout(() => setDayShareCopied(false), 2500);
    } catch { /* تجاهل */ }
  };

  /* زر «فاجئني» — يوديك لقسم عشوائي مدفون بالتطبيق */
  const surpriseMe = () => {
    const spot = DISCOVERY_SPOTS[Math.floor(Math.random() * DISCOVERY_SPOTS.length)];
    navigate(spot.to);
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
  const weeklyTaskCount = useMemo(() => routine.reduce((sum, t) => {
    const hist = t.history ?? [];
    const inLastWeek = hist.filter((d) => {
      const diff = (Date.now() - new Date(d + 'T00:00:00').getTime()) / 86_400_000;
      return diff >= 0 && diff < 7;
    }).length;
    return sum + inLastWeek;
  }, 0), [routine, today]);

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

  const saveIntent = () => {
    if (intentDraft.trim() === '') return;
    core.setDailyIntention(intentDraft);
    setIntentDraft('');
    setEditingIntent(false);
    setIntentExpanded(true);
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
    { icon: '⏱️', label: 'مؤقت البومودورو', to: '/pomodoro' },
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

  /* بانرات الرئيسية — نعرض بانر واحد فقط بالمرة (الأعلى أولوية) بدل تكديسها فوق بعض */
  const banners: { key: string; active: boolean; node: ReactNode }[] = [
    {
      key: 'welcome',
      active: !!(welcome && welcomeOpen),
      node: welcome && (
        <div className="welcome-card">
          <button className="welcome-close" aria-label="إغلاق" onClick={dismissWelcome}>✕</button>
          <div className="welcome-title">{personalize(welcome.title, personalName)}</div>
          <div className="welcome-body">{welcome.body}</div>
          <button className="btn-primary welcome-cta" onClick={dismissWelcome}>يلا نبدأ 🚀</button>
        </div>
      ),
    },
    {
      key: 'loginBonus',
      active: loginBonus > 0,
      node: (
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
      ),
    },
    {
      key: 'nag',
      active: nagOpen,
      node: (
        <div className="alert-banner away">
          <button className="welcome-close" aria-label="إغلاق" onClick={dismissNag}>✕</button>
          <div className="alert-banner-text">{personalize(nagMsg, personalName)}</div>
          <button className="btn-primary welcome-cta" onClick={() => { dismissNag(); navigate(todayNudge?.to ?? '/routine'); }}>
            يلا نخلص وحدة ←
          </button>
        </div>
      ),
    },
    {
      key: 'away',
      active: !!awayMsg,
      node: awayMsg && (
        <div className="alert-banner away">
          <button className="welcome-close" aria-label="إغلاق" onClick={() => setAwayMsg(null)}>✕</button>
          <div className="alert-banner-text">{personalize(awayMsg, personalName)}</div>
          <button className="btn-primary welcome-cta" onClick={() => { setAwayMsg(null); navigate('/routine'); }}>
            رتّب مهامي ←
          </button>
        </div>
      ),
    },
    {
      key: 'sunday',
      active: sundayOpen,
      node: (
        <div className="alert-banner harvest">
          <button className="welcome-close" aria-label="إغلاق" onClick={dismissSunday}>✕</button>
          <div className="welcome-title">{personalize(SUNDAY_BANNER.title, personalName)}</div>
          <div className="alert-banner-text">{SUNDAY_BANNER.body}</div>
          <button className="btn-primary welcome-cta" onClick={() => { dismissSunday(); navigate(SUNDAY_BANNER.to); }}>
            {SUNDAY_BANNER.cta}
          </button>
        </div>
      ),
    },
    {
      key: 'harvest',
      active: harvestOpen,
      node: (() => {
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
      })(),
    },
    {
      key: 'afternoon',
      active: afternoonOpen,
      node: (
        <div className={doneToday > 0 ? 'alert-banner harvest' : 'alert-banner away'}>
          <button className="welcome-close" aria-label="إغلاق" onClick={dismissAfternoon}>✕</button>
          <div className="alert-banner-text">
            {personalize(doneToday > 0 ? AFTERNOON_DONE_MSG : AFTERNOON_LATE_MSG, personalName)}
          </div>
          {doneToday === 0 && (
            <button className="btn-primary welcome-cta" onClick={() => { dismissAfternoon(); navigate(todayNudge?.to ?? '/routine'); }}>
              يلا نخلص ←
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'rich',
      active: richOpen,
      node: (
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
      ),
    },
    {
      key: 'goal',
      active: !!nearestGoal,
      node: nearestGoal && (
        <button className={nearestGoal.daysLeft < 0 ? 'goal-pill overdue' : 'goal-pill'} onClick={() => navigate('/goals')}>
          <span>🎯</span>
          <span className="goal-pill-text">
            {nearestGoal.daysLeft < 0
              ? `فات موعد: «${nearestGoal.title}»`
              : nearestGoal.daysLeft === 0
                ? `اليوم آخر يوم: «${nearestGoal.title}»`
                : `باقي ${nearestGoal.daysLeft} ${nearestGoal.daysLeft === 1 ? 'يوم' : 'أيام'} على: «${nearestGoal.title}»`}
          </span>
          <span className="intent-pill-chev">←</span>
        </button>
      ),
    },
    {
      key: 'expense',
      active: !!expenseSnapshot,
      node: expenseSnapshot && (
        <button className={expenseSnapshot.over ? 'goal-pill overdue' : 'goal-pill'} onClick={() => navigate('/expenses')}>
          <span className="goal-pill-text">{expenseSnapshot.text}</span>
          <span className="intent-pill-chev">←</span>
        </button>
      ),
    },
  ];
  const activeBanner = banners.find((b) => b.active)?.node ?? null;

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
            <div className="home-mood-line">{dayMood.emoji} {dayMood.text}</div>
          </div>
          <div className="home-hero-side">
            <div className="home-hero-icons">
              <button className="home-hero-search" aria-label="بحث شامل" onClick={() => navigate('/search')}>🔍</button>
              <button
                className="home-hero-search"
                aria-label={tg.night ? 'روتين المساء' : 'روتين الصباح'}
                onClick={() => navigate('/routine')}
              >
                {tg.night ? '🌙' : '☀️'}
              </button>
              <button className="home-hero-search bell" aria-label="تذكيرات معلّقة" onClick={() => navigate('/occasions')}>
                🔔
                {pendingReminders > 0 && <span className="bell-dot" />}
              </button>
            </div>
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
            {bestDayPct > 0 && (
              <div className="home-ring-record">{isNewRecord ? '🎉 قياسي جديد!' : `🏆 قياسي: ${bestDayPct}٪`}</div>
            )}
          </div>
        </div>
      </div>

      {showOnboarding ? (
        <div className="onboarding-card">
          <div className="onboarding-title">🚀 يلا نبدأ سوا يا {greeting}!</div>
          <div className="onboarding-sub">أربع خطوات بسيطة وتصير جاهز تستخدم الهمّة بكامل قوتها</div>
          {onboardingSteps.map((st) => (
            <button
              key={st.to}
              className={st.done ? 'onboarding-step done' : 'onboarding-step'}
              onClick={() => navigate(st.to)}
            >
              <span className="onboarding-step-check">{st.done ? '✅' : '○'}</span>
              <span className="onboarding-step-emoji">{st.emoji}</span>
              <span className="onboarding-step-label">{st.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <>
          {activeBanner}

          {todayNudge && !nudgeDismissed && (
            <div className={`smart-nudge ${todayNudge.level}`}>
              <span className="smart-nudge-emoji">{todayNudge.emoji}</span>
              <div className="smart-nudge-body">
                <div className="smart-nudge-text">{todayNudge.text}</div>
                <button className="smart-nudge-action" onClick={() => navigate(todayNudge.to)}>
                  {todayNudge.action} ←
                </button>
              </div>
              <button className="smart-nudge-close" aria-label="إخفاء" onClick={() => setNudgeDismissed(true)}>✕</button>
            </div>
          )}
        </>
      )}

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

      {intentionToday && !editingIntent && !intentExpanded ? (
        <button className="intent-pill" onClick={() => setIntentExpanded(true)}>
          <span>🎯</span>
          <span className="intent-pill-text">«{intentionToday}»</span>
          {intentStreak > 1 && <span className="intent-pill-streak">🔥{intentStreak}</span>}
          <span className="intent-pill-chev">▾</span>
        </button>
      ) : (
        <div className={intentionToday && !editingIntent ? 'intent-card set' : 'intent-card'}>
          {intentionToday && !editingIntent ? (
            <>
              <div className="intent-head">
                <span className="intent-tag">🎯 نِيّة اليوم</span>
                <div style={{ display: 'flex', gap: 6 }}>
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
                  <button className="intent-edit" aria-label="تصغير" onClick={() => setIntentExpanded(false)}>
                    ▲
                  </button>
                </div>
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
      )}

      <div className={core.weekly.done ? 'weekly-card done' : 'weekly-card'}>
        <div className="weekly-head">
          <span className="weekly-tag">🎯 تحدّي الأسبوع</span>
          <span className="weekly-reward">+{core.weekly.def.reward} نقطة</span>
        </div>
        <div className="weekly-title">
          {core.weekly.def.emoji} {core.weekly.def.title}
        </div>
        <div className="weekly-hint">{core.weekly.def.hint}</div>
        {!core.weekly.done && (
          <button className="weekly-btn" onClick={() => core.completeWeeklyChallenge()}>
            {v('أنجزت التحدّي', 'أنجزتِ التحدّي')} ✋
          </button>
        )}
        {core.weekly.done && s.luckWheelWeek !== core.weekly.weekKey && (
          <>
            <div className="weekly-done-badge">✅ {v('أنجزته', 'أنجزتِه')} — عجلة حظ الأسبوع فتحت لك! 🎡</div>
            <button className="weekly-btn" disabled={wheelSpinning} onClick={handleSpinWheel}>
              {wheelSpinning ? '🎡 تدور... تدور...' : '🎡 دور العجلة واكسب ١٠-٥٠ ريال همّة'}
            </button>
          </>
        )}
        {core.weekly.done && s.luckWheelWeek === core.weekly.weekKey && (
          <div className="weekly-done-badge">✅ {v('أنجزته', 'أنجزتِه')} — كفو! نشوفك بالتحدّي الجاي</div>
        )}
      </div>

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
          { kind: 'joke' as const, emoji: '😂', text: joke },
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

      {routine.length > 0 && doneToday === routine.length && (
        <div className="day-done-badge">
          <span>🏅 أنجزت يومك كامل يا {greeting} — كفووو</span>
          <button className="day-done-share" onClick={shareDayDone}>
            {dayShareCopied ? '✅ تم النسخ' : '📤 شارك'}
          </button>
        </div>
      )}

      <RelaxTipButton />
      <button className="discover-btn" onClick={surpriseMe}>🎲 فاجئني</button>

      {showFab && (
        <button className="fab" aria-label="خطوة سريعة" onClick={() => navigate(todayNudge?.to ?? '/routine')}>
          +
        </button>
      )}
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
