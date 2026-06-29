/* ===================================================================
   Achievements.tsx — إنجازاتي (مجمّعة): السلسلة + رحلتي ومعرض الإنجازات
   تبويبات. كل تبويب يُحمّل كسولاً (lazy) عند فتحه فقط — حزمة أولية أخف.
   =================================================================== */

import { lazy, Suspense, useState } from 'react';
import BackButton from '../components/BackButton';
import XPBar from '../components/XPBar';

const Streak = lazy(() => import('./Streak'));
const JourneyGallery = lazy(() => import('./JourneyGallery'));
const WeeklyWrapped = lazy(() => import('./WeeklyWrapped'));

type Tab = 'streak' | 'journey' | 'wrapped';

function TabLoader() {
  return (
    <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '28px 0' }}>
      ⏳ لحظة...
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
      <div className="intro-card">
        💊 <strong>الجرعة المحفزة:</strong> وثّق بطولاتك وإنجازاتك، لأنك تعبت وتستاهل تحتفل بها!
      </div>
      <div className="subtabs">
        <button className={tab === 'streak' ? 'subtab active' : 'subtab'} onClick={() => setTab('streak')}>
          🔥 السلسلة والألقاب
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
        {tab === 'journey' && <JourneyGallery embedded />}
        {tab === 'wrapped' && <WeeklyWrapped embedded />}
      </Suspense>
    </div>
  );
}
