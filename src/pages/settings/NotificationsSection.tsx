/* ===================================================================
   NotificationsSection.tsx — الإشعارات (مبدّل + لوحة مضمّنة + تفعيل فعلي)
   جزء من صفحة الإعدادات. الحالة عبر useCore، والتنبيهات عبر setHint.
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../../core/useCore';
import Notifications from '../Notifications';
import { requestNotifPermission, scheduleNotifications } from '../../core/notificationScheduler';

export default function NotificationsSection({ setHint }: { setHint: (m: string) => void }) {
  const core = useCore();
  const [showNotif, setShowNotif] = useState(false);

  const handleEnableNotif = async () => {
    const perm = await requestNotifPermission();
    if (perm === 'granted') {
      await scheduleNotifications({ masterEnabled: true, items: core.state.notifItems });
      setHint('🔔 فعّلنا الإشعارات! بتوصلك اليوم بأوقاتها');
    } else {
      setHint('⚠️ ما تم الإذن — افتح إعدادات المتصفح وفعّل الإشعارات للموقع');
    }
  };

  const supported = 'Notification' in window;

  return (
    <>
      <div className="section-title">الإشعارات والتذكيرات</div>
      <div className="settings-card">
        <button
          className="settings-row"
          style={{ width: '100%', textAlign: 'right' }}
          onClick={() => setShowNotif((v) => !v)}
        >
          <div className="settings-icon">🔔</div>
          <div className="settings-text">
            <div className="settings-label">تبغانا نزنّ فوق رأسك بالمهام؟</div>
            <div className="settings-sub">تذكيرات لطيفة لتسجيل يومك</div>
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>{showNotif ? '▲' : '▾'}</div>
        </button>
      </div>
      {showNotif && <Notifications embedded />}

      {supported && Notification.permission !== 'granted' && (
        <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleEnableNotif}>
          🔔 فعّل الإشعارات الفعلية الآن
        </button>
      )}
      {supported && Notification.permission === 'granted' && (
        <div className="hint-msg ok" style={{ marginTop: 4 }}>✅ الإشعارات مفعّلة — ستصلك في أوقاتها</div>
      )}
    </>
  );
}
