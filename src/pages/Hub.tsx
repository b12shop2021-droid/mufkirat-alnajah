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
    label: '🏠 يومي',
    links: [
      { icon: '🏠', label: 'الملخص الذكي', to: '/' },
      { icon: '🔄', label: 'الروتين الصباحي/المسائي', to: '/routine' },
      { icon: '😊', label: 'المزاج ولحظة الفخر', to: '/mood' },
      { icon: '📝', label: 'الملاحظات وشكر اليوم', to: '/notes' },
      { icon: '📖', label: 'القرآن والتقويم', to: '/quran' },
    ],
  },
  {
    id: 'journey',
    label: '🔥 رحلتي',
    links: [
      { icon: '🔥', label: 'السلسلة والرفيق الذكي', to: '/streak' },
      { icon: '😴', label: 'النوم ودائرة العلاقات', to: '/sleep' },
      { icon: '🎡', label: 'عجلة الحياة ومراجعة الأسبوع', to: '/wheel' },
      { icon: '🗺️', label: 'محطات الطريق', to: '/gallery' },
    ],
  },
  {
    id: 'deep',
    label: '🌱 رحلتي العميقة',
    links: [
      { icon: '🪪', label: 'بطاقة الهوية ودستور الذات', to: '/identity' },
      { icon: '🎡', label: 'عجلة الحياة', to: '/wheel' },
      { icon: '📦', label: 'صندوق الزمن ورسائل المستقبل', to: '/pledges' },
      { icon: '🏷️', label: 'الألقاب والمستويات', to: '/streak' },
    ],
  },
  {
    id: 'achievements',
    label: '🏆 إنجازاتي',
    links: [
      { icon: '🖼️', label: 'معرض الإنجازات وقصة الشهر', to: '/gallery' },
      { icon: '🏷️', label: 'الألقاب المكتسبة', to: '/streak' },
      { icon: '📊', label: 'التحليلات', to: '/analytics' },
    ],
  },
];

const EXTRA: Link[] = [
  { icon: '💳', label: 'المصاريف', to: '/expenses' },
  { icon: '🏋️', label: 'جدول الكابتن سعود', to: '/captain-workout' },
  { icon: '🛠️', label: 'صمّم جدول تمارينك', to: '/custom-workout' },
  { icon: '📋', label: 'الإرشادات الأساسية', to: '/guidelines' },
  { icon: '⚙️', label: 'الإعدادات', to: '/settings' },
  { icon: '🔔', label: 'الإشعارات', to: '/notifications' },
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
        style={{ background: 'linear-gradient(150deg, var(--deep), #122f3b)', color: '#fff' }}
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
