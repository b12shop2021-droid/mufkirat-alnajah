/* ===================================================================
   SelfDev.tsx — تطوير الذات (مجمّعة): الهوية والدستور + مراجعة الأسبوع
   تبويبات. كل تبويب يُحمّل كسولاً (lazy) عند فتحه فقط.
   =================================================================== */

import { lazy, Suspense, useState } from 'react';
import BackButton from '../components/BackButton';
import XPBar from '../components/XPBar';
import { pickLoadingPhrase } from '../data/vibes';

const Identity = lazy(() => import('./Identity'));
const WheelReview = lazy(() => import('./WheelReview'));

type Tab = 'identity' | 'review';

function TabLoader() {
  return (
    <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '28px 0' }}>
      {pickLoadingPhrase()}
    </div>
  );
}

export default function SelfDev() {
  const [tab, setTab] = useState<Tab>('identity');
  return (
    <div className="page">
      <BackButton to="/" />
      <XPBar />
      <h1 className="section-title">🌱 نسختي الأفضل</h1>
      <div className="intro-card">
        💊 <strong>الجرعة المحفزة:</strong> مراجعة مع الذات عشان تبني الشخصية اللي تفتخر فيها قدام.
      </div>
      <div className="subtabs">
        <button className={tab === 'identity' ? 'subtab active' : 'subtab'} onClick={() => setTab('identity')}>
          🪪 الهوية والدستور
        </button>
        <button className={tab === 'review' ? 'subtab active' : 'subtab'} onClick={() => setTab('review')}>
          🪞 مراجعة الأسبوع
        </button>
      </div>
      <Suspense fallback={<TabLoader />}>
        {tab === 'identity' && <Identity embedded />}
        {tab === 'review' && <WheelReview embedded />}
      </Suspense>
    </div>
  );
}
