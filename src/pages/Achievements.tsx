/* ===================================================================
   Achievements.tsx — إنجازاتي (مجمّعة): السلسلة + رحلتي ومعرض الإنجازات
   تبويبات. كل تبويب يُحمّل كسولاً (lazy) عند فتحه فقط — حزمة أولية أخف.
   =================================================================== */

import { lazy, Suspense, useState } from 'react';
import BackButton from '../components/BackButton';
import XPBar from '../components/XPBar';
import Dose from '../components/Dose';
import { pickLoadingPhrase } from '../data/vibes';

const Streak = lazy(() => import('./Streak'));
const JourneyGallery = lazy(() => import('./JourneyGallery'));
const WeeklyWrapped = lazy(() => import('./WeeklyWrapped'));
const Badges = lazy(() => import('./Badges'));

type Tab = 'streak' | 'badges' | 'journey' | 'wrapped';

function TabLoader() {
  return (
    <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '28px 0' }}>
      {pickLoadingPhrase()}
    </div>
  );
}

export default function Achievements() {
  const [tab, setTab] = useState<Tab>('streak');
  return (
    <div className="page">
      <BackButton to="/" />
      <XPBar />
      <h1 className="section-title">🏆 منصة التتويج</h1>
      <Dose section="achievements" />
      <div className="subtabs">
        <button className={tab === 'streak' ? 'subtab active' : 'subtab'} onClick={() => setTab('streak')}>
          🔥 السلسلة والألقاب
        </button>
        <button className={tab === 'badges' ? 'subtab active' : 'subtab'} onClick={() => setTab('badges')}>
          🎖️ الأوسمة
        </button>
        <button className={tab === 'journey' ? 'subtab active' : 'subtab'} onClick={() => setTab('journey')}>
          🖼️ المعرض والمحطات
        </button>
        <button className={tab === 'wrapped' ? 'subtab active' : 'subtab'} onClick={() => setTab('wrapped')}>
          ✨ قصة الأسبوع
        </button>
      </div>
      <Suspense fallback={<TabLoader />}>
        {tab === 'streak' && <Streak embedded />}
        {tab === 'badges' && <Badges />}
        {tab === 'journey' && <JourneyGallery embedded />}
        {tab === 'wrapped' && <WeeklyWrapped embedded />}
      </Suspense>
    </div>
  );
}
