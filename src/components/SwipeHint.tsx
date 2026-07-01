/* ===================================================================
   SwipeHint.tsx — تلميح يظهر مرة واحدة فقط (لكل مستخدم) يشرح ميزة
   السحب على عناصر SwipeRow. يُغلق بالضغط ولا يظهر بعدها أبداً.
   =================================================================== */

import { useState } from 'react';
import { SWIPE_HINT } from '../data/vibes';

const SEEN_KEY = 'alhimmah_swipe_hint_seen';

export default function SwipeHint() {
  const [seen, setSeen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SEEN_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (seen) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch { /* تجاهل */ }
    setSeen(true);
  };

  return (
    <div className="swipe-hint" onClick={dismiss}>
      <span>{SWIPE_HINT}</span>
      <button className="swipe-hint-close" aria-label="إغلاق التلميح" onClick={dismiss}>
        ✕
      </button>
    </div>
  );
}
