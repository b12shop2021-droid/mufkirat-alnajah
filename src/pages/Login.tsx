/* ===================================================================
   Login.tsx — تسجيل الدخول / إنشاء حساب
   واجهة جاهزة للربط بمصادقة Manus. حالياً تنشئ جلسة محلية عبر useCore.
   ⚠️ عند الرفع على Manus: استبدل nقطة login() بنداء مصادقة Manus الحقيقي
      (التحقق من كلمة المرور وإنشاء المستخدم يتمّان في الخادم، لا هنا).
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../core/useCore';

export default function Login() {
  const core = useCore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  /* تحقق بسيط من صيغة البريد */
  const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = () => {
    if (mode === 'signup' && name.trim() === '') {
      setError('اكتب اسمك أولاً');
      return;
    }
    if (!validEmail(email.trim())) {
      setError('أدخل بريداً إلكترونياً صحيحاً');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور 6 أحرف على الأقل');
      return;
    }
    // ⚠️ Manus: استبدل ما يلي بنداء مصادقة فعلي (signIn / signUp)
    if (mode === 'signup' && name.trim()) {
      core.updateProfile({ name: name.trim() });
    }
    core.login(email.trim());
  };

  return (
    <div className="auth-wrap">
      <div className="auth-logo">
        <img src="/logo.png" alt="الهمّة" className="auth-logo-img" />
        <div className="auth-slogan">الهمّة حتى القمّة</div>
        <div className="auth-sub">
          {mode === 'login' ? 'أهلاً بعودتك — سجّل دخولك للمتابعة' : 'ابدأ رحلتك نحو النجاح'}
        </div>
      </div>

      <div className="card">
        {mode === 'signup' && (
          <div className="auth-field">
            <label>الاسم</label>
            <input
              className="input-field"
              placeholder="اسمك"
              value={name}
              maxLength={200}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <div className="auth-field">
          <label>البريد الإلكتروني</label>
          <input
            className="input-field"
            type="email"
            placeholder="you@example.com"
            value={email}
            maxLength={200}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="auth-field">
          <label>كلمة المرور</label>
          <input
            className="input-field"
            type="password"
            placeholder="••••••"
            value={password}
            maxLength={200}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && <div className="hint-msg warn">{error}</div>}

        <button className="btn-primary" style={{ width: '100%', marginTop: 6 }} onClick={handleSubmit}>
          {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
        </button>

        <div className="auth-switch">
          {mode === 'login' ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
          >
            {mode === 'login' ? 'أنشئ حساباً' : 'سجّل دخولك'}
          </button>
        </div>
      </div>

      <div className="auth-note">
        🔒 تُحفظ بياناتك بأمان في قاعدة بيانات Manus عند الرفع.
      </div>
    </div>
  );
}
