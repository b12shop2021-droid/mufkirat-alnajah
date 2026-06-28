/* ===================================================================
   PageHero — رأس الصفحة الموحّد (نظام التصميم الواحد)
   يوحّد كل الهيروهات المتفرّقة في تصميم واحد بمتغيّرات لونية.
   variant: لون التدرّج · stars: نجوم متلألئة · badge: شارة جانبية.
   =================================================================== */

import type { ReactNode } from 'react';

type Variant = 'primary' | 'deep' | 'night' | 'sunset' | 'calm';

interface Props {
  icon?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  variant?: Variant;
  stars?: boolean;
  centered?: boolean;
  badge?: ReactNode;
  children?: ReactNode;
}

export default function PageHero({
  icon,
  title,
  subtitle,
  variant = 'primary',
  stars = false,
  centered = false,
  badge,
  children,
}: Props) {
  const cls = `page-hero v-${variant}${centered ? ' center' : ''}`;

  return (
    <div className={cls}>
      {stars && (
        <div className="page-hero-stars" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="hero-star" style={{ ['--i' as string]: i }} />
          ))}
        </div>
      )}
      <div className="page-hero-inner">
        {badge ? (
          <div className="page-hero-row">
            <div>
              {icon && <div className="page-hero-icon">{icon}</div>}
              <div className="page-hero-title">{title}</div>
              {subtitle && <div className="page-hero-sub">{subtitle}</div>}
            </div>
            <div className="page-hero-badge">{badge}</div>
          </div>
        ) : (
          <>
            {icon && <div className="page-hero-icon">{icon}</div>}
            {title && <div className="page-hero-title">{title}</div>}
            {subtitle && <div className="page-hero-sub">{subtitle}</div>}
          </>
        )}
        {children}
      </div>
    </div>
  );
}
