/* ===================================================================
   AboutSection.tsx — التطبيق (تثبيت PWA + معلومات الإصدار)
   جزء من صفحة الإعدادات. التنبيهات عبر setHint.
   =================================================================== */

import { promptInstall } from '../../pwa';

export default function AboutSection({ setHint }: { setHint: (m: string) => void }) {
  const handleInstall = async () => {
    const res = await promptInstall();
    if (res === 'installed') setHint('🎉 ثبّتنا التطبيق!');
    else if (res === 'dismissed') setHint('ألغيت التثبيت');
    else setHint('💡 عشان تثبّته: افتح قائمة المتصفح ← "إضافة إلى الشاشة الرئيسية"');
  };

  return (
    <>
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
    </>
  );
}
