/* ===================================================================
   AppearanceSection.tsx — المظهر (ليلي + تلقائي + حجم الخط + الثيم)
   جزء من صفحة الإعدادات. الحالة عبر useCore.
   =================================================================== */

import { useCore, type AccentName } from '../../core/useCore';

const FONTS: { id: 'tajawal' | 'ibmplex' | 'amiri' | 'cairo' | 'almarai' | 'changa' | 'elmessiri'; label: string; sample: string }[] = [
  { id: 'tajawal', label: 'تجوال', sample: "'Tajawal', sans-serif" },
  { id: 'cairo', label: 'القاهرة', sample: "'Cairo', sans-serif" },
  { id: 'almarai', label: 'المراعي', sample: "'Almarai', sans-serif" },
  { id: 'changa', label: 'تشانجا', sample: "'Changa', sans-serif" },
  { id: 'elmessiri', label: 'المسيري', sample: "'El Messiri', serif" },
  { id: 'ibmplex', label: 'بلكس', sample: "'IBM Plex Sans Arabic', sans-serif" },
  { id: 'amiri', label: 'أميري', sample: "'Amiri', serif" },
];

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
  const { dark, accent, autoDark, fontScale, fontFamily, soundOn } = core.state;

  return (
    <>
      <div className="section-title">المظهر</div>
      <div className="settings-card">
        <div className="settings-row">
          <div className="settings-icon">{dark ? '🌙' : '☀️'}</div>
          <div className="settings-text">
            <div className="settings-label">وضع الهدوء (عشان عيونك في الليل)</div>
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
        <div className="settings-row">
          <div className="settings-icon">{soundOn ? '🔊' : '🔇'}</div>
          <div className="settings-text">
            <div className="settings-label">أصوات النجاح</div>
            <div className="settings-sub">نغمة حلوة لما تنجز مهمة أو تطلع مستوى</div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={soundOn} onChange={core.toggleSound} />
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
            <button
              className={fontScale === 'xlarge' ? 'btn-primary' : 'btn-ghost'}
              style={{ flex: 1 }}
              onClick={() => core.setFontScale('xlarge')}
            >
              أكبر
            </button>
          </div>
        </div>
        <div className="settings-row" style={{ display: 'block' }}>
          <div className="settings-label" style={{ marginBottom: 8 }}>✍️ نوع الخط</div>
          <div className="add-row" style={{ marginTop: 0, flexWrap: 'wrap', gap: 8 }}>
            {FONTS.map((f) => (
              <button
                key={f.id}
                className={fontFamily === f.id ? 'btn-primary' : 'btn-ghost'}
                style={{ flex: '1 1 28%', fontFamily: f.sample, fontSize: '1.05rem' }}
                onClick={() => core.setFontFamily(f.id)}
              >
                {f.label}
              </button>
            ))}
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
