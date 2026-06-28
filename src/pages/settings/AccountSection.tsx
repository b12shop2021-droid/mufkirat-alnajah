/* ===================================================================
   AccountSection.tsx — الحساب (البريد + تسجيل الخروج)
   جزء من صفحة الإعدادات. الحالة عبر useCore.
   =================================================================== */

import { useCore } from '../../core/useCore';

export default function AccountSection() {
  const core = useCore();

  return (
    <>
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
    </>
  );
}
