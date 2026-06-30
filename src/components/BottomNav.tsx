/* BottomNav — التنقل السفلي الثابت */

import { useLocation } from 'wouter';

interface NavEntry {
  path: string;
  label: string;
  iconClass: string;
  img?: string; // صورة مخصّصة بدل أيقونة الـsprite
}

const NAV_ITEMS: NavEntry[] = [
  { path: '/',          label: 'رحلتك للنجاح', iconClass: 'ic-home'  },
  { path: '/notes',     label: 'فضفضة',        iconClass: 'ic-notes' },
  { path: '/quran',     label: 'نور حياتي',    iconClass: 'ic-quran' },
  { path: '/occasions', label: 'الغالين',      iconClass: 'ic-occasions' },
  { path: '/more',      label: 'المزيد',       iconClass: 'ic-hub'   },
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
            {item.img ? (
              <img className="nav-img" src={item.img} alt="" aria-hidden="true" width={28} height={28} />
            ) : (
              <span className={`app-icon sm ${item.iconClass}`} aria-hidden="true" />
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
