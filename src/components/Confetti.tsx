/* ===================================================================
   Confetti — احتفال بصري خفيف عند إكمال أي قسم 100%
   استدعِ fireConfetti() من أي مكان؛ المكوّن يستمع للحدث ويعرض القصاصات.
   =================================================================== */

import { useEffect, useState } from 'react';

const EVENT_NAME = 'mufkirat:confetti';

/* إطلاق الاحتفال من أي صفحة (مع اهتزاز خفيف إن دعمه الجهاز) */
export function fireConfetti(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate?.(30);
  }
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

interface Piece {
  id: string;
  left: number;
  delay: number;
  duration: number;
  color: string;
}

/* ألوان القصاصات تُقرأ من متغيرات الهوية (لا لون ثابت) */
const ACCENT_VARS = ['--primary', '--primary-light', '--celebrate', '--deep'];

function buildPieces(): Piece[] {
  return Array.from({ length: 36 }, () => ({
    id: crypto.randomUUID(),
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 1.6 + Math.random() * 1.2,
    color: `var(${ACCENT_VARS[Math.floor(Math.random() * ACCENT_VARS.length)]})`,
  }));
}

export default function Confetti() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const handler = () => {
      setPieces(buildPieces());
      window.setTimeout(() => setPieces([]), 3000);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
