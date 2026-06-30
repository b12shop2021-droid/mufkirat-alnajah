/* ===================================================================
   QuranCalendar.tsx — القرآن الكريم + التقويم البصري (تبويبان فرعيان)
   شبكة 30 جزء بضغط دوري، دقائق التلاوة، تقويم ملوّن بالإنجاز الحقيقي.
   كل الحالة عبر useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import { useCore, todayStr } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import { getPrayerTimes, fmtTime, requestCoords, DEFAULT_COORDS } from '../core/prayerTimes';
import { requestNotifPermission, schedulePrayerNotifications } from '../core/notificationScheduler';
import Dose from '../components/Dose';

type Tab = 'quran' | 'cal';

/* أسماء الأجزاء الثلاثين */
const JUZ_NAMES = [
  'الم', 'سيقول', 'تلك الرسل', 'لن تنالوا', 'والمحصنات', 'لا يحب', 'وإذا سمعوا',
  'ولو أننا', 'قال الملأ', 'واعلموا', 'يعتذرون', 'وما من دابة', 'وما أبرئ',
  'ربما', 'سبحان', 'قال ألم', 'اقترب', 'قد أفلح', 'وقال الذين', 'أمّن خلق',
  'اتل ما', 'ومن يقنت', 'وما لي', 'فمن أظلم', 'إليه يرد', 'حم', 'قال فما',
  'قد سمع', 'تبارك', 'عمّ',
];

const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

/* صياغة تاريخ YYYY-MM-DD */
const fmt = (y: number, m: number, d: number): string =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export default function QuranCalendar() {
  const core = useCore();
  const { quranJuz, quranMinutes, moodLog, gratitudeLog, notes } = core.state;

  const [tab, setTab] = useState<Tab>('quran');
  const [minInput, setMinInput] = useState('');
  const [prayerHint, setPrayerHint] = useState('');

  /* مواقيت اليوم — من الإحداثيات المحفوظة أو الافتراضي (مكة) */
  const coords = core.state.prayerCoords ?? DEFAULT_COORDS;
  const prayers = getPrayerTimes(coords);
  const nextPrayer = prayers.find((p) => p.time.getTime() > Date.now());

  const handleEnablePrayer = async () => {
    const perm = await requestNotifPermission();
    if (perm !== 'granted') { setPrayerHint('⚠️ لازم تأذن للإشعارات أول'); return; }
    const c = await requestCoords();
    core.setPrayerCoords(c);
    core.setPrayerNotif(true);
    await schedulePrayerNotifications(c);
    setPrayerHint('🕌 فعّلنا تذكير الصلوات! بتوصلك بوقتها اليوم');
  };

  const now = new Date();
  const [calY, setCalY] = useState(now.getFullYear());
  const [calM, setCalM] = useState(now.getMonth());

  const readCount = Object.values(quranJuz).filter((s) => s === 'read').length;
  const memCount = Object.values(quranJuz).filter((s) => s === 'mem').length;
  const completedPct = Math.round(((readCount + memCount) / 30) * 100);

  /* إجمالي دقائق آخر 7 أيام */
  const weekTotal = (() => {
    const limit = new Date();
    limit.setDate(limit.getDate() - 6);
    return quranMinutes
      .filter((q) => q.date >= fmt(limit.getFullYear(), limit.getMonth(), limit.getDate()))
      .reduce((sum, q) => sum + q.minutes, 0);
  })();

  /* حفظ دقائق التلاوة */
  const handleSaveTime = () => {
    const n = Number(minInput);
    if (!n || n <= 0) return;
    core.addQuranMinutes(n);
    setMinInput('');
  };

  /* نسبة إنجاز يوم معيّن من بيانات حقيقية (مزاج/شكر/تلاوة/ملاحظة) */
  const dayCompletion = (dateStr: string): number | null => {
    const hasMood = moodLog.some((m) => m.date === dateStr) ? 1 : 0;
    const gratCount = Math.min(gratitudeLog.filter((g) => g.date === dateStr).length, 3);
    const hasQuran = quranMinutes.some((q) => q.date === dateStr) ? 1 : 0;
    const hasNote = notes.some((n) => n.date === dateStr) ? 1 : 0;
    const signals = hasMood + gratCount / 3 + hasQuran + hasNote;
    if (signals === 0) return null;
    return Math.round((signals / 4) * 100);
  };

  const changeMonth = (delta: number) => {
    let m = calM + delta;
    let y = calY;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setCalM(m);
    setCalY(y);
  };

  const firstDay = new Date(calY, calM, 1).getDay();
  const daysInMonth = new Date(calY, calM + 1, 0).getDate();
  const today = todayStr();

  return (
    <div className="page">
      <BackButton />
      <XPBar />

      <h1 className="section-title">📖 وردي اليومي</h1>
      <Dose section="quran" />

      <div className="subtabs">
        <button
          className={tab === 'quran' ? 'subtab active' : 'subtab'}
          onClick={() => setTab('quran')}
        >
          📖 القرآن الكريم
        </button>
        <button
          className={tab === 'cal' ? 'subtab active' : 'subtab'}
          onClick={() => setTab('cal')}
        >
          🗓️ التقويم البصري
        </button>
      </div>

      {tab === 'quran' && (
        <>
          <div className="ayah-banner">
            <div className="ayah-text">﴿ اقْرَأْ وَرَبُّكَ الْأَكْرَمُ ﴾</div>
          </div>

          <div className="qstats-row">
            <div className="qstat">
              <div className="qstat-num">{readCount + memCount}</div>
              <div className="qstat-label">📖 مقروء</div>
            </div>
            <div className="qstat">
              <div className="qstat-num">{memCount}</div>
              <div className="qstat-label">⭐ محفوظ</div>
            </div>
            <div className="qstat">
              <div className="qstat-num">{completedPct}%</div>
              <div className="qstat-label">✅ الإتمام</div>
            </div>
          </div>

          <div className="card">
            <div className="juz-legend">
              <span><span className="leg-dot leg-read" />مقروء</span>
              <span><span className="leg-dot leg-mem" />محفوظ</span>
            </div>
            <div className="juz-grid">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
                const st = quranJuz[j];
                const cls = st === 'read' ? 'juz-cell read' : st === 'mem' ? 'juz-cell mem' : 'juz-cell';
                return (
                  <button key={j} className={cls} onClick={() => core.cycleJuz(j)}>
                    <span className="juz-num">{j}</span>
                    <span className="juz-name">{JUZ_NAMES[j - 1]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="section-title">⏱️ وقت التلاوة اليومي</div>
            <div className="add-row">
              <input
                className="input-field"
                type="number"
                min={0}
                placeholder="عدد الدقائق اليوم"
                value={minInput}
                onChange={(e) => setMinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTime()}
              />
              <button className="btn-primary" onClick={handleSaveTime}>
                حفظ
              </button>
            </div>
            <div className="time-week">
              إجمالي هذا الأسبوع: <strong>{weekTotal}</strong> دقيقة
            </div>
          </div>

          {/* مواقيت الصلاة اليوم */}
          <div className="card">
            <div className="section-title">🕌 مواقيت الصلاة اليوم</div>
            <div className="prayer-grid">
              {prayers.map((p) => (
                <div className={nextPrayer?.key === p.key ? 'prayer-slot next' : 'prayer-slot'} key={p.key}>
                  <div className="prayer-name">{p.name}</div>
                  <div className="prayer-time">{fmtTime(p.time)}</div>
                </div>
              ))}
            </div>
            {!core.state.prayerCoords && (
              <div className="settings-sub" style={{ marginTop: 8 }}>
                📍 المواقيت حسب مكة المكرمة — فعّل التذكير لتحديد موقعك بدقة.
              </div>
            )}
            {core.state.prayerNotif ? (
              <div className="hint-msg ok" style={{ marginTop: 10 }}>✅ تذكير الصلوات مفعّل</div>
            ) : (
              <button className="btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handleEnablePrayer}>
                🔔 فعّل تذكير الصلوات
              </button>
            )}
            {prayerHint && <div className="hint-msg ok" style={{ marginTop: 8 }}>{prayerHint}</div>}
          </div>
        </>
      )}

      {tab === 'cal' && (
        <div className="card">
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={() => changeMonth(1)}>
              ←
            </button>
            <div className="cal-month-title">
              {MONTHS[calM]} {calY}
            </div>
            <button className="cal-nav-btn" onClick={() => changeMonth(-1)}>
              →
            </button>
          </div>
          <div className="cal-head">
            {['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'].map((d) => (
              <div className="cal-dn" key={d}>
                {d}
              </div>
            ))}
          </div>
          <div className="cal-grid">
            {Array.from({ length: firstDay }, (_, i) => (
              <div className="cal-day empty" key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const dateStr = fmt(calY, calM, d);
              const pct = dayCompletion(dateStr);
              let cls = 'cal-day';
              if (dateStr === today) cls += ' today';
              if (pct !== null) cls += pct >= 80 ? ' green' : pct >= 50 ? ' yellow' : ' red';
              return (
                <div className={cls} key={d}>
                  {d}
                  {pct !== null && <div className="cal-pct">{pct}%</div>}
                </div>
              );
            })}
          </div>
          <div className="cal-legend">
            <span><span className="leg-dot" style={{ background: 'var(--success)' }} />ممتاز ≥80%</span>
            <span><span className="leg-dot" style={{ background: 'var(--warning)' }} />جيد 50-79%</span>
            <span><span className="leg-dot" style={{ background: 'var(--danger)' }} />ضعيف &lt;50%</span>
          </div>
        </div>
      )}
    </div>
  );
}
