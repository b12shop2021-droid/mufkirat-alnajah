/* ===================================================================
   SelfDev.tsx — تطوير الذات (مجمّعة): الهوية والدستور + مراجعة الأسبوع
   تدمج صفحتي التأمل الذاتي في تبويبات.
   =================================================================== */

import { useState } from 'react';
import BackButton from '../components/BackButton';
import XPBar from '../components/XPBar';
import Identity from './Identity';
import WheelReview from './WheelReview';

type Tab = 'identity' | 'review';

export default function SelfDev() {
  const [tab, setTab] = useState<Tab>('identity');
  return (
    <div className="page">
      <BackButton to="/" />
      <XPBar />
      <div className="subtabs">
        <button className={tab === 'identity' ? 'subtab active' : 'subtab'} onClick={() => setTab('identity')}>
          🪪 الهوية والدستور
        </button>
        <button className={tab === 'review' ? 'subtab active' : 'subtab'} onClick={() => setTab('review')}>
          🪞 مراجعة الأسبوع
        </button>
      </div>
      {tab === 'identity' && <Identity embedded />}
      {tab === 'review' && <WheelReview embedded />}
    </div>
  );
}
