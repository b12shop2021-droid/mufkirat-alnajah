/* ===================================================================
   JourneyGallery.tsx — قصة الشهر + محطات الطريق + معرض الإنجازات
   صفحة عرض تحسب كل شيء من بيانات useCore الحقيقية (لا حالة مستقلة).
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import { fireConfetti } from '../components/Confetti';

type Tab = 'wrap' | 'road' | 'gallery';

const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

export default function JourneyGallery({ embedded = false }: { embedded?: boolean }) {
  const core = useCore();
  const s = core.state;
  const [tab, setTab] = useState<Tab>('wrap');

  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  /* أيام هذا الشهر التي فيها نشاط مسجّل */
  const activeDates = new Set<string>();
  s.moodLog.forEach((m) => m.date.startsWith(monthPrefix) && activeDates.add(m.date));
  s.gratitudeLog.forEach((g) => g.date.startsWith(monthPrefix) && activeDates.add(g.date));
  s.quranMinutes.forEach((q) => q.date.startsWith(monthPrefix) && activeDates.add(q.date));
  s.notes.forEach((n) => n.date.startsWith(monthPrefix) && activeDates.add(n.date));
  s.sleepLog.forEach((e) => e.date.startsWith(monthPrefix) && activeDates.add(e.date));
  const disciplinedDays = activeDates.size;

  const juzCount = Object.keys(s.quranJuz).length;
  const doneSteps = s.goals.reduce((sum, g) => sum + g.steps.filter((x) => x.done).length, 0);

  /* محطات الطريق حسب أطول سلسلة */
  const STATIONS = [
    { days: 7, title: 'المحطة الأولى', sub: 'أسبوع كامل من الانضباط' },
    { days: 30, title: 'المحطة الثانية', sub: 'شهر كامل — عادة تكوّنت' },
    { days: 100, title: 'محطة الأبطال', sub: '100 يوم — إنجاز استثنائي' },
    { days: 365, title: 'المحطة الكبرى', sub: 'سنة كاملة من النجاح' },
  ];
  const longest = s.streak.longest;
  const currentStreak = s.streak.current;
  const firstUnreached = STATIONS.findIndex((st) => longest < st.days);
  const reachedCount = STATIONS.filter((st) => longest >= st.days).length;
  const fillPct = Math.min(100, (reachedCount / (STATIONS.length - 1)) * 100);

  /* الإنجازات — تُحسب من بيانات حقيقية */
  const achievements = [
    { emoji: '🔥', title: 'أول سلسلة 7 أيام', earned: longest >= 7, need: 'يحتاج 7 أيام سلسلة' },
    { emoji: '📖', title: 'أول ختمة جزء', earned: juzCount >= 1, need: 'يحتاج قراءة جزء' },
    { emoji: '🎯', title: 'صانع القرار', earned: doneSteps >= 100, need: 'يحتاج 100 مهمة' },
    { emoji: '🏆', title: 'بطل النجاح', earned: core.level >= 6, need: 'يحتاج المستوى 7' },
    { emoji: '🌳', title: 'شجرة مزهرة', earned: longest >= 90, need: 'يحتاج 90 يوم سلسلة' },
    { emoji: '🙏', title: 'قلب شاكر', earned: s.gratitudeLog.length >= 50, need: 'يحتاج 50 شكر' },
  ];
  const earnedTitles = achievements.filter((a) => a.earned).length;

  /* مشاركة ملخص الشهر فعلياً (Web Share أو نسخ) + احتفال */
  const [shared, setShared] = useState(false);
  const handleShareMonth = async () => {
    fireConfetti();
    const text = `📊 شهري في الهمّة (${MONTHS[now.getMonth()]} ${now.getFullYear()})

🗓️ ${disciplinedDays} يوم منضبط
⭐ ${s.xp} نقطة XP
📖 ${juzCount} جزء قرآن
🏅 ${earnedTitles} لقب مكتسب
🏆 مستواي: ${core.levelName}

#الهمّة #الهمّة_حتى_القمّة`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
    } catch {
      /* أُلغيت المشاركة — نرجع للنسخ */
    }
    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    } catch {
      /* النسخ غير مدعوم */
    }
  };

  return (
    <div className="page">
      {!embedded && <BackButton />}
      {!embedded && <XPBar />}

      <div className="subtabs">
        <button className={tab === 'wrap' ? 'subtab active' : 'subtab'} onClick={() => setTab('wrap')}>
          🎬 قصة الشهر
        </button>
        <button className={tab === 'road' ? 'subtab active' : 'subtab'} onClick={() => setTab('road')}>
          🛣️ المحطات
        </button>
        <button className={tab === 'gallery' ? 'subtab active' : 'subtab'} onClick={() => setTab('gallery')}>
          🖼️ معرضي
        </button>
      </div>

      {tab === 'wrap' && (
        <div className="wrap-card">
          <div className="wrap-month">
            {MONTHS[now.getMonth()]} {now.getFullYear()}
          </div>
          <div className="wrap-title">شهرك بالأرقام ✨</div>
          <div className="wrap-stats-grid">
            <div className="wrap-stat">
              <div className="wrap-stat-num">{disciplinedDays}</div>
              <div className="wrap-stat-label">يوم منضبط</div>
            </div>
            <div className="wrap-stat">
              <div className="wrap-stat-num">{s.xp}</div>
              <div className="wrap-stat-label">نقطة XP</div>
            </div>
            <div className="wrap-stat">
              <div className="wrap-stat-num">{juzCount}</div>
              <div className="wrap-stat-label">أجزاء قرآن</div>
            </div>
            <div className="wrap-stat">
              <div className="wrap-stat-num">{earnedTitles}</div>
              <div className="wrap-stat-label">ألقاب مكتسبة</div>
            </div>
          </div>
          <div className="wrap-highlight">
            🏆 مستواك الحالي: {core.levelName} — كمّل رحلتك!
          </div>
          <button
            className="btn-ghost"
            style={{ width: '100%', marginTop: 16, color: '#fff', background: 'rgba(255,255,255,0.18)' }}
            onClick={handleShareMonth}
          >
            {shared ? '✅ نسخناها!' : '📤 مشاركة ملخص الشهر'}
          </button>
        </div>
      )}

      {tab === 'road' && (
        <div className="card">
          <div className="road-path">
            <div className="road-line" />
            <div className="road-line-fill" style={{ height: `${fillPct}%` }} />
            {STATIONS.map((st, i) => {
              const reached = longest >= st.days;
              const isCurrent = i === firstUnreached;
              const cls = reached ? 'reached' : isCurrent ? 'current' : '';
              return (
                <div className="station" key={st.days}>
                  <div className={`station-dot ${cls}`}>
                    {reached ? '✓' : isCurrent ? '🚩' : st.days}
                  </div>
                  <div className="station-content">
                    <div className={reached ? 'station-title reached-text' : 'station-title'}>
                      {st.title} ({st.days} يوم)
                    </div>
                    <div className="station-sub">{st.sub}</div>
                    {isCurrent && (
                      <div className="station-badge">
                        باقي {Math.max(st.days - currentStreak, 0)} يوم
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'gallery' && (
        <div className="gallery-grid">
          {achievements.map((a) => (
            <div className={a.earned ? 'gallery-item earned' : 'gallery-item locked'} key={a.title}>
              <div className="gallery-emoji">{a.emoji}</div>
              <div className="gallery-title">{a.title}</div>
              <div className="gallery-date">{a.earned ? '✅ مكتسب' : `🔒 ${a.need}`}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
