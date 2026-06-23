/* ===================================================================
   useWorkoutTimer — مؤقت راحة تصاعدي يعتمد على timestamp لا setInterval
   يبقى دقيقاً حتى لو غادر المستخدم الصفحة أو خمل المتصفح.
   =================================================================== */

import { useState, useRef, useEffect, useCallback } from 'react';

interface WorkoutTimer {
  seconds: number; // الثواني المنقضية منذ البدء
  running: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useWorkoutTimer(): WorkoutTimer {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const startRef = useRef<number | null>(null); // طابع زمني للبدء
  const rafRef = useRef<number | null>(null);

  /* تحديث الثواني بحساب الفرق من طابع البدء (دقيق رغم الخمول) */
  const tick = useCallback(() => {
    if (startRef.current !== null) {
      setSeconds(Math.floor((Date.now() - startRef.current) / 1000));
      rafRef.current = window.setTimeout(tick, 250);
    }
  }, []);

  const start = useCallback(() => {
    if (startRef.current !== null) return;
    startRef.current = Date.now();
    setRunning(true);
    tick();
  }, [tick]);

  const stop = useCallback(() => {
    if (rafRef.current !== null) window.clearTimeout(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    if (rafRef.current !== null) window.clearTimeout(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    setRunning(false);
    setSeconds(0);
  }, []);

  /* تنظيف المؤقت عند إزالة المكوّن */
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) window.clearTimeout(rafRef.current);
    };
  }, []);

  return { seconds, running, start, stop, reset };
}
