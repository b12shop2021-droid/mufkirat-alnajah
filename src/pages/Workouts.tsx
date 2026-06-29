/* ===================================================================
   Workouts.tsx — التمارين (مجمّعة): المدرب سعود · جدولي المخصص · الإرشادات
   تبويبات داخل صفحة واحدة. كل تبويب يُحمّل كسولاً (lazy) عند فتحه فقط
   — فالحزمة الأولية أخف بكثير ولا تُحمّل التبويبات غير المعروضة.
   =================================================================== */

import { lazy, Suspense, useState } from 'react';
import BackButton from '../components/BackButton';

const CaptainWorkout = lazy(() => import('./CaptainWorkout'));
const CustomWorkout = lazy(() => import('./CustomWorkout'));
const Guidelines = lazy(() => import('./Guidelines'));

type Tab = 'captain' | 'custom' | 'guide';

function TabLoader() {
  return (
    <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '28px 0' }}>
      ⏳ لحظة...
    </div>
  );
}

export default function Workouts() {
  const [tab, setTab] = useState<Tab>('captain');
  return (
    <div className="page">
      <BackButton to="/" />
      <h1 className="section-title">🏋️ قم لـ جيم</h1>
      <div className="intro-card">
        💊 <strong>الجرعة المحفزة:</strong> شد حيلك مع المدرب سعود، الصحة هيبة والنشاط طاقة!
      </div>
      <div className="subtabs">
        <button className={tab === 'captain' ? 'subtab active' : 'subtab'} onClick={() => setTab('captain')}>
          🏋️ المدرب سعود
        </button>
        <button className={tab === 'custom' ? 'subtab active' : 'subtab'} onClick={() => setTab('custom')}>
          🛠️ جدولي
        </button>
        <button className={tab === 'guide' ? 'subtab active' : 'subtab'} onClick={() => setTab('guide')}>
          📋 الإرشادات
        </button>
      </div>
      <Suspense fallback={<TabLoader />}>
        {tab === 'captain' && <CaptainWorkout embedded />}
        {tab === 'custom' && <CustomWorkout embedded />}
        {tab === 'guide' && <Guidelines embedded />}
      </Suspense>
    </div>
  );
}
