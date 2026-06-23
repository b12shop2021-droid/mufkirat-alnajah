/* ===================================================================
   WheelReview.tsx — عجلة الحياة + مراجعة الأسبوع (تبويبان فرعيان)
   رادار SVG حي + تصنيف توازن تلقائي. 3 أسئلة ثابتة للمراجعة.
   كل الحالة عبر useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';

type Tab = 'wheel' | 'review';

/* مجالات عجلة الحياة الثمانية (أيقونة + اسم) */
const AREAS = [
  { icon: '💼', name: 'المهنة' },
  { icon: '💰', name: 'المال' },
  { icon: '💪', name: 'الصحة' },
  { icon: '❤️', name: 'العلاقات' },
  { icon: '🌱', name: 'النمو الشخصي' },
  { icon: '🎮', name: 'الترفيه' },
  { icon: '🏡', name: 'البيئة المحيطة' },
  { icon: '🕊️', name: 'الروحانيات' },
];

export default function WheelReview() {
  const core = useCore();
  const { wheelAreas, weeklyReviews } = core.state;

  const [tab, setTab] = useState<Tab>('wheel');
  const [rev1, setRev1] = useState('');
  const [rev2, setRev2] = useState('');
  const [rev3, setRev3] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string } | null>(null);

  /* حساب نقاط الرادار */
  const size = 220;
  const center = size / 2;
  const maxR = 85;
  const n = AREAS.length;
  const step = (2 * Math.PI) / n;
  const pointFor = (val: number, i: number) => {
    const angle = -Math.PI / 2 + i * step;
    const r = (val / 10) * maxR;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };
  const polygon = wheelAreas.map((v, i) => {
    const p = pointFor(v, i);
    return `${p.x},${p.y}`;
  }).join(' ');

  /* حلقات الشبكة */
  const rings = [2, 4, 6, 8, 10].map((ring) =>
    Array.from({ length: n }, (_, i) => {
      const angle = -Math.PI / 2 + i * step;
      const r = (ring / 10) * maxR;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' '),
  );

  /* تصنيف التوازن */
  const min = Math.min(...wheelAreas);
  const max = Math.max(...wheelAreas);
  const range = max - min;
  const weakestIdx = wheelAreas.indexOf(min);
  const weakest = AREAS[weakestIdx];

  let tagCls = 'balance-tag bt-good';
  let tagText = '🟢 متوازن';
  let insight = '✨ حياتك متوازنة نسبياً بين الجوانب المختلفة. استمر في هذا الانسجام!';
  if (range > 5) {
    tagCls = 'balance-tag bt-low';
    tagText = '🔴 غير متوازن';
  } else if (range > 3) {
    tagCls = 'balance-tag bt-mid';
    tagText = '🟡 يحتاج انتباه';
  }

  const handleSaveReview = () => {
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
      <BackButton />
      <XPBar />

      <div className="subtabs">
        <button
          className={tab === 'wheel' ? 'subtab active' : 'subtab'}
          onClick={() => setTab('wheel')}
        >
          🎡 عجلة الحياة
        </button>
        <button
          className={tab === 'review' ? 'subtab active' : 'subtab'}
          onClick={() => setTab('review')}
        >
          🪞 مراجعة الأسبوع
        </button>
      </div>

      {tab === 'wheel' && (
        <>
          <div className="card">
            <div className="wheel-svg-wrap">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {rings.map((pts, i) => (
                  <polygon
                    key={i}
                    points={pts}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth={1}
                  />
                ))}
                {AREAS.map((_, i) => {
                  const angle = -Math.PI / 2 + i * step;
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={center + maxR * Math.cos(angle)}
                      y2={center + maxR * Math.sin(angle)}
                      stroke="var(--border)"
                      strokeWidth={1}
                    />
                  );
                })}
                <polygon
                  points={polygon}
                  fill="var(--primary)"
                  fillOpacity={0.22}
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                />
                {wheelAreas.map((v, i) => {
                  const p = pointFor(v, i);
                  return <circle key={i} cx={p.x} cy={p.y} r={4} fill="var(--primary)" />;
                })}
              </svg>
            </div>

            <div className="balance-wrap">
              <span className={tagCls}>{tagText}</span>
            </div>

            <div className="life-areas">
              {AREAS.map((a, i) => (
                <div className="area-row" key={a.name}>
                  <div className="area-icon">{a.icon}</div>
                  <div className="area-name">{a.name}</div>
                  <input
                    type="range"
                    className="area-slider"
                    min={1}
                    max={10}
                    value={wheelAreas[i]}
                    onChange={(e) => core.setWheelArea(i, Number(e.target.value))}
                  />
                  <div className="area-val">{wheelAreas[i]}</div>
                </div>
              ))}
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: 16 }}
              onClick={core.saveWheel}
            >
              💾 حفظ تقييم هذا الشهر
            </button>
          </div>

          <div className="insight-card">
            {range <= 3 ? (
              insight
            ) : (
              <>
                💡 لاحظنا تفاوتاً ملحوظاً. جانب <strong>«{weakest.name}»</strong> (
                {min}/10) يحتاج اهتمامك الأكبر هذا الشهر لتحقيق توازن أفضل.
              </>
            )}
          </div>
        </>
      )}

      {tab === 'review' && (
        <>
          <div className="card">
            <div className="review-q-row">
              <div className="review-q-num">١</div>
              <div className="review-q-text formal-text">أعظم نجاح هذا الأسبوع؟</div>
            </div>
            <textarea
              className="input-field"
              rows={2}
              placeholder="اكتب أعظم ما حققته..."
              value={rev1}
              maxLength={200}
              onChange={(e) => setRev1(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <div className="review-q-row">
              <div className="review-q-num">٢</div>
              <div className="review-q-text formal-text">أكبر تحدٍ واجهته؟</div>
            </div>
            <textarea
              className="input-field"
              rows={2}
              placeholder="ما الذي كان صعباً عليك..."
              value={rev2}
              maxLength={200}
              onChange={(e) => setRev2(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <div className="review-q-row">
              <div className="review-q-num">٣</div>
              <div className="review-q-text formal-text">ماذا ستفعل مختلفاً الأسبوع القادم؟</div>
            </div>
            <textarea
              className="input-field"
              rows={2}
              placeholder="خطوة واحدة ستغيّرها..."
              value={rev3}
              maxLength={200}
              onChange={(e) => setRev3(e.target.value)}
            />

            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: 16 }}
              onClick={handleSaveReview}
            >
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
                    className="icon-btn"
                    aria-label="حذف"
                    style={{ float: 'left' }}
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
        </>
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
