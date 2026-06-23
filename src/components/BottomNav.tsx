/* ===================================================================
   BottomNav — التنقل السفلي الثابت (المزيد/التحليلات/العادات/الأهداف/الرئيسية).
   =================================================================== */

import { useLocation } from 'wouter';

interface NavEntry {
  path: string;
  label: string;
  icon: string;
}

/* الترتيب البصري RTL: الرئيسية أولاً من اليمين */
const NAV_ITEMS: NavEntry[] = [
  { path: '/', label: 'الرئيسية', icon: '🏠' },
  { path: '/goals', label: 'الأهداف', icon: '🎯' },
  { path: '/habits', label: 'العادات', icon: '🔁' },
  { path: '/analytics', label: 'التحليلات', icon: '📊' },
  { path: '/more', label: 'المزيد', icon: '☰' },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const active = location === item.path;
        return (
          <button
            key={item.path}
            className={active ? 'nav-item active' : 'nav-item'}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
