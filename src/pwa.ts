/* ===================================================================
   pwa.ts — تسجيل Service Worker + التقاط حدث التثبيت (Add to Home Screen)
   =================================================================== */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;

/* تهيئة PWA: تسجيل الـSW والتقاط فرصة التثبيت */
export function initPwa(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
  });
  if ('serviceWorker' in navigator) {
    if (import.meta.env.PROD) {
      // الإنتاج فقط: سجّل الـSW
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    } else {
      // التطوير: ألغِ أي SW قديم وامسح الكاش حتى لا يخدم وحدات Vite قديمة (شاشة بيضاء)
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      }).catch(() => {});
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
      }
    }
  }
}

/* عرض نافذة التثبيت إن كانت متاحة */
export async function promptInstall(): Promise<'installed' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable';
  deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  return outcome === 'accepted' ? 'installed' : 'dismissed';
}
