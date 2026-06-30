/* ===================================================================
   SwipeRow.tsx — غلاف يضيف سحب أفقي لعنصر:
   سحب يمين = onComplete (تبديل إنجاز). سحب يسار = onDelete إن وُجد (وإلا onComplete أيضاً).
   onDelete يُستدعى كطلب فقط (مثلاً يفتح ConfirmDialog) — لا حذف فوري بلا تأكيد.
   =================================================================== */

import { useState, type PointerEvent, type ReactNode } from 'react';

const THRESHOLD = 70;
const MAX_DRAG = 110;

interface SwipeRowProps {
  children: ReactNode;
  onComplete: () => void;
  done: boolean;
  onDelete?: () => void;
}

export default function SwipeRow({ children, onComplete, done, onDelete }: SwipeRowProps) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    setStartX(e.clientX);
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (startX === null) return;
    const delta = e.clientX - startX;
    setDragX(Math.max(-MAX_DRAG, Math.min(MAX_DRAG, delta)));
  };

  const finish = () => {
    if (startX === null) return;
    if (dragX > THRESHOLD) {
      onComplete();
    } else if (dragX < -THRESHOLD) {
      if (onDelete) onDelete();
      else onComplete();
    }
    setStartX(null);
    setDragging(false);
    setDragX(0);
  };

  const isDeleteSide = dragX < 0 && !!onDelete;
  const bgClass = dragX > 0 ? 'swipe-bg right' : dragX < 0 ? `swipe-bg left${isDeleteSide ? ' danger' : ''}` : 'swipe-bg';
  const leftLabel = isDeleteSide ? '🗑️ حذف' : done ? '↩️ رجّعها' : '✓ تمّت';

  return (
    <div className="swipe-row">
      <div className={bgClass} aria-hidden="true">
        <span>{dragX > 0 ? (done ? '↩️ رجّعها' : '✓ تمّت') : leftLabel}</span>
      </div>
      <div
        className="swipe-content"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? 'none' : 'transform 0.25s ease',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        {children}
      </div>
    </div>
  );
}
