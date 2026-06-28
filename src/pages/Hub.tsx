/* ===================================================================
   Hub.tsx — الهمّة / المزيد
   =================================================================== */

import { useState } from 'react';
import { useLocation } from 'wouter';
import BackButton from '../components/BackButton';

type Tab = 'daily' | 'journey' | 'deep' | 'achievements';

interface Link {
  iconClass: string;
  label: string;
  to: string;
}

const TABS: { id: Tab; label: string; links: Link[] }[] = [
  {
    id: 'daily',
    label: '☀️ حياتي',
    links: [
      { iconClass: 'ic-routine',  label: 'الروتين الصباحي/المسائي',   to: '/routine' },
      { iconClass: 'ic-mood',     label: 'المزاج ولحظة الفخر',        to: '/mood'   },
      { iconClass: 'ic-notes',    label: 'الملاحظات وشكر اليوم',      to: '/notes'  },
      { iconClass: 'ic-quran',    label: 'القرآن والتقويم',            to: '/quran'  },
      { iconClass: 'ic-meals',    label: 'الوجبات',                   to: '/meals'  },
    ],
  },
  {
    id: 'journey',
    label: '🔥 التزامي',
    links: [
      { iconClass: 'ic-workouts',    label: 'التمارين',                   to: '/workouts' },
      { iconClass: 'ic-mood',        label: 'العلاقات والمناسبات',        to: '/occasions'  },
      { iconClass: 'ic-timecapsule', label: 'العهود وصندوق الزمن',        to: '/pledges'  },
      { iconClass: 'ic-habits',      label: 'مؤقت البومودورو',            to: '/pomodoro' },
      { iconClass: 'ic-expenses',    label: 'المصاريف',                   to: '/expenses' },
    ],
  },
  {
    id: 'deep',
    label: '🌱 تطوّري',
    links: [
      { iconClass: 'ic-selfdev',  label: 'تطوير الذات (الهوية والمراجعة)', to: '/self-dev' },
      { iconClass: 'ic-goals',    label: 'الأهداف',                       to: '/goals'    },
    ],
  },
  {
    id: 'achievements',
    label: '🏆 فخري',
    links: [
      { iconClass: 'ic-achievements', label: 'إنجازاتي (السلسلة والمعرض والمحطات)', to: '/achievements' },
      { iconClass: 'ic-analytics',    label: 'التحليلات',                           to: '/analytics'    },
    ],
  },
];

const EXTRA: Link[] = [
  { iconClass: 'ic-settings', label: 'الإعدادات والإشعارات', to: '/settings' },
];

export default function Hub() {
  const [tab, setTab] = useState<Tab>('daily');
  const [, navigate] = useLocation();
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="page">
      <BackButton to="/" />
      <h1 className="section-title">📖 الهمّة</h1>

      {/* تبويب العهود المستقل البارز */}
      <button
        className="hub-link"
        style={{ background: 'linear-gradient(150deg, var(--deep), var(--deep-2))', color: '#fff' }}
        onClick={() => navigate('/pledges')}
      >
        <span className="app-icon sm ic-pledges hub-link-icon" style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 10 }} />
        <div className="hub-link-label">العهود (قطع العادات السلبية)</div>
        <div className="hub-link-arrow" style={{ color: '#fff' }}>‹</div>
      </button>

      <div className="subtabs" style={{ marginTop: 14 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'subtab active' : 'subtab'}
            style={{ fontSize: '0.7rem' }}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active.links.map((l) => (
        <button key={l.label} className="hub-link" onClick={() => navigate(l.to)}>
          <span className={`app-icon sm ${l.iconClass} hub-link-icon`} />
          <div className="hub-link-label">{l.label}</div>
          <div className="hub-link-arrow">‹</div>
        </button>
      ))}

      <h2 className="section-title" style={{ marginTop: 18 }}>أقسام أخرى</h2>
      {EXTRA.map((l) => (
        <button key={l.label} className="hub-link" onClick={() => navigate(l.to)}>
          <span className={`app-icon sm ${l.iconClass} hub-link-icon`} />
          <div className="hub-link-label">{l.label}</div>
          <div className="hub-link-arrow">‹</div>
        </button>
      ))}
    </div>
  );
}
