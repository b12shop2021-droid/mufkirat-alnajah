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
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
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
