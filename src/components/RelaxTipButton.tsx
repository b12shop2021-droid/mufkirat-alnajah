/* ===================================================================
   RelaxTipButton.tsx — «جرعة روقان»: زر صغير مخفي يعرض نصيحة غريبة
   ومضحكة عشوائية عند الضغط. بدون أي حالة دائمة.
   =================================================================== */

import { useState } from 'react';
import { RELAX_TIPS, pickLine } from '../data/vibes';

export default function RelaxTipButton() {
  const [tip, setTip] = useState<string | null>(null);

  return (
    <>
      <button className="relax-tip-btn" onClick={() => setTip(pickLine(RELAX_TIPS))}>
        🧘 جرعة روقان
      </button>

      {tip && (
        <div className="popup-overlay" onClick={() => setTip(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-title">🧘 جرعة روقان</div>
            <div className="popup-body">{tip}</div>
            <button className="btn-primary welcome-cta" onClick={() => setTip(null)}>تمام</button>
          </div>
        </div>
      )}
    </>
  );
}
