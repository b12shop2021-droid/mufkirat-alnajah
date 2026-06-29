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
  const fem = core.state.profile.gender === 'female';
  const saveLabel = fem ? 'كفو عليّ يا زينة أنا قدها 💪' : 'كفو عليّ يا زيني أنا قدها 💪';

  const [rev1, setRev1] = useState('');
  const [rev2, setRev2] = useState('');
  const [rev3, setRev3] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string } | null>(null);

  const handleSave = () => {
    if (!rev1.trim() && !rev2.trim() && !rev3.trim()) {
      setHint('⚠️ جاوب على سؤال واحد ع الأقل');
      return;
    }
    core.addWeeklyReview(rev1, rev2, rev3);
    setRev1('');
    setRev2('');
    setRev3('');
    setHint('🔥 كفو! سجّلنا مراجعتك');
  };

  return (
    <div className="page">
      {!embedded && <BackButton />}
      {!embedded && <XPBar />}

      <h1 className="section-title">🪞 وقفة مع نفسك</h1>
      <div className="intro-card">
        دقيقة بس — راجع أسبوعك بصراحة، وكل أسبوع تصير نسخة أحسن 💪
      </div>

      <div className="card">
        <div className="review-q-row">
          <div className="review-q-num">١</div>
          <div className="review-q-text">وش أحلى إنجاز سويته هالأسبوع؟</div>
        </div>
        <textarea
          className="input-field" rows={2} placeholder="اكتب الشي اللي فخور فيه..."
          value={rev1} maxLength={200} onChange={(e) => setRev1(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <div className="review-q-row">
          <div className="review-q-num">٢</div>
          <div className="review-q-text">وش أصعب تحدّي واجهك؟</div>
        </div>
        <textarea
          className="input-field" rows={2} placeholder="وش الشي اللي تعبك..."
          value={rev2} maxLength={200} onChange={(e) => setRev2(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <div className="review-q-row">
          <div className="review-q-num">٣</div>
          <div className="review-q-text">وش بتغيّر الأسبوع الجاي؟</div>
        </div>
        <textarea
          className="input-field" rows={2} placeholder="خطوة وحدة بتسويها أحسن..."
          value={rev3} maxLength={200} onChange={(e) => setRev3(e.target.value)}
        />

        <button className="btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={handleSave}>
          {saveLabel}
        </button>
      </div>

      <h2 className="section-title">📂 مراجعاتك السابقة</h2>
      {weeklyReviews.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          ما فيه مراجعات بعد
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
        message="متأكد تبي تحذف هالمراجعة؟"
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
