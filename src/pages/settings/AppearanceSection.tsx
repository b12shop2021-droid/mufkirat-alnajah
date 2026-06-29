/* ===================================================================
   AppearanceSection.tsx — المظهر (ليلي + تلقائي + حجم الخط + الثيم)
   جزء من صفحة الإعدادات. الحالة عبر useCore.
   =================================================================== */

import { useCore, type AccentName } from '../../core/useCore';

const ACCENTS: { id: AccentName; cls: string }[] = [
  { id: 'saudi', cls: 'sw-saudi' },
  { id: 'gold', cls: 'sw-gold' },
  { id: 'emerald', cls: 'sw-emerald' },
  { id: 'ocean', cls: 'sw-ocean' },
  { id: 'violet', cls: 'sw-violet' },
  { id: 'rose', cls: 'sw-rose' },
  { id: 'amber', cls: 'sw-amber' },
];

export default function AppearanceSection() {
  const core = useCore();
  const { dark, accent, autoDark, fontScale } = core.state;

  return (
    <>
      <div className="section-title">المظهر</div>
      <div className="settings-card">
        <div className="settings-row">
          <div className="settings-icon">{dark ? '🌙' : '☀️'}</div>
          <div className="settings-text">
            <div className="settings-label">الوضع الليلي</div>
            <div className="settings-sub">
              {autoDark ? 'يتحكم به الوضع التلقائي' : 'يريّح عينك بالليل'}
            </div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={dark} disabled={autoDark} onChange={core.toggleDark} />
            <span className="switch-slider" />
          </label>
        </div>
        <div className="settings-row">
          <div className="settings-icon">🌗</div>
          <div className="settings-text">
            <div className="settings-label">وضع ليلي تلقائي</div>
            <div className="settings-sub">يشتغل تلقائياً من المغرب للفجر</div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={autoDark} onChange={core.toggleAutoDark} />
            <span className="switch-slider" />
          </label>
        </div>
        <div className="settings-row" style={{ display: 'block' }}>
          <div className="settings-label" style={{ marginBottom: 8 }}>🔠 حجم الخط</div>
          <div className="add-row" style={{ marginTop: 0 }}>
            <button
              className={fontScale === 'normal' ? 'btn-primary' : 'btn-ghost'}
              style={{ flex: 1 }}
              onClick={() => core.setFontScale('normal')}
            >
              عادي
            </button>
            <button
              className={fontScale === 'large' ? 'btn-primary' : 'btn-ghost'}
              style={{ flex: 1 }}
              onClick={() => core.setFontScale('large')}
            >
              كبير
            </button>
          </div>
        </div>
        <div className="settings-row" style={{ display: 'block' }}>
          <div className="settings-label" style={{ marginBottom: 8 }}>🎨 لون الثيم</div>
          <div className="theme-swatches">
            {ACCENTS.map((a) => (
              <button
                key={a.id}
                className={
                  accent === a.id ? `theme-swatch ${a.cls} active` : `theme-swatch ${a.cls}`
                }
                aria-label={a.id}
                onClick={() => core.setAccent(a.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
