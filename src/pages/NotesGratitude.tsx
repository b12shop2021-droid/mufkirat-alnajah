/* ===================================================================
   NotesGratitude.tsx — ملاحظات سريعة + شكر اليوم (تبويبان فرعيان)
   الشكر محدود بـ 3 يومياً بالضبط. كل الحالة عبر useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import { useCore, todayStr } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';
import { fireConfetti } from '../components/Confetti';

type Tab = 'notes' | 'grat';

interface PendingDelete {
  kind: 'note' | 'grat';
  id: string;
  label: string;
}

export default function NotesGratitude() {
  const core = useCore();
  const today = todayStr();

  const [tab, setTab] = useState<Tab>('notes');
  const [noteText, setNoteText] = useState('');
  const [gratText, setGratText] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const todayGrat = core.state.gratitudeLog.filter((g) => g.date === today);
  const gratFull = todayGrat.length >= 3;

  /* إضافة ملاحظة */
  const handleAddNote = () => {
    if (noteText.trim() === '') {
      setHint('⚠️ اكتب ملاحظتك أولاً');
      return;
    }
    core.addNote(noteText);
    setNoteText('');
    setHint(null);
  };

  /* إضافة شكر مع فرض الحد */
  const handleAddGrat = (preset?: string) => {
    const value = preset ?? gratText;
    if (value.trim() === '') {
      setHint('⚠️ اكتب شي تشكر عليه');
      return;
    }
    const beforeCount = todayGrat.length;
    const ok = core.addGratitude(value);
    if (!ok) {
      setHint('✨ كمّلت ٣ شكر اليوم، الله يسعدك');
      return;
    }
    if (!preset) setGratText('');
    // احتفال فقط عند اكتمال الـ3 (إنجاز اليوم)
    if (beforeCount + 1 >= 3) fireConfetti();
    setHint(null);
  };

  /* تنفيذ الحذف */
  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'note') core.removeNote(pendingDelete.id);
    else core.removeGratitude(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <div className="page">
      <BackButton />
      <XPBar />

      <h1 className="section-title">📝 فضفضة وامتنان</h1>
      <div className="intro-card">
        💊 <strong>الجرعة المحفزة:</strong> اكتب اللي بخاطرك، واشكر ربك على النعم البسيطة اللي تسعدك.
      </div>

      <div className="subtabs">
        <button
          className={tab === 'notes' ? 'subtab active' : 'subtab'}
          onClick={() => setTab('notes')}
        >
          📝 ملاحظات سريعة
        </button>
        <button
          className={tab === 'grat' ? 'subtab active' : 'subtab'}
          onClick={() => setTab('grat')}
        >
          🙏 شكر اليوم
        </button>
      </div>

      {tab === 'notes' && (
        <>
          <div className="card">
            <textarea
              className="input-field"
              rows={3}
              placeholder="اكتب فكرتك أو ملاحظتك هنا..."
              value={noteText}
              maxLength={200}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: 12 }}
              onClick={handleAddNote}
            >
              📌 إضافة ملاحظة
            </button>
          </div>

          <div className="count-row">
            <span style={{ fontWeight: 800, color: 'var(--deep)' }}>
              ملاحظاتك المحفوظة
            </span>
            <span className="count-badge">{core.state.notes.length} ملاحظة</span>
          </div>

          {core.state.notes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              📭 ما فيه ملاحظات بعد — اكتب أول فكرة تجيك
            </div>
          ) : (
            core.state.notes.map((n) => (
              <div className="note-card" key={n.id}>
                <button
                  className="note-del"
                  aria-label="حذف"
                  onClick={() =>
                    setPendingDelete({ kind: 'note', id: n.id, label: n.text })
                  }
                >
                  ✕
                </button>
                <div className="note-text">{n.text}</div>
                <div className="note-date">📅 {n.date}</div>
              </div>
            ))
          )}
        </>
      )}

      {tab === 'grat' && (
        <>
          <div className="grat-hero">
            <div style={{ fontSize: '2rem' }}>🙏</div>
            <div style={{ fontWeight: 800, color: 'var(--deep)', marginTop: 6 }}>
              شكر اليوم
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              ٣ أشياء تستحق الشكر يومياً
            </div>
            <div className="grat-slots">
              {[0, 1, 2].map((i) => {
                const filled = i < todayGrat.length;
                return (
                  <div className={filled ? 'grat-slot filled' : 'grat-slot'} key={i}>
                    {filled ? '✓' : i + 1}
                  </div>
                );
              })}
            </div>
          </div>

          {gratFull ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--primary)', fontWeight: 700 }}>
              ✨ يوم مليان امتنان — كمّلت ٣ لحظات شكر اليوم
            </div>
          ) : (
            <div className="card">
              <div className="add-row">
                <input
                  className="input-field"
                  placeholder="أنا شاكر على..."
                  value={gratText}
                  maxLength={200}
                  onChange={(e) => setGratText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddGrat()}
                />
                <button className="btn-primary" onClick={() => handleAddGrat()}>
                  إضافة
                </button>
              </div>
            </div>
          )}

          {todayGrat.map((g, i) => (
            <div className="grat-item" key={g.id}>
              <div className="grat-num">{i + 1}</div>
              <span className="grat-item-text">{g.text}</span>
              <button
                className="icon-btn"
                aria-label="حذف"
                onClick={() =>
                  setPendingDelete({ kind: 'grat', id: g.id, label: g.text })
                }
              >
                ✕
              </button>
            </div>
          ))}
        </>
      )}

      {hint && <div className="hint-msg ok">{hint}</div>}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="تأكيد الحذف"
        message={`متأكد تبي تحذف «${pendingDelete?.label ?? ''}»؟`}
        confirmLabel="حذف"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
