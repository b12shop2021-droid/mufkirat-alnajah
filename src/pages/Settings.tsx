/* ===================================================================
   Settings.tsx — الإعدادات والملف الشخصي
   الملف الشخصي + الوضع الليلي + مبدّل الثيمات (5 ألوان) — كلها عبر useCore.
   =================================================================== */

import { useState } from 'react';
import { useCore, type AccentName, type Gender } from '../core/useCore';
import BackButton from '../components/BackButton';
import Notifications from './Notifications';
import { promptInstall } from '../pwa';

const ACCENTS: { id: AccentName; cls: string }[] = [
  { id: 'emerald', cls: 'sw-emerald' },
  { id: 'ocean', cls: 'sw-ocean' },
  { id: 'violet', cls: 'sw-violet' },
  { id: 'rose', cls: 'sw-rose' },
  { id: 'amber', cls: 'sw-amber' },
];

export default function Settings() {
  const core = useCore();
  const { profile, dark, accent } = core.state;

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
  const [hint, setHint] = useState<string | null>(null);
  const [showNotif, setShowNotif] = useState(false);

  /* تصدير نسخة احتياطية كملف JSON */
  const handleExport = () => {
    const data = localStorage.getItem('mufkirat_core_v1') ?? '{}';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mufkirat-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setHint('⬇️ تم تصدير نسختك الاحتياطية');
  };

  /* استيراد نسخة احتياطية (مع تحقق) ثم إعادة التحميل */
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        JSON.parse(reader.result as string);
        localStorage.setItem('mufkirat_core_v1', reader.result as string);
        window.location.reload();
      } catch {
        setHint('⚠️ الملف غير صالح');
      }
    };
    reader.readAsText(file);
  };

  /* تثبيت التطبيق على الشاشة الرئيسية */
  const handleInstall = async () => {
    const res = await promptInstall();
    if (res === 'installed') setHint('🎉 تم تثبيت التطبيق!');
    else if (res === 'dismissed') setHint('ألغيت التثبيت');
    else setHint('💡 لتثبيته: افتح قائمة المتصفح ← "إضافة إلى الشاشة الرئيسية"');
  };

  const handleSave = () => {
    if (form.name.trim() === '') {
      setHint('⚠️ أدخل اسمك أولاً');
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
    setHint('🪪 تم حفظ بطاقتك الشخصية!');
  };

  return (
    <div className="page">
      <BackButton />

      <div className="profile-hero">
        <div className="profile-avatar">{profile.name ? profile.name.charAt(0) : '🙂'}</div>
        <div className="profile-greeting">
          {profile.name || 'مرحباً بك'}
          {profile.nickname ? ` · ${profile.nickname}` : ''}
        </div>
        <div className="profile-meta">{profile.job || 'لم تُحدَّد المهنة بعد'}</div>
        <div className="profile-level-badge">
          ⭐ {core.levelName} · {core.state.xp} XP
        </div>
      </div>

      {/* الملف الشخصي */}
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

      {/* المظهر */}
      <div className="section-title">المظهر</div>
      <div className="settings-card">
        <div className="settings-row">
          <div className="settings-icon">{dark ? '🌙' : '☀️'}</div>
          <div className="settings-text">
            <div className="settings-label">الوضع الليلي</div>
            <div className="settings-sub">
              {dark ? 'مفعّل — راحة بصرية ليلية' : 'يحافظ على راحة عينيك ليلاً'}
            </div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={dark} onChange={core.toggleDark} />
            <span className="switch-slider" />
          </label>
        </div>
        <div className="settings-row" style={{ display: 'block' }}>
          <div className="settings-label" style={{ marginBottom: 8 }}>🎨 لون الثيم</div>
          <div className="theme-swatches">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                className={
                  accent === a.id ? `theme-swatch ${a.cls} active` : `theme-swatch ${a.cls}`
                }
                aria-label={a.id}
                onClick={() => core.setAccent(a.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* الإشعارات (مدمجة داخل الإعدادات) */}
      <div className="section-title">الإشعارات والتذكيرات</div>
      <div className="settings-card">
        <button
          className="settings-row"
          style={{ width: '100%', textAlign: 'right' }}
          onClick={() => setShowNotif((v) => !v)}
        >
          <div className="settings-icon">🔔</div>
          <div className="settings-text">
            <div className="settings-label">إشعارات التحفيز اليومية</div>
            <div className="settings-sub">تذكيرات لطيفة لتسجيل يومك</div>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>{showNotif ? '▲' : '▾'}</div>
        </button>
      </div>
      {showNotif && <Notifications embedded />}

      {hint && <div className="hint-msg ok">{hint}</div>}

      {/* بياناتي — نسخ احتياطي */}
      <div className="section-title">بياناتي</div>
      <div className="settings-card">
        <button className="settings-row" style={{ width: '100%', textAlign: 'right' }} onClick={handleExport}>
          <div className="settings-icon">⬇️</div>
          <div className="settings-text">
            <div className="settings-label">نسخة احتياطية (تصدير)</div>
            <div className="settings-sub">احفظ بياناتك كملف على جهازك</div>
          </div>
        </button>
        <label className="settings-row" style={{ width: '100%', textAlign: 'right', cursor: 'pointer' }}>
          <div className="settings-icon">⬆️</div>
          <div className="settings-text">
            <div className="settings-label">استعادة (استيراد)</div>
            <div className="settings-sub">ارجع بياناتك من ملف نسخة احتياطية</div>
          </div>
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
        </label>
      </div>

      {/* الحساب */}
      <div className="section-title">الحساب</div>
      <div className="settings-card">
        <div className="settings-row">
          <div className="settings-icon">📧</div>
          <div className="settings-text">
            <div className="settings-label">{core.state.session.email || 'مسجّل دخول'}</div>
            <div className="settings-sub">حسابك الحالي</div>
          </div>
        </div>
        <button className="settings-row" style={{ width: '100%', textAlign: 'right' }} onClick={core.logout}>
          <div className="settings-icon">🚪</div>
          <div className="settings-text">
            <div className="settings-label" style={{ color: 'var(--danger)' }}>تسجيل الخروج</div>
          </div>
        </button>
      </div>

      {/* التطبيق */}
      <div className="section-title">التطبيق</div>
      <div className="settings-card">
        <button className="settings-row" style={{ width: '100%', textAlign: 'right' }} onClick={handleInstall}>
          <div className="settings-icon">📲</div>
          <div className="settings-text">
            <div className="settings-label">تثبيت التطبيق على جوالك</div>
            <div className="settings-sub">يفتح كأيقونة مستقلة ويعمل بدون إنترنت</div>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>‹</div>
        </button>
        <div className="settings-row">
          <div className="settings-icon">📖</div>
          <div className="settings-text">
            <div className="settings-label">مفكرة النجاح</div>
            <div className="settings-sub">الإصدار 0.1.0 — رفيقك في رحلة التطوير</div>
          </div>
        </div>
      </div>
    </div>
  );
}
