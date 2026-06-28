/* أدوات PIN — SHA-256 عبر Web Crypto API (متاحة في كل المتصفحات الحديثة) */

export async function hashPin(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode('mufkirat_' + pin),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function isPinEnabled(): boolean {
  return !!localStorage.getItem('mufkirat_pin_hash');
}

export function isSessionUnlocked(): boolean {
  return sessionStorage.getItem('mufkirat_unlocked') === 'true';
}

export async function setPin(pin: string): Promise<void> {
  localStorage.setItem('mufkirat_pin_hash', await hashPin(pin));
}

export function clearPin(): void {
  localStorage.removeItem('mufkirat_pin_hash');
  sessionStorage.removeItem('mufkirat_unlocked');
}
