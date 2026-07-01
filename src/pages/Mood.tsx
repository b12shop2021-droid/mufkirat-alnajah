/* ===================================================================
   Mood.tsx — المزاج والطاقة + لحظة الفخر اليومية (تبويب "يومي")
   كل الحالة عبر useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import { useCore, todayStr } from '../core/useCore';
import { saveLabel } from '../core/saveLabel';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';
import Dose from '../components/Dose';
import VentBox from '../components/VentBox';

/* 8 حالات مزاج (إيموجي + وصف) */
const MOODS = [
  { e: '😄', l: 'سعيد جداً' },
  { e: '😊', l: 'سعيد' },
  { e: '😐', l: 'عادي' },
  { e: '😔', l: 'حزين' },
  { e: '😤', l: 'متوتر' },
  { e: '🤩', l: 'متحمس' },
  { e: '😴', l: 'متعب' },
  { e: '💪', l: 'قوي' },
];

/* مؤشرات المزاج السيء — يُعرض عندها صندوق تفريغ الطاقة السلبية */
const NEGATIVE_MOOD_INDICES = [3, 4, 6];

/* وصف نسبي لعدد الأيام الماضية */
const relativeDay = (offset: number): string => {
  if (offset === 0) return 'اليوم';
  if (offset === 1) return 'أمس';
  if (offset === 2) return 'منذ يومين';
  return `منذ ${offset} أيام`;
};

/* تاريخ YYYY-MM-DD قبل offset يوماً */
const dateBefore = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
};

export default function Mood() {
  const core = useCore();
  const today = todayStr();
  const todayEntry = core.state.moodLog.find((m) => m.date === today);
  /* اللقب اللي يحب يُنادى فيه (وإلا الاسم، وإلا «بطل») */
  const nick = core.state.profile.nickname || core.state.profile.name || 'بطل';

  const [selected, setSelected] = useState<number | null>(
    todayEntry ? todayEntry.moodIdx : null,
  );
  const [energy, setEnergy] = useState<number>(todayEntry ? todayEntry.energy : 5);
  const [pride, setPride] = useState('');
  const [showArchive, setShowArchive] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(
    null,
  );

  /* حفظ المزاج بعد التحقق */
  const handleSaveMood = () => {
    if (selected === null) {
      setHint('⚠️ اختر مزاجك أولاً');
      return;
    }
    core.saveMood(selected, energy);
    setHint('😊 سجّلنا مزاجك، عساك دوم بخير');
  };

  /* إضافة لحظة فخر */
  const handleAddPride = () => {
    if (pride.trim() === '') {
      setHint('⚠️ اكتب لحظة تفتخر فيها');
      return;
    }
    core.addPride(pride);
    setPride('');
    setShowArchive(true);
  };

  /* سجل آخر 7 أيام من بيانات حقيقية */
  const history = Array.from({ length: 7 }, (_, i) => {
    const date = dateBefore(i);
    const entry = core.state.moodLog.find((m) => m.date === date);
    return { label: relativeDay(i), entry };
  });

  return (
    <div className="page">
      <BackButton />
      <XPBar />

      <h1 className="section-title">❤️ مودي اليوم</h1>
      <Dose section="mood" />

      <div className="card">
        <p style={{ textAlign: 'center', fontWeight: 700, marginBottom: 14 }}>
          اختر اللي يوصف مزاجك الحين
        </p>
        <div className="mood-grid">
          {MOODS.map((m, i) => (
            <button
              key={m.l}
              className={selected === i ? 'mood-opt sel' : 'mood-opt'}
              onClick={() => setSelected(i)}
            >
              <span className="me">{m.e}</span>
              <span className="ml">{m.l}</span>
            </button>
          ))}
        </div>

        <div className="energy-label">
          <span style={{ fontWeight: 700 }}>⚡ مستوى الطاقة</span>
          <div className="energy-badge">{energy}</div>
        </div>
        <div className="energy-cells">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={n <= energy ? 'energy-cell on' : 'energy-cell'}
              aria-label={`طاقة ${n}`}
              onClick={() => setEnergy(n)}
            />
          ))}
        </div>
        <div className="energy-scale">
          <span>منخفضة</span>
          <span>عالية</span>
        </div>

        <button
          className="btn-primary"
          style={{ width: '100%', marginTop: 16 }}
          onClick={handleSaveMood}
        >
          {saveLabel(nick)}
        </button>
      </div>

      {selected !== null && NEGATIVE_MOOD_INDICES.includes(selected) && (
        <>
          <h1 className="section-title">🌪️ فضّها هنا</h1>
          <VentBox />
        </>
      )}

      <h1 className="section-title">✨ لحظة الفخر اليومية</h1>
      <div className="pride-card">
        <div style={{ fontSize: '1.6rem' }}>🌟</div>
        <div className="pride-q formal-text" style={{ color: '#fff' }}>
          ما أفضل قرار اتخذته اليوم؟
        </div>
        <textarea
          className="input-field"
          rows={2}
          placeholder="اكتب لحظة تفتخر فيها اليوم..."
          value={pride}
          maxLength={200}
          onChange={(e) => setPride(e.target.value)}
        />
        <button
          className="btn-ghost"
          style={{ width: '100%', marginTop: 12 }}
          onClick={handleAddPride}
        >
          📌 إضافة للأرشيف
        </button>

        <div
          style={{
            textAlign: 'center',
            marginTop: 14,
            fontSize: '0.82rem',
            cursor: 'pointer',
            opacity: 0.9,
          }}
          onClick={() => setShowArchive((v) => !v)}
        >
          📂 أرشيف لحظات الفخر ({core.state.prideArchive.length})
        </div>

        {showArchive && (
          <div style={{ marginTop: 12 }}>
            {core.state.prideArchive.length === 0 ? (
              <div style={{ fontSize: '0.8rem', opacity: 0.8, textAlign: 'center' }}>
                ما فيه لحظات بعد
              </div>
            ) : (
              core.state.prideArchive.map((p) => (
                <div className="archive-item" key={p.id}>
                  <div>
                    {p.text}
                    <div className="archive-date">📅 {p.date}</div>
                  </div>
                  <button
                    className="icon-btn"
                    aria-label="حذف"
                    style={{ color: '#fff' }}
                    onClick={() => setPendingDelete({ id: p.id, label: p.text })}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {hint && <div className="hint-msg ok" style={{ marginTop: 12 }}>{hint}</div>}

      <h1 className="section-title" style={{ marginTop: 18 }}>
        📈 سجل آخر 7 أيام
      </h1>
      <div className="card">
        {history.map((h) => (
          <div className="hist-row" key={h.label}>
            <span className="hist-day">{h.label}</span>
            {h.entry ? (
              <div className="hist-data">
                <span style={{ fontSize: '1.1rem' }}>{MOODS[h.entry.moodIdx].e}</span>
                <span className="hist-energy">⚡ {h.entry.energy}/10</span>
              </div>
            ) : (
              <span className="hist-empty">ما تسجّل بعد</span>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="تأكيد الحذف"
        message={`تبي تحذف «${pendingDelete?.label ?? ''}» من الأرشيف؟`}
        confirmLabel="حذف"
        danger
        onConfirm={() => {
          if (pendingDelete) core.removePride(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
