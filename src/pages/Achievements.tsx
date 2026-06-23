/* ===================================================================
   Achievements.tsx — إنجازاتي (مجمّعة): السلسلة + رحلتي ومعرض الإنجازات
   تدمج صفحتي السلسلة والمعرض/المحطات/قصة الشهر في تبويبات.
   =================================================================== */

import { useState } from 'react';
import BackButton from '../components/BackButton';
import XPBar from '../components/XPBar';
import Streak from './Streak';
import JourneyGallery from './JourneyGallery';

type Tab = 'streak' | 'journey';

export default function Achievements() {
  const [tab, setTab] = useState<Tab>('streak');
  return (
    <div className="page">
      <BackButton to="/" />
      <XPBar />
      <div className="subtabs">
        <button className={tab === 'streak' ? 'subtab active' : 'subtab'} onClick={() => setTab('streak')}>
          🔥 السلسلة والألقاب
        </button>
        <button className={tab === 'journey' ? 'subtab active' : 'subtab'} onClick={() => setTab('journey')}>
          🖼️ المعرض والمحطات
        </button>
      </div>
      {tab === 'streak' && <Streak embedded />}
      {tab === 'journey' && <JourneyGallery embedded />}
    </div>
  );
}
