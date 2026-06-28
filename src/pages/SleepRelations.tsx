/* ===================================================================
   SleepRelations.tsx — متتبع النوم + دائرة العلاقات (تبويبان فرعيان)
   تنبيه تلقائي عند 3 ليالٍ متتالية أقل من 6 ساعات. الحالة عبر useCore.
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHero from '../components/PageHero';

type Tab = 'sleep' | 'rel';

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
  const { sleepLog, relations } = core.state;

  const [tab, setTab] = useState<Tab>('sleep');
  const [sleepTime, setSleepTime] = useState('23:30');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [relName, setRelName] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(
    null,
  );

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

  const handleAddRel = () => {
    if (relName.trim() === '') {
      setHint('⚠️ اكتب اسم الشخص أولاً');
      return;
    }
    core.addRelation(relName);
    setRelName('');
    setHint(null);
  };

  const handleToggleRel = (id: string) => {
    core.toggleRelation(id);
  };

  return (
    <div className="page">
      <BackButton />
      <XPBar />

      <div className="subtabs">
        <button
          className={tab === 'sleep' ? 'subtab active' : 'subtab'}
          onClick={() => setTab('sleep')}
        >
          😴 النوم
        </button>
        <button
          className={tab === 'rel' ? 'subtab active' : 'subtab'}
          onClick={() => setTab('rel')}
        >
          👥 دائرة العلاقات
        </button>
      </div>

      {tab === 'sleep' && (
        <>
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
        </>
      )}

      {tab === 'rel' && (
        <>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.7rem' }}>👥</div>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginTop: 6 }}>
              مين تواصلت معه هالأسبوع؟ ومين ودّك تتصل فيه؟
            </div>
          </div>

          <div className="add-row">
            <input
              className="input-field"
              placeholder="اسم شخص تريد التواصل معه..."
              value={relName}
              maxLength={200}
              onChange={(e) => setRelName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRel()}
            />
            <button className="btn-primary" onClick={handleAddRel}>
              إضافة
            </button>
          </div>

          {relations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              👥 ما فيه أحد بالقائمة بعد — ضيف اسم شخص ودّك تتواصل معه
            </div>
          ) : (
            relations.map((r) => (
              <div className="rel-card" key={r.id}>
                <div className="rel-avatar">{r.name.charAt(0)}</div>
                <div className="rel-info">
                  <div className="rel-name">{r.name}</div>
                  <div className={r.contacted ? 'rel-status done' : 'rel-status'}>
                    {r.contacted ? '✓ تواصلت معه هالأسبوع' : 'لسا ما تواصلت'}
                  </div>
                </div>
                <button
                  className={r.contacted ? 'rel-check-btn done' : 'rel-check-btn'}
                  aria-label="تأكيد التواصل"
                  onClick={() => handleToggleRel(r.id)}
                >
                  {r.contacted ? '✓' : ''}
                </button>
                <button
                  className="icon-btn"
                  aria-label="حذف"
                  onClick={() => setPendingDelete({ id: r.id, label: r.name })}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </>
      )}

      {hint && <div className="hint-msg ok">{hint}</div>}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="تأكيد الحذف"
        message={`تبي تشيل «${pendingDelete?.label ?? ''}» من القائمة؟`}
        confirmLabel="حذف"
        danger
        onConfirm={() => {
          if (pendingDelete) core.removeRelation(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
