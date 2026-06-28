/* ===================================================================
   Pledges.tsx — العهود + صندوق الزمن + رسائل المستقبل (القسم المُبرز)
   العهود: صيغة حرفية، 5 معالم (3/7/14/30/90)، لا عقاب عند الانكسار.
   رسائل المستقبل: 3 قوالب ثابتة عشوائية (لا AI). الحالة عبر useCore.
   =================================================================== */

import { useState } from 'react';
import { useCore, todayStr, type Pledge } from '../core/useCore';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';
import { fireConfetti } from '../components/Confetti';

type Tab = 'pledges' | 'capsule';

const MILESTONES = [3, 7, 14, 30, 90];

/* رسالة مختلفة لكل معلم تناسب صعوبته */
const MILESTONE_MSG: Record<number, string> = {
  3: '🌱 بداية قوية! 3 أيام — أصعب خطوة وقد تجاوزتها',
  7: '🌟 أسبوع كامل! إرادتك تكبر يوماً بعد يوم',
  14: '🏆 أهنيك يا بطل! أسبوعين كاملين — أنت تستطيع الاستمرار',
  30: '🎉 شهر كامل! تحوّلت العادة، أنت شخص جديد الآن',
  90: '👑 90 يوماً! إنجاز استثنائي — أنت قدوة لمن حولك',
};

const daysSince = (dateStr: string): number => {
  const start = new Date(dateStr + 'T00:00:00').getTime();
  const now = new Date(todayStr() + 'T00:00:00').getTime();
  return Math.max(0, Math.round((now - start) / 86400000));
};

export default function Pledges() {
  const core = useCore();
  const { pledges, timeCapsule, profile } = core.state;
  const userName = profile.name || 'أنا';

  const [tab, setTab] = useState<Tab>('pledges');
  const [habit, setHabit] = useState('');
  const [adding, setAdding] = useState(false);
  const [statsFor, setStatsFor] = useState<string | null>(null);
  const [resetFor, setResetFor] = useState<Pledge | null>(null);
  const [deleteFor, setDeleteFor] = useState<Pledge | null>(null);
  const [capsuleText, setCapsuleText] = useState('');
  const [hint, setHint] = useState<string | null>(null);

  const handleAddPledge = () => {
    if (habit.trim() === '') {
      setHint('⚠️ اكتب اسم العادة أولاً');
      return;
    }
    core.addPledge(habit);
    setHabit('');
    setAdding(false);
    fireConfetti();
  };

  const handleLockCapsule = () => {
    if (capsuleText.trim() === '') {
      setHint('⚠️ اكتب رسالتك أولاً');
      return;
    }
    core.lockCapsule(capsuleText);
    setCapsuleText('');
    fireConfetti();
    setHint('🔒 أُغلقت الكبسولة! ستُفتح بعد 30 يوماً');
  };

  /* حالة الكبسولة */
  const capsuleDaysPassed = timeCapsule ? daysSince(timeCapsule.lockDate) : 0;
  const capsuleReady = timeCapsule ? capsuleDaysPassed >= 30 : false;
  const capsulePct = timeCapsule ? Math.min(100, Math.round((capsuleDaysPassed / 30) * 100)) : 0;

  const renderPledge = (p: Pledge) => {
    const days = daysSince(p.startDate);
    const next = MILESTONES.find((m) => days < m) ?? null;
    const passed = MILESTONES.filter((m) => days >= m);
    const lastPassed = passed.length ? passed[passed.length - 1] : null;
    const showStats = statsFor === p.id;
    return (
      <div className="pledge-card" key={p.id}>
        <div className="pledge-oath">
          أنا <strong className="pledge-name">{userName}</strong> أعاهد نفسي بقطع{' '}
          <strong className="pledge-habit">{p.habit}</strong> من اليوم{' '}
          <strong>{p.startDate}</strong>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <div className="pledge-counter">{days}</div>
          <div className="pledge-counter-label">
            يوماً بدون هذه العادة{' '}
            {next ? `· المعلم القادم: ${next} يوم` : '· أنجزت كل المعالم! 👑'}
          </div>
        </div>
        {lastPassed && <div className="milestone-msg">{MILESTONE_MSG[lastPassed]}</div>}
        <div className="pledge-milestones">
          {MILESTONES.map((m) => (
            <div className={days >= m ? 'ms-dot passed' : 'ms-dot'} key={m}>
              {m}
            </div>
          ))}
        </div>

        {showStats && (
          <div className="card" style={{ color: 'var(--text)', marginTop: 14, marginBottom: 0 }}>
            <div className="stats-row"><span>تاريخ بدء العهد الحالي</span><span>{p.startDate}</span></div>
            <div className="stats-row"><span>أطول مدة التزام</span><span>{Math.max(p.bestDays, days)} يوم</span></div>
            <div className="stats-row"><span>عدد مرات إعادة البدء</span><span>{p.resets} مرة</span></div>
          </div>
        )}

        <div className="pledge-actions">
          <button className="pledge-btn pb-stats" onClick={() => setStatsFor(showStats ? null : p.id)}>
            📊 الإحصائيات
          </button>
          <button className="pledge-btn pb-reset" onClick={() => setResetFor(p)}>
            🔄 انكسر العهد
          </button>
          <button className="pledge-btn pb-reset" onClick={() => setDeleteFor(p)}>
            🗑️ حذف
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <BackButton />

      <div className="subtabs">
        <button className={tab === 'pledges' ? 'subtab active' : 'subtab'} onClick={() => setTab('pledges')}>
          🛡️ العهود
        </button>
        <button className={tab === 'capsule' ? 'subtab active' : 'subtab'} onClick={() => setTab('capsule')}>
          📦 صندوق الزمن
        </button>
      </div>

      {tab === 'pledges' && (
        <>
          <div className="intro-card">
            🛡️ عهد شخصي لقطع عادة سلبية. لا عقاب عند الانكسار، فقط استمرار بقلب أقوى.
          </div>

          {pledges.map(renderPledge)}

          {adding ? (
            <div className="card">
              <label className="settings-label">العادة التي تريد قطعها</label>
              <input
                className="input-field"
                style={{ margin: '6px 0 12px' }}
                placeholder="مثال: التدخين، التأجيل، السوشيال ميديا الزائدة"
                value={habit}
                maxLength={200}
                onChange={(e) => setHabit(e.target.value)}
              />
              <div className="modal-oath-preview formal-text" style={{ textAlign: 'center', marginBottom: 12 }}>
                أنا <strong>{userName}</strong> أعاهد نفسي بقطع{' '}
                <strong>{habit.trim() || '[العادة]'}</strong> من اليوم
              </div>
              <div className="add-row">
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setAdding(false)}>
                  إلغاء
                </button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddPledge}>
                  🛡️ اعتماد العهد
                </button>
              </div>
            </div>
          ) : (
            <button className="dashed-btn" onClick={() => setAdding(true)}>
              + عهد جديد
            </button>
          )}
        </>
      )}

      {tab === 'capsule' && (
        <>
          <div className="capsule-hero">
            <div className="capsule-icon">📦</div>
            <div className="capsule-status">
              {!timeCapsule
                ? 'لا كبسولة بعد'
                : capsuleReady
                  ? '🎉 كبسولتك جاهزة!'
                  : 'كبسولتك مغلقة بإحكام'}
            </div>
            <div className="capsule-days-left">
              {!timeCapsule
                ? 'اكتب أول رسالة لنفسك بالأسفل'
                : capsuleReady
                  ? 'حان وقت فتحها الآن'
                  : `تُفتح بعد ${30 - capsuleDaysPassed} يوماً`}
            </div>
            {timeCapsule && (
              <div className="capsule-progress-bg">
                <div className="capsule-progress-fill" style={{ width: `${capsulePct}%` }} />
              </div>
            )}
          </div>

          {timeCapsule && capsuleReady && (
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>🎉</div>
              <div style={{ fontWeight: 800, color: 'var(--deep)', marginTop: 6 }}>
                كبسولتك جاهزة للفتح!
              </div>
              <div className="capsule-msg-box">{timeCapsule.message}</div>
            </div>
          )}

          <div className="card">
            <div className="settings-label" style={{ marginBottom: 8 }}>
              ✍️ اكتب رسالة جديدة لنفسك (تُفتح بعد 30 يوماً)
            </div>
            <textarea
              className="input-field formal-text"
              rows={4}
              placeholder="اكتب ما تريد أن تتذكره بعد شهر..."
              value={capsuleText}
              maxLength={200}
              onChange={(e) => setCapsuleText(e.target.value)}
            />
            <button className="btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handleLockCapsule}>
              🔒 إغلاق الكبسولة لـ30 يوماً
            </button>
          </div>
        </>
      )}

      {hint && <div className="hint-msg ok">{hint}</div>}

      {/* انكسار العهد — لا عقاب */}
      <ConfirmDialog
        open={resetFor !== null}
        title="بداية جديدة 💪"
        message="لا مشكلة، فقط لا تكرر نفس الخطأ مرة أخرى 💪 — سنبدأ العداد من جديد بنفس العزم."
        confirmLabel="إعادة البدء بعزيمة"
        cancelLabel="رجوع"
        onConfirm={() => {
          if (resetFor) core.resetPledge(resetFor.id);
          setResetFor(null);
        }}
        onCancel={() => setResetFor(null)}
      />

      <ConfirmDialog
        open={deleteFor !== null}
        title="تأكيد الحذف"
        message={`متأكد تبي تحذف عهد «${deleteFor?.habit ?? ''}»؟`}
        confirmLabel="حذف"
        danger
        onConfirm={() => {
          if (deleteFor) core.removePledge(deleteFor.id);
          setDeleteFor(null);
        }}
        onCancel={() => setDeleteFor(null)}
      />
    </div>
  );
}
