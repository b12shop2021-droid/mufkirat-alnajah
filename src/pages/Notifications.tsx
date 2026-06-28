/* ===================================================================
   Notifications.tsx — واجهة تحكم الإشعارات (لا Push حقيقي)
   التذكيرات الفعلية تتطلب Backend — هذه واجهة التفضيلات فقط.
   كل الحالة عبر useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../core/useCore';
import BackButton from '../components/BackButton';
import { requestNotifPermission, scheduleNotifications } from '../core/notificationScheduler';

/* بيانات عرض كل نوع تذكير (ثابتة) */
const META: Record<string, { icon: string; label: string; sub: string; auto?: boolean }> = {
  morning: { icon: '🌅', label: 'تذكير الروتين الصباحي', sub: 'لو لم تبدأ روتينك بعد' },
  evening: { icon: '🌙', label: 'تذكير الروتين المسائي', sub: 'قبل النوم بساعة تقريباً' },
  meal: { icon: '🍽️', label: 'تذكير الوجبة المنسية', sub: 'لو تجاوز وقت وجبة معتاد', auto: true },
  water: { icon: '💧', label: 'تذكير الترطيب', sub: 'كل 3 ساعات خلال النهار', auto: true },
  gratitude: { icon: '🙏', label: 'تذكير شكر اليوم', sub: 'لو ما سجّلت لحظة شكر بعد' },
  streak: { icon: '🔥', label: 'تنبيه السلسلة المعرّضة للخطر', sub: 'قبل منتصف الليل لو يومك ناقص' },
};

export default function Notifications({ embedded = false }: { embedded?: boolean }) {
  const core = useCore();
  const { notifMaster, notifItems, profile } = core.state;

  const greeting = profile.nickname || profile.name || 'بطل';
  const verb = profile.gender === 'female' ? 'تسجّلي' : 'تسجّل';

  /* حالة إذن المتصفح للإشعارات (نظهر زر التفعيل فقط لو ما أُعطي بعد) */
  const supported = typeof Notification !== 'undefined';
  const [perm, setPerm] = useState<NotificationPermission>(supported ? Notification.permission : 'denied');

  const handleEnable = async () => {
    const p = await requestNotifPermission();
    setPerm(p);
    if (p === 'granted') {
      core.setNotifMaster(true);
      await scheduleNotifications({ masterEnabled: true, items: core.state.notifItems });
    }
  };

  return (
    <div className={embedded ? '' : 'page'}>
      {!embedded && <BackButton />}

      <h1 className="section-title">🔔 الإشعارات والتذكيرات</h1>

      <div className="settings-card">
        <div className="settings-row">
          <div className="settings-icon">🔔</div>
          <div className="settings-text">
            <div className="settings-label">تفعيل الإشعارات</div>
            <div className="settings-sub">تذكيرات لطيفة ألا تترك يومك بدون تسجيل</div>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={notifMaster}
              onChange={(e) => core.setNotifMaster(e.target.checked)}
            />
            <span className="switch-slider" />
          </label>
        </div>
      </div>

      {supported && perm !== 'granted' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>
            {perm === 'denied' ? '🔕 الإشعارات محظورة' : '🔔 فعّل الإشعارات الفعلية'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {perm === 'denied'
              ? 'حظرت الإشعارات لهذا الموقع — افتح إعدادات المتصفح واسمح بها عشان توصلك التذكيرات.'
              : 'عشان توصلك التذكيرات فعلاً، لازم تأذن للمتصفح أول مرة.'}
          </div>
          {perm !== 'denied' && (
            <button className="weekly-btn" onClick={handleEnable} style={{ marginTop: 4 }}>
              تفعيل التذكيرات 🔔
            </button>
          )}
        </div>
      )}

      <div className="section-title">أنواع التذكيرات</div>
      <div className="settings-card">
        {notifItems.map((n) => {
          const m = META[n.id];
          if (!m) return null;
          return (
            <div className="reminder-row" key={n.id}>
              <div className="reminder-icon">{m.icon}</div>
              <div className="reminder-text">
                <div className="reminder-label">{m.label}</div>
                <div className="reminder-sub">{m.sub}</div>
              </div>
              {m.auto ? (
                <span className="reminder-time">{n.time}</span>
              ) : (
                <input
                  type="time"
                  className="reminder-time"
                  value={n.time}
                  disabled={!notifMaster}
                  onChange={(e) => core.setNotifTime(n.id, e.target.value)}
                />
              )}
              <label className="switch" style={{ width: 44, height: 26 }}>
                <input
                  type="checkbox"
                  checked={n.enabled && notifMaster}
                  disabled={!notifMaster}
                  onChange={() => core.toggleNotif(n.id)}
                />
                <span className="switch-slider" />
              </label>
            </div>
          );
        })}
      </div>

      <div className="preview-card">
        <div style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--deep)', marginBottom: 10 }}>
          👀 معاينة كيف سيبدو الإشعار
        </div>
        <div className="card" style={{ margin: 0, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div className="settings-icon" style={{ background: 'var(--primary)', color: '#fff' }}>
            🚀
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>الهمّة</div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.5 }}>
              لم {verb} يومك بعد يا {greeting}! خطوة صغيرة الآن تصنع فرقاً كبيراً 💪
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
