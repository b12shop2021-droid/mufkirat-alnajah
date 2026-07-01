/* ===================================================================
   RescueTimer.tsx — «فزعة 5 دقايق»: زر عائم يكسر حاجز الكسل.
   يفتح رسالة تحفيزية، وعند الموافقة يبدأ مؤقت 5 دقائق حقيقي (timestamp).
   =================================================================== */

import { useState, useEffect } from 'react';
import { useWorkoutTimer } from '../core/useWorkoutTimer';
import { RESCUE_MESSAGE, RESCUE_DONE_MESSAGE } from '../data/vibes';
import { fireConfetti } from './Confetti';

const RESCUE_SECONDS = 5 * 60;

export default function RescueTimer() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useWorkoutTimer();
  const remaining = Math.max(0, RESCUE_SECONDS - timer.seconds);

  useEffect(() => {
    if (timer.running && remaining === 0) {
      timer.stop();
      timer.reset();
      setDone(true);
      fireConfetti();
    }
  }, [timer.running, remaining, timer]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const startRescue = () => {
    setOpen(false);
    timer.reset();
    timer.start();
  };

  if (timer.running) {
    return (
      <button className="rescue-fab running" onClick={() => { timer.stop(); timer.reset(); }} aria-label="إيقاف فزعة 5 دقايق">
        ⏳ {mm}:{ss}
      </button>
    );
  }

  return (
    <>
      <button className="rescue-fab" aria-label="فزعة 5 دقايق" onClick={() => setOpen(true)}>
        🆘
      </button>

      {open && (
        <div className="popup-overlay" onClick={() => setOpen(false)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-title">🆘 فزعة 5 دقايق</div>
            <div className="popup-body">{RESCUE_MESSAGE}</div>
            <button className="btn-primary welcome-cta" onClick={startRescue}>يلا 5 دقايق 🔥</button>
            <button className="btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setOpen(false)}>
              ليس الآن
            </button>
          </div>
        </div>
      )}

      {done && (
        <div className="popup-overlay" onClick={() => setDone(false)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-title">🎉 خلصت الفزعة!</div>
            <div className="popup-body">{RESCUE_DONE_MESSAGE}</div>
            <button className="btn-primary welcome-cta" onClick={() => setDone(false)}>تمام</button>
          </div>
        </div>
      )}
    </>
  );
}
