/* ===================================================================
   XPBar — شريط النقاط/المستوى الموحّد (المرجع الوحيد)
   يُعرض أعلى كل صفحة؛ يقرأ القيم من useCore المركزي.
   =================================================================== */

import { useCore } from '../core/useCore';

export default function XPBar() {
  const { state, level, levelName, progress } = useCore();
  const isMax = level >= 6;

  return (
    <div className="xpbar">
      <div className="xpbar-head">
        <span className="xpbar-level">⭐ {levelName}</span>
        <span className="xpbar-xp">{state.xp} نقطة</span>
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
