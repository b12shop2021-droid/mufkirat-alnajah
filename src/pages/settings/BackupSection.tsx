/* ===================================================================
   BackupSection.tsx — بياناتي (تصدير/استيراد + Apple Health + Google Fit)
   جزء من صفحة الإعدادات. الحالة عبر useCore، والتنبيهات عبر setHint.
   =================================================================== */

import { useCore } from '../../core/useCore';

export default function BackupSection({ setHint }: { setHint: (m: string) => void }) {
  const core = useCore();

  /* تصدير نسخة احتياطية كملف JSON */
  const handleExport = () => {
    const data = localStorage.getItem('mufkirat_core_v1') ?? '{}';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mufkirat-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setHint('⬇️ صدّرنا نسختك الاحتياطية');
  };

  /* استيراد نسخة احتياطية (مع تحقق) ثم إعادة التحميل */
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        JSON.parse(reader.result as string);
        localStorage.setItem('mufkirat_core_v1', reader.result as string);
        window.location.reload();
      } catch {
        setHint('⚠️ الملف مو صالح');
      }
    };
    reader.readAsText(file);
  };

  /* استيراد Apple Health XML — يستخرج بيانات النوم */
  const handleAppleHealth = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(reader.result as string, 'application/xml');
        const records = Array.from(doc.querySelectorAll('Record[type="HKCategoryTypeIdentifierSleepAnalysis"]'));
        let imported = 0;
        records.forEach((r) => {
          const start = r.getAttribute('startDate')?.slice(0, 10);
          const end = r.getAttribute('endDate');
          if (!start || !end) return;
          const startMs = new Date(r.getAttribute('startDate') ?? '').getTime();
          const endMs = new Date(end).getTime();
          const hours = Math.round(((endMs - startMs) / 3_600_000) * 10) / 10;
          if (hours > 0 && hours < 24) {
            core.logSleep(start, hours);
            imported++;
          }
        });
        setHint(`🍏 تم استيراد ${imported} سجل نوم من Apple Health`);
      } catch {
        setHint('⚠️ الملف مو صالح — تأكد إنه export.xml من Apple Health');
      }
    };
    reader.readAsText(file);
  };

  /* استيراد Google Fit JSON — ملف sleep من Google Takeout */
  const handleGoogleFit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        /* Google Fit Takeout: { bucket: [{ dataset: [{ point: [{ startTimeNanos, endTimeNanos }] }] }] } */
        let imported = 0;
        const sessions: { date: string; nanos: number }[] = [];
        const buckets = Array.isArray(data) ? data : data?.bucket ?? [];
        buckets.forEach((b: Record<string, unknown>) => {
          const datasets = (b?.dataset as unknown[]) ?? [];
          datasets.forEach((ds: unknown) => {
            const points = ((ds as Record<string, unknown>)?.point as unknown[]) ?? [];
            points.forEach((p: unknown) => {
              const pt = p as Record<string, string>;
              const start = pt?.startTimeNanos ?? pt?.startTimeMillis;
              const end = pt?.endTimeNanos ?? pt?.endTimeMillis;
              if (!start || !end) return;
              const factor = String(start).length > 13 ? 1e6 : 1;
              const ms = (Number(end) - Number(start)) / factor;
              const date = new Date(Number(start) / factor).toISOString().slice(0, 10);
              sessions.push({ date, nanos: ms });
            });
          });
        });
        /* اجمع بالتاريخ */
        const byDate: Record<string, number> = {};
        sessions.forEach(({ date, nanos }) => {
          byDate[date] = (byDate[date] ?? 0) + nanos;
        });
        Object.entries(byDate).forEach(([date, ms]) => {
          const hours = Math.round((ms / 3_600_000) * 10) / 10;
          if (hours > 0 && hours < 24) { core.logSleep(date, hours); imported++; }
        });
        setHint(imported > 0 ? `🏃 تم استيراد ${imported} سجل نوم من Google Fit` : '⚠️ ما فيه بيانات نوم في هذا الملف');
      } catch {
        setHint('⚠️ الملف مو صالح — تأكد إنه ملف JSON من Google Takeout');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="section-title">بياناتي</div>
      <div className="settings-card">
        <button className="settings-row" style={{ width: '100%', textAlign: 'right' }} onClick={handleExport}>
          <div className="settings-icon">⬇️</div>
          <div className="settings-text">
            <div className="settings-label">نسخة احتياطية (تصدير)</div>
            <div className="settings-sub">احفظ بياناتك كملف على جهازك</div>
          </div>
        </button>
        <label className="settings-row" style={{ width: '100%', textAlign: 'right', cursor: 'pointer' }}>
          <div className="settings-icon">⬆️</div>
          <div className="settings-text">
            <div className="settings-label">استعادة (استيراد)</div>
            <div className="settings-sub">ارجع بياناتك من ملف نسخة احتياطية</div>
          </div>
          <input type="file" accept="application/json" style={{ display: 'none' }} onChange={handleImport} />
        </label>

        {/* استيراد بيانات الصحة */}
        <label className="settings-row" style={{ width: '100%', textAlign: 'right', cursor: 'pointer' }}>
          <div className="settings-icon">🍏</div>
          <div className="settings-text">
            <div className="settings-label">استيراد Apple Health</div>
            <div className="settings-sub">صدّر من تطبيق Health ← export.xml ثم ارفعه هنا</div>
          </div>
          <input type="file" accept=".xml" style={{ display: 'none' }} onChange={handleAppleHealth} />
        </label>
        <label className="settings-row" style={{ width: '100%', textAlign: 'right', cursor: 'pointer' }}>
          <div className="settings-icon">🏃</div>
          <div className="settings-text">
            <div className="settings-label">استيراد Google Fit</div>
            <div className="settings-sub">حمّل بيانات النوم JSON من Google Takeout</div>
          </div>
          <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleGoogleFit} />
        </label>
      </div>
    </>
  );
}
