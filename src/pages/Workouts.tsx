/* ===================================================================
   Workouts.tsx — التمارين (مجمّعة): المدرب سعود · جدولي المخصص · الإرشادات
   تدمج الصفحات الثلاث في تبويبات داخل صفحة واحدة.
   =================================================================== */

import { useState } from 'react';
import BackButton from '../components/BackButton';
import CaptainWorkout from './CaptainWorkout';
import CustomWorkout from './CustomWorkout';
import Guidelines from './Guidelines';

type Tab = 'captain' | 'custom' | 'guide';

export default function Workouts() {
  const [tab, setTab] = useState<Tab>('captain');
  return (
    <div className="page">
      <BackButton to="/" />
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
      {tab === 'captain' && <CaptainWorkout embedded />}
      {tab === 'custom' && <CustomWorkout embedded />}
      {tab === 'guide' && <Guidelines embedded />}
    </div>
  );
}
