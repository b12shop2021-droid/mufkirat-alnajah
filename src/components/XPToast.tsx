/* ===================================================================
   XPToast — رسالة تحفيز منبثقة عند أي كسب نقاط (XP) في أي صفحة.
   استدعِ fireXP(amount, levelName?) من النواة؛ المكوّن يستمع ويعرض.
   لهجة سعودية شبابية · صفر لون ثابت · يحترم تقليل الحركة.
   =================================================================== */

import { useEffect, useState } from 'react';

const EVENT_NAME = 'mufkirat:xp';

/* عبارات تشجيع قصيرة (تتناوب عشوائياً) */
const CHEERS = ['كفو! 🔥', 'يا بطل 💪', 'ماشاءالله 🌟', 'استمر 🚀', 'خطوة للقمة ⛰️', 'زادت همّتك ✨', 'تمام التمام 👏'];

interface XPDetail {
  amount: number;
  levelName?: string;
}

/* إطلاق رسالة النقاط من أي مكان (مع اهتزاز خفيف إن دعمه الجهاز) */
export function fireXP(amount: number, levelName?: string): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate?.(15);
  }
  window.dispatchEvent(new CustomEvent<XPDetail>(EVENT_NAME, { detail: { amount, levelName } }));
}

interface Toast {
  id: string;
  amount: number;
  cheer: string;
  levelName?: string;
}

export default function XPToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<XPDetail>).detail;
      if (!detail || detail.amount <= 0) return;
      setToast({
        id: crypto.randomUUID(),
        amount: detail.amount,
        cheer: CHEERS[Math.floor(Math.random() * CHEERS.length)],
        levelName: detail.levelName,
      });
      window.setTimeout(() => setToast(null), detail.levelName ? 3200 : 2000);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  if (!toast) return null;

  return (
    <div className="xp-toast-layer" aria-live="polite">
      <div key={toast.id} className={toast.levelName ? 'xp-toast levelup' : 'xp-toast'}>
        {toast.levelName ? (
          <>
            <span className="xp-toast-icon">🎉</span>
            <div className="xp-toast-body">
              <div className="xp-toast-main">ترقّيت لمستوى «{toast.levelName}»</div>
              <div className="xp-toast-sub">+{toast.amount} نقطة · {toast.cheer}</div>
            </div>
          </>
        ) : (
          <>
            <span className="xp-toast-amount">+{toast.amount}</span>
            <span className="xp-toast-cheer">{toast.cheer}</span>
          </>
        )}
      </div>
    </div>
  );
}
