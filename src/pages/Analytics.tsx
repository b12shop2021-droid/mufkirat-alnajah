/* ===================================================================
   Analytics.tsx — التحليلات
   البطاقات الأربع الأصلية محفوظة + مرصد الانسجام + رسوم محسوبة من بيانات حقيقية.
   صفحة عرض فقط عبر useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';

type Filter = 'week' | 'month' | 'year';
const DAY_NAMES = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

const dateBefore = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Analytics() {
  const core = useCore();
  const s = core.state;
  const [filter, setFilter] = useState<Filter>('month');

  /* البطاقات الأربع الأصلية */
  const habitsTracked = s.routine.morning.length + s.routine.evening.length;
  const goalsCompleted = s.goals.filter((g) => g.completed).length;
  const today = dateBefore(0);
  const routineToday = [...s.routine.morning, ...s.routine.evening];
  const doneToday = routineToday.filter((t) => t.doneDate === today).length;
  const completionRate = routineToday.length
    ? Math.round((doneToday / routineToday.length) * 100)
    : 0;

  /* مرصد الانسجام — يُقاس تلقائياً من نشاطك الفعلي عبر كل مجالات التطبيق (آخر 7 أيام).
     كل مجال يجمّع الأقسام المرتبطة به ليعكس التطبيق كاملاً. */
  const within7 = (date?: string) => !!date && date >= dateBefore(6);
  const domains = [
    { name: 'العبادة', active: s.quranMinutes.some((q) => within7(q.date)) },
    { name: 'الصحة', active: s.workoutLogs.some((l) => within7(l.date)) || s.sleepLog.some((e) => within7(e.date)) || s.meals.some((m) => within7(m.date)) },
    { name: 'الامتنان', active: s.gratitudeLog.some((g) => within7(g.date)) },
    { name: 'المزاج', active: s.moodLog.some((m) => within7(m.date)) },
    { name: 'الإنتاجية', active: [...s.routine.morning, ...s.routine.evening].some((t) => within7(t.doneDate)) || s.notes.some((n) => within7(n.date)) || s.intentionLog.some((e) => within7(e.date)) },
    { name: 'الطموح', active: s.goals.some((g) => !g.completed) || s.pledges.length > 0 },
    { name: 'المال', active: s.expenses.some((e) => within7(e.date)) },
    { name: 'العلاقات', active: s.relations.some((r) => within7(r.contactedDate)) },
  ];
  const activeDomains = domains.filter((d) => d.active).length;
  const coverage = Math.round((activeDomains / domains.length) * 100);
  const weakest = domains.find((d) => !d.active);
  const harmony =
    coverage >= 70
      ? { txt: '🟢 متوازن', detail: 'نشاطك موزّع جيداً عبر جوانب حياتك — استمر بهذا الإيقاع!' }
      : coverage >= 40
        ? { txt: '🟡 يحتاج انتباه', detail: `بعض الجوانب مهملة هذا الأسبوع${weakest ? ` — جرّب الاهتمام بـ"${weakest.name}"` : ''}.` }
        : { txt: '🔴 غير متوازن', detail: `معظم الجوانب غير نشطة${weakest ? ` — ابدأ بـ"${weakest.name}"` : ''}.` };

  /* نشاط آخر 7 أيام (عدد الإشارات في كل يوم) */
  const hasOn = (date: string) =>
    (s.moodLog.some((m) => m.date === date) ? 1 : 0) +
    (s.gratitudeLog.some((g) => g.date === date) ? 1 : 0) +
    (s.quranMinutes.some((q) => q.date === date) ? 1 : 0) +
    (s.notes.some((n) => n.date === date) ? 1 : 0) +
    (s.sleepLog.some((e) => e.date === date) ? 1 : 0);
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = dateBefore(6 - i);
    return { day: DAY_NAMES[new Date(date + 'T00:00:00').getDay()], val: hasOn(date) };
  });
  const maxAct = Math.max(1, ...week.map((d) => d.val));

  /* المصاريف حسب الفئة ضمن النطاق المختار */
  const inRange = (date: string) => {
    if (filter === 'week') return date >= dateBefore(6);
    if (filter === 'month') return date.slice(0, 7) === today.slice(0, 7);
    return date.slice(0, 4) === today.slice(0, 4);
  };
  const expCats: Record<string, number> = {};
  s.expenses
    .filter((e) => e.type === 'expense' && inRange(e.date))
    .forEach((e) => { expCats[e.category] = (expCats[e.category] || 0) + e.amount; });
  const expEntries = Object.entries(expCats).sort((a, b) => b[1] - a[1]);
  const expMax = Math.max(1, ...expEntries.map(([, v]) => v));

  /* الأهداف: مكتملة مقابل قيد التنفيذ */
  const goalsActive = s.goals.length - goalsCompleted;
  const goalsMax = Math.max(1, goalsCompleted, goalsActive);

  /* الشارات (نفس منطق صفحة السلسلة) */
  const doneSteps = s.goals.reduce((sum, g) => sum + g.steps.filter((x) => x.done).length, 0);
  const readJuz = Object.keys(s.quranJuz).length;
  const badges = [
    { icon: '🎯', name: 'صانع القرار', earned: doneSteps >= 100 },
    { icon: '🙏', name: 'قلب شاكر', earned: s.gratitudeLog.length >= 50 },
    { icon: '🌅', name: 'حارس الفجر', earned: s.streak.current >= 30 },
    { icon: '📖', name: 'خاتم القرآن', earned: readJuz >= 30 },
    { icon: '🔥', name: 'لا يُقهر', earned: s.streak.longest >= 30 },
  ];

  /* سلسلة الاتجاه حسب الفلتر: أسبوع=7 أيام · شهر=4 أسابيع · سنة=12 شهر */
  const MONTH_ABBR = ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'];
  const trend = (() => {
    if (filter === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const date = dateBefore(6 - i);
        return { label: DAY_NAMES[new Date(date + 'T00:00:00').getDay()], val: hasOn(date) };
      });
    }
    if (filter === 'month') {
      return Array.from({ length: 4 }, (_, wk) => {
        let sum = 0;
        for (let d = 0; d < 7; d++) sum += hasOn(dateBefore((3 - wk) * 7 + d));
        return { label: `أسبوع ${wk + 1}`, val: sum };
      });
    }
    return Array.from({ length: 12 }, (_, mi) => {
      const dt = new Date();
      dt.setMonth(dt.getMonth() - (11 - mi));
      const prefix = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      const val =
        s.moodLog.filter((m) => m.date.startsWith(prefix)).length +
        s.gratitudeLog.filter((g) => g.date.startsWith(prefix)).length +
        s.quranMinutes.filter((q) => q.date.startsWith(prefix)).length +
        s.notes.filter((n) => n.date.startsWith(prefix)).length +
        s.sleepLog.filter((e) => e.date.startsWith(prefix)).length;
      return { label: MONTH_ABBR[dt.getMonth()], val };
    });
  })();

  /* خط الاتجاه (مقياس Y ديناميكي حسب أعلى قيمة) */
  const w = 320, h = 140, pad = 20;
  const trendMax = Math.max(1, ...trend.map((t) => t.val));
  const stepX = trend.length > 1 ? (w - 2 * pad) / (trend.length - 1) : 0;
  const linePts = trend.map((d, i) => ({
    x: pad + i * stepX,
    y: h - pad - (d.val / trendMax) * (h - 2 * pad),
  }));
  const linePath = linePts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const trendTitle = filter === 'week' ? 'آخر 7 أيام' : filter === 'month' ? 'آخر 4 أسابيع' : 'آخر 12 شهر';

  /* أنشط أيام الأسبوع (متوسط النشاط لكل يوم عبر آخر 8 أسابيع) */
  const wdTotals = Array(7).fill(0);
  const wdCounts = Array(7).fill(0);
  for (let off = 0; off < 56; off++) {
    const date = dateBefore(off);
    const wd = new Date(date + 'T00:00:00').getDay();
    wdTotals[wd] += hasOn(date);
    wdCounts[wd] += 1;
  }
  const wdAvg = wdTotals.map((t, i) => (wdCounts[i] ? t / wdCounts[i] : 0));
  const wdMax = Math.max(0.0001, ...wdAvg);
  const bestWd = wdAvg.indexOf(Math.max(...wdAvg));
  const FULL_DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const hasAnyActivity = wdTotals.some((t) => t > 0);

  /* متوسط الطاقة ضمن الفترة المختارة */
  const moodInRange = s.moodLog.filter((m) => inRange(m.date));
  const avgEnergy = moodInRange.length
    ? Math.round((moodInRange.reduce((a, m) => a + m.energy, 0) / moodInRange.length) * 10) / 10
    : 0;

  return (
    <div className="page">
      <BackButton />
      <XPBar />

      <h1 className="section-title">📊 إنجازي الأسبوعي</h1>
      <div className="intro-card">
        💊 <strong>الجرعة المحفزة:</strong> شف أرقامك وتطورك وتأكد إنك جالس تبدع وتتقدم!
      </div>

      <div className="harmony-card">
        <div className="harmony-label">⚖️ مرصد الانسجام</div>
        <div className="harmony-status">{harmony.txt}</div>
        <div className="harmony-detail">{harmony.detail}</div>
      </div>

      <div className="stats-grid-4">
        <div className="stat-tile">
          <div className="stat-tile-icon">📈</div>
          <div className="stat-tile-num">{habitsTracked}</div>
          <div className="stat-tile-label">العادات المتابعة</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon">🎯</div>
          <div className="stat-tile-num">{goalsCompleted}</div>
          <div className="stat-tile-label">الأهداف المكتملة</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon">📊</div>
          <div className="stat-tile-num">{completionRate}%</div>
          <div className="stat-tile-label">معدل الإنجاز</div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-icon">🏅</div>
          <div className="stat-tile-num">{s.xp}</div>
          <div className="stat-tile-label">النقاط المكتسبة</div>
        </div>
      </div>

      <div className="filter-row">
        {(['week', 'month', 'year'] as Filter[]).map((f) => (
          <button
            key={f}
            className={filter === f ? 'filter-btn active' : 'filter-btn'}
            onClick={() => setFilter(f)}
          >
            {f === 'week' ? 'أسبوع' : f === 'month' ? 'شهر' : 'سنة'}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="section-title">📈 نشاطك خلال {trendTitle}</div>
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
          <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          {linePts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--primary)" />
          ))}
          {trend.map((d, i) => (
            <text key={i} x={linePts[i].x} y={h - 4} fontSize={8} fill="var(--text-secondary)" textAnchor="middle">
              {d.label}
            </text>
          ))}
        </svg>
      </div>

      {hasAnyActivity && (
        <div className="card">
          <div className="section-title">🗓️ أنشط أيام أسبوعك</div>
          <div className="insight-line">أكثر يوم تنشط فيه عادةً: <strong>{FULL_DAYS[bestWd]}</strong></div>
          <div className="habit-activity-grid" style={{ marginTop: 10 }}>
            {wdAvg.map((v, i) => (
              <div className="ha-col" key={i}>
                <div className="ha-bar-wrap">
                  <div
                    className="ha-bar"
                    style={{ height: `${Math.max(6, (v / wdMax) * 70)}px`, opacity: i === bestWd ? 1 : 0.55 }}
                  />
                </div>
                <div className="ha-day">{DAY_NAMES[i]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {moodInRange.length > 0 && (
        <div className="card">
          <div className="section-title">⚡ متوسط طاقتك ({filter === 'week' ? 'الأسبوع' : filter === 'month' ? 'الشهر' : 'السنة'})</div>
          <div className="energy-avg-row">
            <div className="energy-avg-num">{avgEnergy}<span>/10</span></div>
            <div className="energy-avg-bar-bg">
              <div className="energy-avg-bar-fill" style={{ width: `${(avgEnergy / 10) * 100}%` }} />
            </div>
          </div>
          <div className="insight-line" style={{ marginTop: 8 }}>
            من {moodInRange.length} يوم سجّلت فيه مزاجك
            {avgEnergy >= 7 ? ' — طاقتك ممتازة، كفو! 🔥' : avgEnergy >= 4 ? ' — طاقتك متوسطة، تقدر ترفعها 💪' : ' — طاقتك منخفضة، ريّح نفسك واهتم بنومك 😴'}
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-title">🎯 الأهداف</div>
        <div className="dist-row">
          <div className="dist-icon">✅</div>
          <div className="dist-name">مكتملة</div>
          <div className="dist-bar-bg">
            <div className="dist-bar-fill" style={{ width: `${(goalsCompleted / goalsMax) * 100}%`, background: 'var(--success)' }} />
          </div>
          <div className="dist-val">{goalsCompleted}</div>
        </div>
        <div className="dist-row">
          <div className="dist-icon">⏳</div>
          <div className="dist-name">قيد التنفيذ</div>
          <div className="dist-bar-bg">
            <div className="dist-bar-fill" style={{ width: `${(goalsActive / goalsMax) * 100}%`, background: 'var(--warning)' }} />
          </div>
          <div className="dist-val">{goalsActive}</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">💰 المصاريف حسب الفئة</div>
        {expEntries.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>ما فيه مصاريف بهالفترة</div>
        ) : (
          expEntries.map(([cat, val], i) => (
            <div className="dist-row" key={cat}>
              <div className="dist-icon">💸</div>
              <div className="dist-name">{cat}</div>
              <div className="dist-bar-bg">
                <div
                  className="dist-bar-fill"
                  style={{ width: `${(val / expMax) * 100}%`, background: `var(--chart-${(i % 8) + 1})` }}
                />
              </div>
              <div className="dist-val">{val}</div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div className="section-title">🔄 نشاط العادات الأسبوعي</div>
        <div className="habit-activity-grid">
          {week.map((d, i) => (
            <div className="ha-col" key={i}>
              <div className="ha-val">{d.val}</div>
              <div className="ha-bar-wrap">
                <div className="ha-bar" style={{ height: `${Math.max(6, (d.val / maxAct) * 70)}px` }} />
              </div>
              <div className="ha-day">{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="section-title">🏆 الشارات والإنجازات</div>
        <div className="badges-row">
          {badges.map((b) => (
            <div className={b.earned ? 'badge-tile earned' : 'badge-tile locked'} key={b.name}>
              <div className="badge-tile-emoji">{b.icon}</div>
              <div className="badge-tile-name">{b.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
