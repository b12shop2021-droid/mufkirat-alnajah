/* ===================================================================
   WheelReview.tsx — مراجعة الأسبوع (3 أسئلة ثابتة + أرشيف)
   عجلة الحياة اليدوية حُذفت؛ التوازن يُقاس تلقائياً في "مرصد الانسجام" بالتحليلات.
   كل الحالة عبر useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';

export default function WheelReview({ embedded = false }: { embedded?: boolean }) {
  const core = useCore();
  const { weeklyReviews } = core.state;

  const [rev1, setRev1] = useState('');
  const [rev2, setRev2] = useState('');
  const [rev3, setRev3] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string } | null>(null);

  const handleSave = () => {
    if (!rev1.trim() && !rev2.trim() && !rev3.trim()) {
      setHint('⚠️ اكتب إجابة لسؤال واحد على الأقل');
      return;
    }
    core.addWeeklyReview(rev1, rev2, rev3);
    setRev1('');
    setRev2('');
    setRev3('');
    setHint('🪞 تم حفظ مراجعتك!');
  };

  return (
    <div className="page">
      {!embedded && <BackButton />}
      {!embedded && <XPBar />}

      <h1 className="section-title">🪞 مراجعة الأسبوع</h1>

      <div className="card">
        <div className="review-q-row">
          <div className="review-q-num">١</div>
          <div className="review-q-text formal-text">أعظم نجاح هذا الأسبوع؟</div>
        </div>
        <textarea
          className="input-field" rows={2} placeholder="اكتب أعظم ما حققته..."
          value={rev1} maxLength={200} onChange={(e) => setRev1(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <div className="review-q-row">
          <div className="review-q-num">٢</div>
          <div className="review-q-text formal-text">أكبر تحدٍ واجهته؟</div>
        </div>
        <textarea
          className="input-field" rows={2} placeholder="ما الذي كان صعباً عليك..."
          value={rev2} maxLength={200} onChange={(e) => setRev2(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <div className="review-q-row">
          <div className="review-q-num">٣</div>
          <div className="review-q-text formal-text">ماذا ستفعل مختلفاً الأسبوع القادم؟</div>
        </div>
        <textarea
          className="input-field" rows={2} placeholder="خطوة واحدة ستغيّرها..."
          value={rev3} maxLength={200} onChange={(e) => setRev3(e.target.value)}
        />

        <button className="btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={handleSave}>
          📂 حفظ في الأرشيف
        </button>
      </div>

      <h2 className="section-title">📂 أرشيف المراجعات السابقة</h2>
      {weeklyReviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          لا مراجعات بعد
        </div>
      ) : (
        weeklyReviews.map((r) => (
          <div className="archive-card" key={r.id}>
            <div className="archive-week">
              📅 {r.date}
              <button
                className="icon-btn" aria-label="حذف" style={{ float: 'left' }}
                onClick={() => setPendingDelete({ id: r.id })}
              >
                🗑️
              </button>
            </div>
            {r.success && <div className="archive-qa"><strong>النجاح:</strong> {r.success}</div>}
            {r.challenge && <div className="archive-qa"><strong>التحدي:</strong> {r.challenge}</div>}
            {r.next && <div className="archive-qa"><strong>القادم:</strong> {r.next}</div>}
          </div>
        ))
      )}

      {hint && <div className="hint-msg ok">{hint}</div>}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="تأكيد الحذف"
        message="هل تريد حذف هذه المراجعة نهائياً؟"
        confirmLabel="حذف"
        danger
        onConfirm={() => {
          if (pendingDelete) core.removeWeeklyReview(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
