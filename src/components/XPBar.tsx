/* ===================================================================
   XPBar — شريط النقاط/المستوى الموحّد (المرجع الوحيد)
   يُعرض أعلى كل صفحة؛ يقرأ القيم من useCore المركزي.
   =================================================================== */

import { useEffect, useRef, useState } from 'react';
import { useCore } from '../core/useCore';

/* عدّاد يتحرّك بسلاسة من القيمة السابقة للجديدة بدل القفز المفاجئ */
const useAnimatedNumber = (target: number, duration = 500): number => {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    /* ضمانة: لو rAF تجمّد (تبويب بالخلفية لفترة طويلة)، نضمن وصول الرقم الصحيح بعد المدة + هامش */
    const safety = setTimeout(() => {
      fromRef.current = target;
      setValue(target);
    }, duration + 400);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      clearTimeout(safety);
    };
  }, [target, duration]);

  return value;
};

export default function XPBar() {
  const { state, level, levelName, progress } = useCore();
  const isMax = level >= 6;
  const animatedXp = useAnimatedNumber(state.xp);

  return (
    <div className="xpbar">
      <div className="xpbar-head">
        <span className="xpbar-level">⭐ {levelName}</span>
        <span className="xpbar-xp">{animatedXp} نقطة</span>
      </div>
      <div className="xpbar-track">
        <div
          className="xpbar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      {!isMax && (
        <div className="xpbar-xp" style={{ marginTop: 6 }}>
          {100 - progress} نقطة للمستوى التالي
        </div>
      )}
    </div>
  );
}
