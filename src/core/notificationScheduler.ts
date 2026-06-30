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
  morning: { title: 'صباح الهيبة يا مبدع! ⚡', body: 'أشرقت الشمس ويومك ناديك — قُم سمّ بالله وابدأ بقوة 🚀' },
  evening: { title: 'يعطيك العافية يا بطل ☕️', body: 'قفّل ملفات اليوم، اشرب مويتك، واذكر ربك ونم وأنت مرتاح 😴' },
  gratitude: { title: 'لحظة شكر 🙏', body: 'سجّل ٣ نعم تشكر الله عليها اليوم — ترفع مزاجك فعلاً ✨' },
  streak: { title: 'سلسلتك في خطر! 🔥', body: 'ما سجّلت نشاط اليوم — أنجز أي مهمة وثبّت سلسلتك قبل ما تنكسر' },
  meal: { title: 'وقت الوجبة 🍽️', body: 'سجّل أكلك وخلك واعي — أكلك الصح طاقتك الصح 🥦' },
  water: { title: 'اشرب مويتك 💧', body: 'جسمك يطلب ترطيب — كاسة ماء الحين تفرق في طاقتك' },
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

/* جدولة تذكيرات الصلوات القادمة اليوم (عبر SW، طالما المتصفح مفتوح).
   coords فارغة = الافتراضي (مكة). adhan يُحمّل ديناميكياً فلا يثقل الحزمة الرئيسية. */
export async function schedulePrayerNotifications(coords: { lat: number; lng: number } | null): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (!navigator.serviceWorker?.controller) return;
  const { getPrayerTimes, DEFAULT_COORDS } = await import('./prayerTimes');
  const now = Date.now();
  for (const p of getPrayerTimes(coords ?? DEFAULT_COORDS)) {
    const delayMs = p.time.getTime() - now;
    if (delayMs <= 0) continue; // مضى وقتها
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      title: `🕌 حان وقت صلاة ${p.name}`,
      body: 'قُم وصلِّ، وخلّ بركة يومك تبدأ من هنا 🤍',
      delayMs,
      tag: `prayer-${p.key}`,
    });
  }
}

/* طلب إذن الإشعارات */
export async function requestNotifPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return Notification.requestPermission();
}
