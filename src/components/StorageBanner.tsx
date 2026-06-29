/* ===================================================================
   StorageBanner.tsx — شريط تنبيه يظهر فوق التطبيق إذا امتلأ التخزين
   وفشل حفظ آخر تغيير. يحثّ المستخدم على تصدير نسخة احتياطية فوراً.
   =================================================================== */

import { useCore } from '../core/useCore';

export default function StorageBanner() {
  const { storageFull, exportData, dismissStorageWarning } = useCore();
  if (!storageFull) return null;

  return (
    <div className="storage-banner" role="alert">
      <span className="storage-banner-text">
        ⚠️ المساحة امتلأت — آخر تغيير ما انحفظ! صدّر نسخة احتياطية قبل لا تضيع بياناتك.
      </span>
      <div className="storage-banner-actions">
        <button className="storage-banner-btn primary" onClick={exportData}>
          احفظ نسخة احتياطية
        </button>
        <button className="storage-banner-btn" onClick={dismissStorageWarning} aria-label="إغلاق التنبيه">
          ✕
        </button>
      </div>
    </div>
  );
}
