/* ===================================================================
   RewardShop.tsx — مصرف الهمّة: صرف ريالات الهمّة على مكافآت حقيقية
   يصنعها المستخدم لنفسه. ريالات الهمّة تتراكم مع كل XP (core.state.rials)
   وتُخصم عند الشراء فقط — بدون تأثير على المستوى/XP الأساسي.
   =================================================================== */

import { useState } from 'react';
import { useCore, VIP_RIALS_COST } from '../core/useCore';
import BackButton from '../components/BackButton';
import { fireConfetti } from '../components/Confetti';

interface Reward {
  id: string;
  cost: number;
  emoji: string;
  title: string;
  desc: string;
}

const REWARDS: Reward[] = [
  { id: 'tiktok', cost: 50, emoji: '📱', title: 'إذن رسمي بنصف ساعة تصفح', desc: 'تيك توك أو أي سوشيال ميديا — بدون تأنيب ضمير' },
  { id: 'coffee', cost: 100, emoji: '☕', title: 'كوب قهوة من مكانك المفضل', desc: 'روح اشتريه كافأة لنفسك' },
  { id: 'freeday', cost: 200, emoji: '🏖️', title: 'سحبة تكتيكية على المهام', desc: 'يوم مفتوح — بقية اليوم بدون ضغط مهام' },
];

export default function RewardShop() {
  const core = useCore();
  const [hint, setHint] = useState<string | null>(null);

  const handleBuy = (r: Reward) => {
    const ok = core.spendRials(r.cost);
    if (!ok) {
      setHint('⚠️ ريالاتك ما تكفي — كمّل مهام واكسب أكثر');
      return;
    }
    fireConfetti();
    setHint(`🎉 صرفنا ${r.cost} ريال — مكافأتك بانتظارك! روح نفّذها وأنت مستريح البال`);
  };

  const handleBuyVip = () => {
    const ok = core.buyVipRials();
    setHint(ok
      ? '💎 مبروك! صرت VIP رسمي — من الحين كل ريال تكسبه +١٠٪ للأبد'
      : '⚠️ ريالاتك ما تكفي لبطاقة الـVIP بعد — كمّل شوي وارجع لها');
  };

  return (
    <div className="page">
      <BackButton to="/more" />
      <h1 className="section-title">🏦 مصرف الـهـمّــة</h1>

      <div className="intro-card">
        💊 <strong>الجرعة المحفزة:</strong> كل مهمة تنجزها تكسبك ريالات همّة — اصرفها على مكافآت حقيقية تصنعها لنفسك. اربط الإنجاز بمكافأة فورية وملموسة!
      </div>

      <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(150deg, var(--deep), var(--deep-2))', color: '#fff' }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>رصيدك الحالي</div>
        <div style={{ fontSize: '2rem', fontWeight: 800 }}>💰 {core.state.rials} ريال همّة</div>
      </div>

      {hint && <div className="hint-msg ok">{hint}</div>}

      <div className="card" style={{ marginBottom: 10, background: 'linear-gradient(150deg, var(--warning), var(--celebrate))', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: '1.8rem' }}>💎</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>بطاقة VIP الدائمة</div>
            <div style={{ fontSize: '0.76rem', opacity: 0.9 }}>
              {core.state.vipRials
                ? 'مفعّلة عندك ✅ — كل ريال تكسبه +١٠٪ للأبد، عيشتها يا نجم'
                : 'استثمر مرة وحدة بس، واكسب +١٠٪ ريالات على كل شي تسويه للأبد'}
            </div>
          </div>
        </div>
        {!core.state.vipRials && (
          <button className="btn-primary" style={{ width: '100%', marginTop: 10 }}
            disabled={core.state.rials < VIP_RIALS_COST} onClick={handleBuyVip}>
            تفضل اشتريها بـ {VIP_RIALS_COST} ريال — مرة وحدة بس
          </button>
        )}
      </div>

      {REWARDS.map((r) => (
        <div className="card" key={r.id} style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: '1.8rem' }}>{r.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{r.title}</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>{r.desc}</div>
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: 10 }}
            disabled={core.state.rials < r.cost}
            onClick={() => handleBuy(r)}
          >
            استبدال بـ {r.cost} ريال
          </button>
        </div>
      ))}
    </div>
  );
}
