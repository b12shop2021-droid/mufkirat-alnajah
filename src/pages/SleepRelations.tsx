/* ===================================================================
   SleepRelations.tsx — متتبع النوم
   تنبيه تلقائي عند 3 ليالٍ متتالية أقل من 6 ساعات. الحالة عبر useCore.
   (دائرة العلاقات نُقلت إلى صفحة العلاقات والمناسبات /occasions)
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import PageHero from '../components/PageHero';

const DAY_NAMES = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];

/* تاريخ YYYY-MM-DD قبل offset يوماً */
const dateBefore = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
};

export default function SleepRelations() {
  const core = useCore();
  const { sleepLog } = core.state;

  const [sleepTime, setSleepTime] = useState('23:30');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [hint, setHint] = useState<string | null>(null);

  /* آخر 7 ليالٍ من بيانات حقيقية */
  const week = Array.from({ length: 7 }, (_, i) => {
    const offset = 6 - i;
    const date = dateBefore(offset);
    const entry = sleepLog.find((e) => e.date === date);
    const dayName = DAY_NAMES[new Date(date + 'T00:00:00').getDay()];
    return { dayName, hours: entry?.hours ?? 0 };
  });

  const lastHours = week[week.length - 1].hours;

  /* تنبيه: 3 ليالٍ متتالية (الأحدث) أقل من 6 ساعات */
  const lastThree = week.slice(-3);
  const lowAlert =
    lastThree.length === 3 && lastThree.every((d) => d.hours > 0 && d.hours < 6);

  const handleSaveSleep = () => {
    if (!sleepTime || !wakeTime) {
      setHint('⚠️ اكتب وقت النوم والصحيان');
      return;
    }
    const h = core.saveSleep(sleepTime, wakeTime);
    setHint(`😴 سجّلنا ${h} ساعة نوم — ريّح نفسك`);
  };

  return (
    <div className="page">
      <BackButton />
      <XPBar />

      <PageHero variant="calm" centered stars>
        <div className="sleep-moon">🌙</div>
        <div className="sleep-hours">{lastHours || '—'}</div>
        <div className="sleep-hours-label">ساعة نوم الليلة الماضية</div>
      </PageHero>

      {lowAlert && (
        <div className="sleep-alert">
          😴 لاحظنا أن نومك أقل من 6 ساعات لـ3 ليالٍ متتالية. النوم الكافي أساس
          كل تطوير شخصي — حاول النوم باكراً الليلة.
        </div>
      )}

      <div className="card">
        <div className="sleep-row">
          <div className="sleep-field">
            <label>🛏️ وقت النوم</label>
            <input
              type="time"
              className="input-field"
              style={{ textAlign: 'center' }}
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
            />
          </div>
          <div className="sleep-field">
            <label>⏰ وقت الصحيان</label>
            <input
              type="time"
              className="input-field"
              style={{ textAlign: 'center' }}
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
            />
          </div>
        </div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={handleSaveSleep}>
          💾 حفظ نوم الليلة
        </button>
      </div>

      <div className="card">
        <div className="section-title">📊 آخر 7 ليالٍ</div>
        <div className="sleep-bars">
          {week.map((d, i) => {
            const h = Math.round((d.hours / 9) * 70);
            return (
              <div className="sb-col" key={i}>
                <div className="sb-val">{d.hours || ''}</div>
                <div
                  className={d.hours > 0 && d.hours < 6 ? 'sb-bar low' : 'sb-bar'}
                  style={{ height: `${Math.max(h, 6)}px` }}
                />
                <div className="sb-lbl">{d.dayName}</div>
              </div>
            );
          })}
        </div>
      </div>

      {hint && <div className="hint-msg ok">{hint}</div>}
    </div>
  );
}
