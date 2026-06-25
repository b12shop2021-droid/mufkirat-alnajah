/* ===================================================================
   Onboarding.tsx — شاشة الترحيب الأولى
   تجمع الاسم واللقب والجنس وأول هدف، مع خيار تحدّي 21 يوم. لهجة سعودية.
   =================================================================== */

import { useState } from 'react';
import { useCore, type Gender } from '../core/useCore';

export default function Onboarding() {
  const core = useCore();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [goal, setGoal] = useState('');
  const [challenge, setChallenge] = useState(true);

  const finish = () => {
    core.updateProfile({
      name: name.trim() || 'بطل',
      nickname: nickname.trim(),
      gender,
    });
    if (goal.trim()) core.addGoal(goal, 'شخصي');
    if (challenge) core.startChallenge21();
    core.setOnboarded(true);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-logo">
        <div className="auth-logo-badge">🏆</div>
        <div className="auth-title">يا هلا فيك!</div>
        <div className="auth-sub">خلّنا نجهّز مفكرتك بثوانٍ</div>
      </div>

      {step === 1 && (
        <div className="card">
          <div className="auth-field">
            <label>وش اسمك؟</label>
            <input className="input-field" placeholder="اسمك" value={name} maxLength={200}
              onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="auth-field">
            <label>كيف تحب نناديك؟</label>
            <input className="input-field" placeholder="مثال: يا بطل، يا كابتن" value={nickname} maxLength={200}
              onChange={(e) => setNickname(e.target.value)} />
          </div>
          <label className="settings-label">الجنس</label>
          <div className="add-row" style={{ marginTop: 6 }}>
            {(['male', 'female'] as Gender[]).map((g) => (
              <button key={g} className={gender === g ? 'btn-primary' : 'btn-ghost'} style={{ flex: 1 }}
                onClick={() => setGender(g)}>
                {g === 'male' ? '👨 ذكر' : '👩 أنثى'}
              </button>
            ))}
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => setStep(2)}>
            التالي ←
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <div className="auth-field">
            <label>وش أول هدف ودّك تحققه؟ (اختياري)</label>
            <input className="input-field" placeholder="مثال: أقرأ كتاب هالشهر" value={goal} maxLength={200}
              onChange={(e) => setGoal(e.target.value)} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0', fontSize: '0.85rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={challenge} onChange={(e) => setChallenge(e.target.checked)} />
            🔥 ابدأ بتحدّي 21 يوم (روتين وهدف جاهز)
          </label>
          <button className="btn-primary" style={{ width: '100%' }} onClick={finish}>
            يلا نبدأ 🚀
          </button>
          <button className="btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setStep(1)}>
            رجوع
          </button>
        </div>
      )}

      <div className="auth-note">تقدر تعدّل كل شي لاحقاً من الإعدادات.</div>
    </div>
  );
}
