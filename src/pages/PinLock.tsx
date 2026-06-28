/* ===================================================================
   PinLock.tsx — شاشة قفل PIN (4 أرقام)
   يعمل كبوابة بعد تسجيل الدخول — تُفتح مرة واحدة لكل جلسة.
   الـ PIN مخزّن كـ SHA-256 في localStorage، وحالة الفتح في sessionStorage.
   =================================================================== */

import { useState, useCallback } from 'react';
import { hashPin } from '../core/pinUtils';

interface Props {
  onUnlock: () => void;
}

export default function PinLock({ onUnlock }: Props) {
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleKey = useCallback(
    async (key: string) => {
      if (checking) return;
      if (key === 'del') {
        setDigits((d) => d.slice(0, -1));
        setError(false);
        return;
      }
      const next = [...digits, key];
      setDigits(next);
      setError(false);
      if (next.length < 4) return;

      /* تحقق من الـ PIN */
      setChecking(true);
      const stored = localStorage.getItem('mufkirat_pin_hash') ?? '';
      const hash = await hashPin(next.join(''));
      if (hash === stored) {
        sessionStorage.setItem('mufkirat_unlocked', 'true');
        onUnlock();
      } else {
        setError(true);
        setDigits([]);
      }
      setChecking(false);
    },
    [digits, checking, onUnlock],
  );

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="pin-screen">
      <div className="pin-logo">🔒</div>
      <div className="pin-title">اكتب رمز الدخول</div>

      <div className="pin-dots">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`pin-dot ${digits.length > i ? 'filled' : ''} ${error ? 'error' : ''}`} />
        ))}
      </div>

      {error && <div className="pin-error">الرمز غلط — حاول مرة ثانية</div>}

      <div className="pin-keypad">
        {keys.map((k, i) =>
          k === '' ? (
            <div key={i} />
          ) : (
            <button
              key={k + i}
              className={`pin-key ${k === 'del' ? 'pin-del' : ''}`}
              onClick={() => handleKey(k)}
              disabled={checking || (digits.length >= 4 && k !== 'del')}
            >
              {k === 'del' ? '⌫' : k}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
