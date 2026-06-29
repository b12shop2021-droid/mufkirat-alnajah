/* ===================================================================
   Badges.tsx — أوسمة الإنجازات. تُحسب من حالة النواة (محلياً).
   تُعرض داخل صفحة الإنجازات كتبويب.
   =================================================================== */

import { useCore } from '../core/useCore';

interface BadgeDef {
  emoji: string;
  title: string;
  desc: string;
  earned: boolean;
}

export default function Badges() {
  const { state } = useCore();
  const s = state;

  const badges: BadgeDef[] = [
    { emoji: '🌱', title: 'أول خطوة', desc: 'سوّيت أول مهمة بروتينك', earned: [...s.routine.morning, ...s.routine.evening].some((t) => (t.history?.length ?? 0) > 0) },
    { emoji: '🎯', title: 'محقّق الأهداف', desc: 'كمّلت أول هدف لك', earned: s.goals.some((g) => g.completed) },
    { emoji: '🔥', title: 'أسبوع متواصل', desc: 'سلسلة ٧ أيام بلا توقّف', earned: s.streak.longest >= 7 },
    { emoji: '🏔️', title: 'شهر كامل', desc: 'سلسلة ٣٠ يوم — وحش!', earned: s.streak.longest >= 30 },
    { emoji: '⭐', title: 'أول ١٠٠ نقطة', desc: 'جمعت ١٠٠ نقطة', earned: s.xp >= 100 },
    { emoji: '👑', title: 'أسطورة النقاط', desc: 'جمعت ٥٠٠ نقطة', earned: s.xp >= 500 },
    { emoji: '🛡️', title: 'صاحب عهد', desc: 'سوّيت أول عهد لك', earned: s.pledges.length > 0 },
    { emoji: '📖', title: 'ورد ثابت', desc: 'سجّلت وردك من القرآن', earned: s.quranMinutes.length > 0 },
    { emoji: '🙏', title: 'قلب شاكر', desc: '١٠ مرات امتنان', earned: s.gratitudeLog.length >= 10 },
    { emoji: '💰', title: 'ضابط المصروف', desc: 'سجّلت ١٠ مصاريف', earned: s.expenses.length >= 10 },
    { emoji: '😴', title: 'راصد النوم', desc: 'سجّلت نومك ٧ مرات', earned: s.sleepLog.length >= 7 },
    { emoji: '✍️', title: 'صاحب نِيّة', desc: '٧ نِيّات يومية', earned: s.intentionLog.length >= 7 },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <>
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>أوسمتك</div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
          {earnedCount} / {badges.length}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {earnedCount === badges.length ? 'كملت كل الأوسمة — أسطورة! 👑' : 'كمّل عشان تفتح الباقي 💪'}
        </div>
      </div>

      <div className="badge-grid">
        {badges.map((b) => (
          <div key={b.title} className={b.earned ? 'badge-item earned' : 'badge-item'}>
            <div className="badge-emoji">{b.earned ? b.emoji : '🔒'}</div>
            <div className="badge-title">{b.title}</div>
            <div className="badge-desc">{b.desc}</div>
          </div>
        ))}
      </div>
    </>
  );
}
