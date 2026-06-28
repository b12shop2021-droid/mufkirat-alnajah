/* ===================================================================
   notificationScheduler.ts — جدولة الإشعارات المحلية عبر Service Worker
   يُستدعى مرة واحدة عند فتح التطبيق لجدولة إشعارات اليوم.
   يعمل طالما المتصفح مفتوح (بدون push server).
   =================================================================== */

interface NotifItem {
  id: string;
  enabled: boolean;
  time: string; // 'HH:MM'
}

interface ScheduleOptions {
  masterEnabled: boolean;
  items: NotifItem[];
}

/* حساب مللي ثانية حتى وقت معين اليوم */
function msUntil(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
  const diff = target.getTime() - now.getTime();
  return diff > 0 ? diff : -1; // سالب = مضى وقته اليوم
}

const NOTIF_LABELS: Record<string, { title: string; body: string }> = {
  morning: { title: '☀️ صباح الخير!', body: 'وقت روتين الصباح — ابدأ يومك بقوة 💪' },
  evening: { title: '🌙 مساء النور', body: 'لا تنسى روتينك المسائي قبل النوم' },
  gratitude: { title: '🙏 لحظة شكر', body: 'سجّل ٣ أشياء تشكر الله عليها اليوم' },
  streak: { title: '🔥 سلسلتك في خطر!', body: 'ما سجّلت نشاطاً اليوم — خلّ السلسلة ما تنكسر' },
  meal: { title: '🍽️ وقت الوجبة', body: 'لا تنسى تسجّل وجبتك الرئيسية' },
  water: { title: '💧 اشرب ماء', body: 'جسمك يحتاج ترطيب — اشرب كوب ماء الآن' },
};

export async function scheduleNotifications(opts: ScheduleOptions): Promise<void> {
  if (!opts.masterEnabled) return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (!navigator.serviceWorker?.controller) return;

  for (const item of opts.items) {
    if (!item.enabled) continue;
    if (item.time === 'تلقائي' || item.time === 'كل 3 ساعات') continue;

    const delayMs = msUntil(item.time);
    if (delayMs < 0) continue; // مضى وقته

    const meta = NOTIF_LABELS[item.id];
    if (!meta) continue;

    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      title: meta.title,
      body: meta.body,
      delayMs,
      tag: `notif-${item.id}`,
    });
  }
}

/* طلب إذن الإشعارات */
export async function requestNotifPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}
