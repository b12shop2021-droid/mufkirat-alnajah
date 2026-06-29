/* ===================================================================
   prayerTimes.ts — حساب مواقيت الصلاة محلياً (بدون إنترنت) عبر مكتبة adhan.
   طريقة أم القرى (المناسبة للسعودية). الإحداثيات من تحديد الموقع أو افتراضي (مكة).
   =================================================================== */

import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

export interface Coords {
  lat: number;
  lng: number;
}

/* افتراضي: مكة المكرمة (لو ما أُعطي إذن الموقع) */
export const DEFAULT_COORDS: Coords = { lat: 21.4225, lng: 39.8262 };

export interface PrayerSlot {
  key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  name: string;
  time: Date;
}

const NAMES: Record<PrayerSlot['key'], string> = {
  fajr: 'الفجر',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

/* مواقيت اليوم الخمس لإحداثيات معيّنة */
export function getPrayerTimes(coords: Coords, date: Date = new Date()): PrayerSlot[] {
  const pt = new PrayerTimes(
    new Coordinates(coords.lat, coords.lng),
    date,
    CalculationMethod.UmmAlQura(),
  );
  return [
    { key: 'fajr', name: NAMES.fajr, time: pt.fajr },
    { key: 'dhuhr', name: NAMES.dhuhr, time: pt.dhuhr },
    { key: 'asr', name: NAMES.asr, time: pt.asr },
    { key: 'maghrib', name: NAMES.maghrib, time: pt.maghrib },
    { key: 'isha', name: NAMES.isha, time: pt.isha },
  ];
}

/* تنسيق الوقت 12 ساعة بالعربي */
export function fmtTime(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const period = h < 12 ? 'ص' : 'م';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${period}`;
}

/* طلب الموقع من المتصفح (مع رجوع للافتراضي عند الرفض) */
export function requestCoords(): Promise<Coords> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(DEFAULT_COORDS);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(DEFAULT_COORDS),
      { timeout: 8000, maximumAge: 86_400_000 },
    );
  });
}
