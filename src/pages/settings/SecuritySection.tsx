/* ===================================================================
   SecuritySection.tsx — الخصوصية (قفل PIN + لوحة الإدخال المضمّنة)
   جزء من صفحة الإعدادات. الحالة عبر useCore، والتنبيهات عبر setHint.
   =================================================================== */

import { useState, useCallback } from 'react';
import { isPinEnabled, setPin, clearPin, hashPin } from '../../core/pinUtils';

type PinMode = 'enable' | 'disable' | 'change_old' | 'change_new' | 'change_confirm' | null;

const PIN_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
const PIN_LABEL: Record<NonNullable<PinMode>, string> = {
  enable: 'اكتب رمز من ٤ أرقام',
  disable: 'اكتب رمزك الحالي للتأكيد',
  change_old: 'اكتب رمزك الحالي',
  change_new: 'اكتب الرمز الجديد',
  change_confirm: 'اكتب الرمز الجديد مرة ثانية',
};

export default function SecuritySection({ setHint }: { setHint: (m: string) => void }) {
  const [pinEnabled, setPinEnabled] = useState(isPinEnabled);
  const [pinMode, setPinMode] = useState<PinMode>(null);
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [pinError, setPinError] = useState('');
  const [pinNew, setPinNew] = useState(''); // PIN الجديد المؤقت

  const handlePinKey = useCallback(async (key: string) => {
    if (key === 'del') { setPinDigits((d) => d.slice(0, -1)); setPinError(''); return; }
    const next = [...pinDigits, key];
    setPinDigits(next);
    setPinError('');
    if (next.length < 4) return;
    const entered = next.join('');

    if (pinMode === 'enable') {
      await setPin(entered);
      setPinEnabled(true);
      setPinMode(null); setPinDigits([]); setPinNew('');
      setHint('🔒 فعّلنا قفل PIN');
    } else if (pinMode === 'disable') {
      const hash = await hashPin(entered);
      if (hash !== localStorage.getItem('mufkirat_pin_hash')) {
        setPinError('الرمز غلط'); setPinDigits([]); return;
      }
      clearPin(); setPinEnabled(false);
      setPinMode(null); setPinDigits([]);
      setHint('🔓 ألغينا قفل PIN');
    } else if (pinMode === 'change_old') {
      const hash = await hashPin(entered);
      if (hash !== localStorage.getItem('mufkirat_pin_hash')) {
        setPinError('الرمز غلط'); setPinDigits([]); return;
      }
      setPinMode('change_new'); setPinDigits([]);
    } else if (pinMode === 'change_new') {
      setPinNew(entered); setPinMode('change_confirm'); setPinDigits([]);
    } else if (pinMode === 'change_confirm') {
      if (entered !== pinNew) {
        setPinError('الرمزين ما يطابقون'); setPinDigits([]); return;
      }
      await setPin(entered);
      setPinMode(null); setPinDigits([]); setPinNew('');
      setHint('🔑 غيّرنا رمز PIN');
    }
  }, [pinDigits, pinMode, pinNew, setHint]);

  return (
    <>
      <div className="section-title">الخصوصية</div>
      <div className="settings-card">
        {!pinEnabled ? (
          <button className="settings-row" style={{ width: '100%', textAlign: 'right' }} onClick={() => { setPinMode('enable'); setPinDigits([]); setPinError(''); }}>
            <div className="settings-icon">🔒</div>
            <div className="settings-text">
              <div className="settings-label">تفعيل قفل PIN</div>
              <div className="settings-sub">رمز مكوّن من 4 أرقام يُطلب عند كل فتح</div>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>‹</div>
          </button>
        ) : (
          <>
            <button className="settings-row" style={{ width: '100%', textAlign: 'right' }} onClick={() => { setPinMode('change_old'); setPinDigits([]); setPinError(''); }}>
              <div className="settings-icon">🔑</div>
              <div className="settings-text">
                <div className="settings-label">تغيير رمز PIN</div>
                <div className="settings-sub">اضبط رمزاً جديداً</div>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>‹</div>
            </button>
            <button className="settings-row" style={{ width: '100%', textAlign: 'right' }} onClick={() => { setPinMode('disable'); setPinDigits([]); setPinError(''); }}>
              <div className="settings-icon">🔓</div>
              <div className="settings-text">
                <div className="settings-label" style={{ color: 'var(--danger)' }}>إلغاء قفل PIN</div>
              </div>
            </button>
          </>
        )}
      </div>

      {/* لوحة إدخال PIN المضمّنة */}
      {pinMode && (
        <div className="card pin-inline-panel">
          <div className="pin-inline-title">{PIN_LABEL[pinMode]}</div>
          <div className="pin-dots">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`pin-dot ${pinDigits.length > i ? 'filled' : ''} ${pinError ? 'error' : ''}`} />
            ))}
          </div>
          {pinError && <div className="pin-error">{pinError}</div>}
          <div className="pin-keypad">
            {PIN_KEYS.map((k, i) =>
              k === '' ? <div key={i} /> : (
                <button key={k + i} className={`pin-key ${k === 'del' ? 'pin-del' : ''}`} onClick={() => handlePinKey(k)} disabled={pinDigits.length >= 4 && k !== 'del'}>
                  {k === 'del' ? '⌫' : k}
                </button>
              )
            )}
          </div>
          <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => { setPinMode(null); setPinDigits([]); setPinError(''); setPinNew(''); }}>إلغاء</button>
        </div>
      )}
    </>
  );
}
