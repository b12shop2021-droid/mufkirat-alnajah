/* ===================================================================
   Settings.tsx — الإعدادات والملف الشخصي
   الملف الشخصي + الوضع الليلي + مبدّل الثيمات (5 ألوان) — كلها عبر useCore.
   =================================================================== */

import { useState, useCallback } from 'react';
import { useCore, type AccentName, type Gender } from '../core/useCore';
import BackButton from '../components/BackButton';
import PageHero from '../components/PageHero';
import Notifications from './Notifications';
import { promptInstall } from '../pwa';
import { isPinEnabled, setPin, clearPin, hashPin } from '../core/pinUtils';
import { requestNotifPermission, scheduleNotifications } from '../core/notificationScheduler';

const ACCENTS: { id: AccentName; cls: string }[] = [
  { id: 'emerald', cls: 'sw-emerald' },
  { id: 'ocean', cls: 'sw-ocean' },
  { id: 'violet', cls: 'sw-violet' },
  { id: 'rose', cls: 'sw-rose' },
  { id: 'amber', cls: 'sw-amber' },
];

export default function Settings() {
  const core = useCore();
  const { profile, dark, accent, autoDark, fontScale } = core.state;

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

  /* قفل PIN */
  type PinMode = 'enable' | 'disable' | 'change_old' | 'change_new' | 'change_confirm' | null;
  const [pinEnabled, setPinEnabled] = useState(isPinEnabled);
  const [pinMode, setPinMode] = useState<PinMode>(null);
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [pinError, setPinError] = useState('');
  const [pinNew, setPinNew] = useState(''); // PIN الجديد المؤقت

  const handlePinKey = useCallback(async (key: string) => {
    if (key === 'del') { setPinDigits((d) => d.slice(0, -1)); setPinError(''); return; }
    const next = [...pinDigits, key];
    setPinDigits(next);
    setPinError('');
    if (next.length < 4) return;
    const entered = next.join('');

    if (pinMode === 'enable') {
      /* تفعيل: احفظ مباشرة */
      await setPin(entered);
      setPinEnabled(true);
      setPinMode(null); setPinDigits([]); setPinNew('');
      setHint('🔒 تم تفعيل قفل PIN بنجاح');
    } else if (pinMode === 'disable') {
      /* تعطيل: تحقق من PIN الحالي */
      const hash = await hashPin(entered);
      if (hash !== localStorage.getItem('mufkirat_pin_hash')) {
        setPinError('الرمز غلط'); setPinDigits([]); return;
      }
      clearPin(); setPinEnabled(false);
      setPinMode(null); setPinDigits([]);
      setHint('🔓 تم إلغاء قفل PIN');
    } else if (pinMode === 'change_old') {
      /* تغيير: تحقق من القديم */
      const hash = await hashPin(entered);
      if (hash !== localStorage.getItem('mufkirat_pin_hash')) {
        setPinError('الرمز غلط'); setPinDigits([]); return;
      }
      setPinMode('change_new'); setPinDigits([]);
    } else if (pinMode === 'change_new') {
      /* تغيير: احفظ الجديد مؤقتاً وانتقل للتأكيد */
      setPinNew(entered); setPinMode('change_confirm'); setPinDigits([]);
    } else if (pinMode === 'change_confirm') {
      /* تغيير: تأكيد الجديد */
      if (entered !== pinNew) {
        setPinError('الرمزان غير متطابقين'); setPinDigits([]); return;
      }
      await setPin(entered);
      setPinMode(null); setPinDigits([]); setPinNew('');
      setHint('🔑 تم تغيير رمز PIN بنجاح');
    }
  }, [pinDigits, pinMode, pinNew]);

  const PIN_KEYS = ['1','2','3','4','5','6','7','8','9','','0','del'];
  const pinLabel: Record<NonNullable<PinMode>, string> = {
    enable: 'أدخل رمزاً مكوّناً من 4 أرقام',
    disable: 'أدخل رمزك الحالي للتأكيد',
    change_old: 'أدخل رمزك الحالي',
    change_new: 'أدخل الرمز الجديد',
    change_confirm: 'أعد إدخال الرمز الجديد',
  };

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

  /* استيراد Apple Health XML — يستخرج بيانات النوم */
  const handleAppleHealth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(reader.result as string, 'application/xml');
        const records = Array.from(doc.querySelectorAll('Record[type="HKCategoryTypeIdentifierSleepAnalysis"]'));
        let imported = 0;
        records.forEach((r) => {
          const start = r.getAttribute('startDate')?.slice(0, 10);
          const end = r.getAttribute('endDate');
          if (!start || !end) return;
          const startMs = new Date(r.getAttribute('startDate') ?? '').getTime();
          const endMs = new Date(end).getTime();
          const hours = Math.round(((endMs - startMs) / 3_600_000) * 10) / 10;
          if (hours > 0 && hours < 24) {
            core.logSleep(start, hours);
            imported++;
          }
        });
        setHint(`🍏 تم استيراد ${imported} سجل نوم من Apple Health`);
      } catch {
        setHint('⚠️ الملف غير صالح — تأكد أنه export.xml من Apple Health');
      }
    };
    reader.readAsText(file);
  };

  /* استيراد Google Fit JSON — ملف sleep من Google Takeout */
  const handleGoogleFit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        /* Google Fit Takeout: { bucket: [{ dataset: [{ point: [{ startTimeNanos, endTimeNanos }] }] }] } */
        let imported = 0;
        const sessions: { date: string; nanos: number }[] = [];
        const buckets = Array.isArray(data) ? data : data?.bucket ?? [];
        buckets.forEach((b: Record<string, unknown>) => {
          const datasets = (b?.dataset as unknown[]) ?? [];
          datasets.forEach((ds: unknown) => {
            const points = ((ds as Record<string, unknown>)?.point as unknown[]) ?? [];
            points.forEach((p: unknown) => {
              const pt = p as Record<string, string>;
              const start = pt?.startTimeNanos ?? pt?.startTimeMillis;
              const end = pt?.endTimeNanos ?? pt?.endTimeMillis;
              if (!start || !end) return;
              const factor = String(start).length > 13 ? 1e6 : 1;
              const ms = (Number(end) - Number(start)) / factor;
              const date = new Date(Number(start) / factor).toISOString().slice(0, 10);
              sessions.push({ date, nanos: ms });
            });
          });
        });
        /* اجمع بالتاريخ */
        const byDate: Record<string, number> = {};
        sessions.forEach(({ date, nanos }) => {
          byDate[date] = (byDate[date] ?? 0) + nanos;
        });
        Object.entries(byDate).forEach(([date, ms]) => {
          const hours = Math.round((ms / 3_600_000) * 10) / 10;
          if (hours > 0 && hours < 24) { core.logSleep(date, hours); imported++; }
        });
        setHint(imported > 0 ? `🏃 تم استيراد ${imported} سجل نوم من Google Fit` : '⚠️ ما فيه بيانات نوم في هذا الملف');
      } catch {
        setHint('⚠️ الملف غير صالح — تأكد أنه ملف JSON من Google Takeout');
      }
    };
    reader.readAsText(file);
  };

  /* تفعيل الإشعارات الفعلية */
  const handleEnableNotif = async () => {
    const perm = await requestNotifPermission();
    if (perm === 'granted') {
      await scheduleNotifications({ masterEnabled: true, items: core.state.notifItems });
      setHint('🔔 تم تفعيل الإشعارات! ستصلك اليوم في أوقاتها');
    } else {
      setHint('⚠️ لم تُمنح الإذن — افتح إعدادات المتصفح وفعّل الإشعارات لهذا الموقع');
    }
  };

  /* تثبيت التطبيق على الشاشة الرئيسية */
  const handleInstall = async () => {
    const res = await promptInstall();
    if (res === 'installed') setHint('🎉 تم تثبيت التطبيق!');
    else if (res === 'dismissed') setHint('ألغيت التثبيت');
    else setHint('💡 عشان تثبّته: افتح قائمة المتصفح ← "إضافة إلى الشاشة الرئيسية"');
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
              {autoDark ? 'يتحكم به الوضع التلقائي' : 'يريّح عينك بالليل'}
            </div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={dark} disabled={autoDark} onChange={core.toggleDark} />
            <span className="switch-slider" />
          </label>
        </div>
        <div className="settings-row">
          <div className="settings-icon">🌗</div>
          <div className="settings-text">
            <div className="settings-label">وضع ليلي تلقائي</div>
            <div className="settings-sub">يشتغل تلقائياً من المغرب للفجر</div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={autoDark} onChange={core.toggleAutoDark} />
            <span className="switch-slider" />
          </label>
        </div>
        <div className="settings-row" style={{ display: 'block' }}>
          <div className="settings-label" style={{ marginBottom: 8 }}>🔠 حجم الخط</div>
          <div className="add-row" style={{ marginTop: 0 }}>
            <button
              className={fontScale === 'normal' ? 'btn-primary' : 'btn-ghost'}
              style={{ flex: 1 }}
              onClick={() => core.setFontScale('normal')}
            >
              عادي
            </button>
            <button
              className={fontScale === 'large' ? 'btn-primary' : 'btn-ghost'}
              style={{ flex: 1 }}
              onClick={() => core.setFontScale('large')}
            >
              كبير
            </button>
          </div>
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

      {/* زر تفعيل الإشعارات الفعلية */}
      {'Notification' in window && Notification.permission !== 'granted' && (
        <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleEnableNotif}>
          🔔 فعّل الإشعارات الفعلية الآن
        </button>
      )}
      {Notification.permission === 'granted' && (
        <div className="hint-msg ok" style={{ marginTop: 4 }}>✅ الإشعارات مفعّلة — ستصلك في أوقاتها</div>
      )}

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

        {/* استيراد بيانات الصحة */}
        <label className="settings-row" style={{ width: '100%', textAlign: 'right', cursor: 'pointer' }}>
          <div className="settings-icon">🍏</div>
          <div className="settings-text">
            <div className="settings-label">استيراد Apple Health</div>
            <div className="settings-sub">صدّر من تطبيق Health ← export.xml ثم ارفعه هنا</div>
          </div>
          <input type="file" accept=".xml" style={{ display: 'none' }} onChange={handleAppleHealth} />
        </label>
        <label className="settings-row" style={{ width: '100%', textAlign: 'right', cursor: 'pointer' }}>
          <div className="settings-icon">🏃</div>
          <div className="settings-text">
            <div className="settings-label">استيراد Google Fit</div>
            <div className="settings-sub">حمّل بيانات النوم JSON من Google Takeout</div>
          </div>
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleGoogleFit} />
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

      {/* قفل PIN */}
      <div className="section-title">الخصوصية</div>
      <div className="settings-card">
        {!pinEnabled ? (
          <button className="settings-row" style={{ width: '100%', textAlign: 'right' }} onClick={() => { setPinMode('enable'); setPinDigits([]); setPinError(''); }}>
            <div className="settings-icon">🔒</div>
            <div className="settings-text">
              <div className="settings-label">تفعيل قفل PIN</div>
              <div className="settings-sub">رمز مكوّن من 4 أرقام يُطلب عند كل فتح</div>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>‹</div>
          </button>
        ) : (
          <>
            <button className="settings-row" style={{ width: '100%', textAlign: 'right' }} onClick={() => { setPinMode('change_old'); setPinDigits([]); setPinError(''); }}>
              <div className="settings-icon">🔑</div>
              <div className="settings-text">
                <div className="settings-label">تغيير رمز PIN</div>
                <div className="settings-sub">اضبط رمزاً جديداً</div>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>‹</div>
            </button>
            <button className="settings-row" style={{ width: '100%', textAlign: 'right' }} onClick={() => { setPinMode('disable'); setPinDigits([]); setPinError(''); }}>
              <div className="settings-icon">🔓</div>
              <div className="settings-text">
                <div className="settings-label" style={{ color: 'var(--danger)' }}>إلغاء قفل PIN</div>
              </div>
            </button>
          </>
        )}
      </div>

      {/* لوحة إدخال PIN المضمّنة */}
      {pinMode && (
        <div className="card pin-inline-panel">
          <div className="pin-inline-title">{pinLabel[pinMode]}</div>
          <div className="pin-dots">
            {[0,1,2,3].map((i) => (
              <div key={i} className={`pin-dot ${pinDigits.length > i ? 'filled' : ''} ${pinError ? 'error' : ''}`} />
            ))}
          </div>
          {pinError && <div className="pin-error">{pinError}</div>}
          <div className="pin-keypad">
            {PIN_KEYS.map((k, i) =>
              k === '' ? <div key={i} /> : (
                <button key={k+i} className={`pin-key ${k === 'del' ? 'pin-del' : ''}`} onClick={() => handlePinKey(k)} disabled={pinDigits.length >= 4 && k !== 'del'}>
                  {k === 'del' ? '⌫' : k}
                </button>
              )
            )}
          </div>
          <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => { setPinMode(null); setPinDigits([]); setPinError(''); setPinNew(''); }}>إلغاء</button>
        </div>
      )}

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
            <div className="settings-label">الهمّة</div>
            <div className="settings-sub">الإصدار 0.1.0 — رفيقك في رحلة التطوير</div>
          </div>
        </div>
      </div>
    </div>
  );
}
