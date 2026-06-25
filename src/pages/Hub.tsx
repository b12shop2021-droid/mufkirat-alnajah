/* ===================================================================
   Hub.tsx — مفكرة النجاح / المزيد
   تنظيم أقسام التطبيق في 4 تبويبات + تبويب العهود المستقل البارز.
   روابط لكل الصفحات المبنية (نفس بنية التبويبات المعتمدة).
   =================================================================== */

import { useState } from 'react';
import { useLocation } from 'wouter';
import BackButton from '../components/BackButton';

type Tab = 'daily' | 'journey' | 'deep' | 'achievements';

interface Link {
  icon: string;
  label: string;
  to: string;
}

const TABS: { id: Tab; label: string; links: Link[] }[] = [
  {
    id: 'daily',
    label: '☀️ حياتي',
    links: [
      { icon: '🏠', label: 'الملخص الذكي', to: '/' },
      { icon: '🔄', label: 'الروتين الصباحي/المسائي', to: '/routine' },
      { icon: '😊', label: 'المزاج ولحظة الفخر', to: '/mood' },
      { icon: '📝', label: 'الملاحظات وشكر اليوم', to: '/notes' },
      { icon: '📖', label: 'القرآن والتقويم', to: '/quran' },
      { icon: '🍽️', label: 'الوجبات', to: '/meals' },
    ],
  },
  {
    id: 'journey',
    label: '🔥 التزامي',
    links: [
      { icon: '😴', label: 'النوم ودائرة العلاقات', to: '/sleep' },
      { icon: '🛡️', label: 'العهود وصندوق الزمن', to: '/pledges' },
      { icon: '🏋️', label: 'التمارين', to: '/workouts' },
    ],
  },
  {
    id: 'deep',
    label: '🌱 تطوّري',
    links: [
      { icon: '🪪', label: 'تطوير الذات (الهوية والمراجعة)', to: '/self-dev' },
      { icon: '🎯', label: 'الأهداف', to: '/goals' },
      { icon: '💳', label: 'المصاريف', to: '/expenses' },
    ],
  },
  {
    id: 'achievements',
    label: '🏆 فخري',
    links: [
      { icon: '🖼️', label: 'إنجازاتي (السلسلة والمعرض والمحطات)', to: '/achievements' },
      { icon: '📊', label: 'التحليلات', to: '/analytics' },
    ],
  },
];

const EXTRA: Link[] = [
  { icon: '⚙️', label: 'الإعدادات والإشعارات', to: '/settings' },
];

export default function Hub() {
  const [tab, setTab] = useState<Tab>('daily');
  const [, navigate] = useLocation();
  const active = TABS.find((t) => t.id === tab)!;

  return (
    <div className="page">
      <BackButton to="/" />
      <h1 className="section-title">📖 مفكرة النجاح</h1>

      {/* تبويب العهود المستقل البارز */}
      <button
        className="hub-link"
        style={{ background: 'linear-gradient(150deg, var(--deep), var(--deep-2))', color: '#fff' }}
        onClick={() => navigate('/pledges')}
      >
        <div className="hub-link-icon" style={{ background: 'rgba(255,255,255,0.18)' }}>🛡️</div>
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
          <div className="hub-link-icon">{l.icon}</div>
          <div className="hub-link-label">{l.label}</div>
          <div className="hub-link-arrow">‹</div>
        </button>
      ))}

      <h2 className="section-title" style={{ marginTop: 18 }}>أقسام أخرى</h2>
      {EXTRA.map((l) => (
        <button key={l.label} className="hub-link" onClick={() => navigate(l.to)}>
          <div className="hub-link-icon">{l.icon}</div>
          <div className="hub-link-label">{l.label}</div>
          <div className="hub-link-arrow">‹</div>
        </button>
      ))}
    </div>
  );
}
