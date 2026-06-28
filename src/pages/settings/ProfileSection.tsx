/* ===================================================================
   ProfileSection.tsx — الملف الشخصي (هيرو + تعديل البطاقة)
   جزء من صفحة الإعدادات. الحالة عبر useCore، والتنبيهات عبر setHint.
   =================================================================== */

import { useState } from 'react';
import { useCore, type Gender } from '../../core/useCore';
import PageHero from '../../components/PageHero';

export default function ProfileSection({ setHint }: { setHint: (m: string) => void }) {
  const core = useCore();
  const { profile } = core.state;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile.name,
    nickname: profile.nickname,
    gender: profile.gender,
    age: profile.age ? String(profile.age) : '',
    job: profile.job,
    height: profile.height ? String(profile.height) : '',
    weight: profile.weight ? String(profile.weight) : '',
  });

  const handleSave = () => {
    if (form.name.trim() === '') {
      setHint('⚠️ اكتب اسمك أول');
      return;
    }
    core.updateProfile({
      name: form.name,
      nickname: form.nickname.trim() || form.name,
      gender: form.gender,
      age: Number(form.age) || 0,
      job: form.job,
      height: Number(form.height) || 0,
      weight: Number(form.weight) || 0,
    });
    setEditing(false);
    setHint('🪪 حفظنا بطاقتك الشخصية!');
  };

  return (
    <>
      <PageHero variant="deep" centered>
        <div className="profile-avatar">{profile.name ? profile.name.charAt(0) : '🙂'}</div>
        <div className="profile-greeting">
          {profile.name || 'مرحباً بك'}
          {profile.nickname ? ` · ${profile.nickname}` : ''}
        </div>
        <div className="profile-meta">{profile.job || 'لم تُحدَّد المهنة بعد'}</div>
        <div className="profile-level-badge">
          ⭐ {core.levelName} · {core.state.xp} XP
        </div>
      </PageHero>

      <div className="section-title">الملف الشخصي</div>
      {!editing ? (
        <div className="settings-card">
          <button
            className="settings-row"
            style={{ width: '100%', textAlign: 'right' }}
            onClick={() => setEditing(true)}
          >
            <div className="settings-icon">🪪</div>
            <div className="settings-text">
              <div className="settings-label">بطاقتي الشخصية</div>
              <div className="settings-sub">الاسم، اللقب، الجنس، العمر، المهنة، الطول والوزن</div>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>‹</div>
          </button>
        </div>
      ) : (
        <div className="card">
          <label className="settings-label">الاسم الكامل</label>
          <input
            className="input-field"
            style={{ margin: '6px 0 12px' }}
            value={form.name}
            maxLength={200}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <label className="settings-label">كيف تحب أن نناديك؟</label>
          <input
            className="input-field"
            style={{ margin: '6px 0 4px' }}
            placeholder="مثال: يا بطل، يا كابتن"
            value={form.nickname}
            maxLength={200}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          />
          <div className="settings-sub" style={{ marginBottom: 12 }}>
            💡 يظهر في رسائل التحفيز بدل اسمك الكامل
          </div>

          <label className="settings-label">الجنس</label>
          <div className="add-row" style={{ margin: '6px 0 4px' }}>
            {(['male', 'female'] as Gender[]).map((g) => (
              <button
                key={g}
                className={form.gender === g ? 'btn-primary' : 'btn-ghost'}
                style={{ flex: 1 }}
                onClick={() => setForm({ ...form, gender: g })}
              >
                {g === 'male' ? '👨 ذكر' : '👩 أنثى'}
              </button>
            ))}
          </div>
          <div className="settings-sub" style={{ marginBottom: 12 }}>
            💡 يخصّص صيغة الخطاب (أحسنت / أحسنتِ)
          </div>

          <label className="settings-label">العمر</label>
          <input
            className="input-field"
            type="number"
            min={0}
            max={120}
            style={{ margin: '6px 0 12px' }}
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />

          <label className="settings-label">المهنة</label>
          <input
            className="input-field"
            style={{ margin: '6px 0 12px' }}
            value={form.job}
            maxLength={200}
            onChange={(e) => setForm({ ...form, job: e.target.value })}
          />

          <div className="add-row">
            <div style={{ flex: 1 }}>
              <label className="settings-label">الطول (سم)</label>
              <input
                className="input-field"
                type="number"
                min={0}
                max={300}
                style={{ marginTop: 6 }}
                value={form.height}
                onChange={(e) => setForm({ ...form, height: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="settings-label">الوزن (كجم)</label>
              <input
                className="input-field"
                type="number"
                min={0}
                max={500}
                style={{ marginTop: 6 }}
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
              />
            </div>
          </div>
          <div className="settings-sub" style={{ margin: '8px 0 12px' }}>
            📌 الطول والوزن بيانات شخصية فقط، لا ترتبط بأي حسابات صحية أخرى.
          </div>

          <div className="add-row">
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setEditing(false)}>
              إلغاء
            </button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>
              تـم
            </button>
          </div>
        </div>
      )}
    </>
  );
}
