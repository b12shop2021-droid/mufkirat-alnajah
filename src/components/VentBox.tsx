/* ===================================================================
   VentBox.tsx — تفريغ طاقة سلبية: خانة كتابة مؤقتة (بدون أرشيف)
   تُمحى تلقائياً بعد ساعة من الحفظ. الحالة عبر useCore (ventNote).
   =================================================================== */

import { useEffect, useState } from 'react';
import { useCore } from '../core/useCore';

export default function VentBox() {
  const core = useCore();
  const note = core.state.ventNote;
  const [draft, setDraft] = useState('');

  /* فحص دوري لانتهاء الصلاحية أثناء الجلسة المفتوحة */
  useEffect(() => {
    if (!note) return;
    const remaining = note.expiresAt - Date.now();
    if (remaining <= 0) {
      core.clearVentNote();
      return;
    }
    const t = setTimeout(() => core.clearVentNote(), remaining);
    return () => clearTimeout(t);
  }, [note, core]);

  if (note) {
    const minsLeft = Math.max(1, Math.round((note.expiresAt - Date.now()) / 60000));
    return (
      <div className="vent-card">
        <div className="vent-head">🌪️ طاقتك السلبية تفرّغت هنا</div>
        <div className="vent-text">{note.text}</div>
        <div className="vent-sub">⏳ تُمحى تلقائياً بعد {minsLeft} دقيقة — ما تُحفظ بأي أرشيف</div>
        <button className="btn-ghost" style={{ width: '100%', marginTop: 10 }} onClick={() => core.clearVentNote()}>
          🗑️ فرّغتها، مسحها الحين
        </button>
      </div>
    );
  }

  return (
    <div className="vent-card">
      <div className="vent-head">🌪️ فرّغ اللي بخاطرك</div>
      <div className="vent-sub" style={{ marginBottom: 10 }}>
        اكتب أي شي يضغطك الحين — تُمحى الكتابة تلقائياً بعد ساعة، بدون أرشيف يخزّنها عليك.
      </div>
      <textarea
        className="input-field"
        rows={3}
        placeholder="فضّها هنا وريّح بالك..."
        value={draft}
        maxLength={200}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button
        className="btn-primary"
        style={{ width: '100%', marginTop: 10 }}
        disabled={draft.trim() === ''}
        onClick={() => {
          core.setVentNote(draft);
          setDraft('');
        }}
      >
        🌪️ فضّها وفرّغ طاقتك
      </button>
    </div>
  );
}
