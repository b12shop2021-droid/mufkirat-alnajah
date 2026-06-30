/* Dose — بطاقة «الجرعة المحفزة» تختار عبارة عشوائية للقسم (ثابتة أثناء الجلسة) */

import { useState } from 'react';
import { getDose, type SectionKey } from '../data/vibes';

export default function Dose({ section }: { section: SectionKey }) {
  const [text] = useState(() => getDose(section));
  return (
    <div className="intro-card">
      💊 <strong>الجرعة المحفزة:</strong> {text}
    </div>
  );
}
