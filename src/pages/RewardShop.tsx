/* ===================================================================
   RewardShop.tsx — سوق الهمّة: صرف ريالات الهمّة على مكافآت حقيقية
   يصنعها المستخدم لنفسه. ريالات الهمّة تتراكم مع كل XP (core.state.rials)
   وتُخصم عند الشراء فقط — بدون تأثير على المستوى/XP الأساسي.
   =================================================================== */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCore } from '../core/useCore';
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
  { id: 'template', cost: 30, emoji: '🎁', title: 'افتح قالب جاهز مميز', desc: 'يودّيك لصفحة القوالب الجاهزة عشان تختار قالبك' },
];

export default function RewardShop() {
  const core = useCore();
  const [, navigate] = useLocation();
  const [hint, setHint] = useState<string | null>(null);

  const handleBuy = (r: Reward) => {
    const ok = core.spendRials(r.cost);
    if (!ok) {
      setHint('⚠️ ريالاتك ما تكفي — كمّل مهام واكسب أكثر');
      return;
    }
    fireConfetti();
    setHint(`🎉 صرفنا ${r.cost} ريال — مكافأتك بانتظارك! روح نفّذها وأنت مستريح البال`);
    if (r.id === 'template') navigate('/templates');
  };

  return (
    <div className="page">
      <BackButton to="/more" />
      <h1 className="section-title">🛍️ سوق الهمّة</h1>

      <div className="intro-card">
        💊 <strong>الجرعة المحفزة:</strong> كل مهمة تنجزها تكسبك ريالات همّة — اصرفها على مكافآت حقيقية تصنعها لنفسك. اربط الإنجاز بمكافأة فورية وملموسة!
      </div>

      <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(150deg, var(--deep), var(--deep-2))', color: '#fff' }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>رصيدك الحالي</div>
        <div style={{ fontSize: '2rem', fontWeight: 800 }}>💰 {core.state.rials} ريال همّة</div>
      </div>

      {hint && <div className="hint-msg ok">{hint}</div>}

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
