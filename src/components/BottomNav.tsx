/* BottomNav — التنقل السفلي الثابت */

import { useLocation } from 'wouter';

interface NavEntry {
  path: string;
  label: string;
  iconClass: string;
  img?: string; // صورة مخصّصة بدل أيقونة الـsprite
}

const NAV_ITEMS: NavEntry[] = [
  { path: '/',          label: 'الرئيسية',  iconClass: 'ic-home'      },
  { path: '/goals',     label: 'الأهداف',   iconClass: 'ic-goals', img: '/icons/goals.webp' },
  { path: '/quran',  label: 'القرآن',     iconClass: 'ic-quran' },
  { path: '/notes',  label: 'الملاحظات', iconClass: 'ic-notes'  },
  { path: '/more',      label: 'المزيد',    iconClass: 'ic-hub'       },
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
