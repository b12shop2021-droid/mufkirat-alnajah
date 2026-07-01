/* ===================================================================
   Templates.tsx — متجر الهمّة: قوالب احترافية جاهزة (أهداف/روتين/تحديات/ميزانية).
   مقفلة حتى تُفتح بريالات الهمّة، ثم تُطبَّق عبر core.applyTemplate بضغطة واحدة.
   =================================================================== */

import { useState, useMemo } from 'react';
import { useCore, todayStr } from '../core/useCore';
import BackButton from '../components/BackButton';
import {
  GOAL_TEMPLATES, ROUTINE_TEMPLATES, CHALLENGE_TEMPLATES, HABIT_TEMPLATES, BUDGET_TEMPLATES,
  TEMPLATE_UNLOCK_COST, DAILY_DEAL_DISCOUNT, getDailyDealId,
  type AnyTemplate,
} from '../data/templates';

type Tab = 'goal' | 'routine' | 'challenge' | 'habit' | 'budget';

export default function Templates() {
  const core = useCore();
  const [tab, setTab] = useState<Tab>('goal');
  const [applied, setApplied] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const v = (m: string, f: string) => (core.state.profile.gender === 'female' ? f : m);

  /* عرض اليوم — قالب واحد ثابت طول اليوم بنص السعر */
  const dealId = useMemo(() => getDailyDealId(todayStr()), []);
  const costFor = (id: string) => (id === dealId ? Math.round(TEMPLATE_UNLOCK_COST * DAILY_DEAL_DISCOUNT) : TEMPLATE_UNLOCK_COST);

  const isUnlocked = (id: string) => core.state.unlockedTemplates.includes(id);

  const unlock = (t: AnyTemplate) => {
    const ok = core.unlockTemplate(t.id, costFor(t.id));
    setHint(ok ? `🔓 فتحنا لك "${t.title}" — بالتوفيق!` : `⚠️ ريالاتك ما تكفي — ${v('كمّل', 'كمّلي')} مهام واكسب ريالات همّة أكثر`);
  };

  const apply = (t: AnyTemplate) => {
    core.applyTemplate(t);
    setApplied(t.id);
    setTimeout(() => setApplied((cur) => (cur === t.id ? null : cur)), 2500);
  };

  const LockButton = ({ t }: { t: AnyTemplate }) => {
    const isDeal = t.id === dealId;
    const cost = costFor(t.id);
    return (
      <button className="btn-primary" style={{ width: '100%' }} onClick={() => unlock(t)}>
        {isDeal ? `⚡ عرض اليوم! افتح بـ ${cost} بدل ${TEMPLATE_UNLOCK_COST} ريال` : `🔒 افتح بـ ${cost} ريال همّة`}
      </button>
    );
  };

  return (
    <div className="page">
      <BackButton />
      <h1 className="section-title">🛍️ متجر الـهـمّــة</h1>
      <div className="intro-card">
        💊 <strong>الجرعة المحفزة:</strong> محتار وش تكتب؟ لا تعقّدها — افتح قالب بريالات همّتك، بضغطة وحدة يتعبّى لك كل شي وعدّله على كيفك.
      </div>

      <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(150deg, var(--deep), var(--deep-2))', color: '#fff' }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>رصيدك الحالي</div>
        <div style={{ fontSize: '2rem', fontWeight: 800 }}>💰 {core.state.rials} ريال همّة</div>
      </div>

      {hint && <div className="hint-msg ok">{hint}</div>}

      <div className="subtabs">
        {(['goal', 'routine', 'challenge', 'habit', 'budget'] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? 'subtab active' : 'subtab'} onClick={() => setTab(t)}>
            {t === 'goal' ? '🎯 أهداف' : t === 'routine' ? '☀️ روتين' : t === 'challenge' ? '🔥 تحديات' : t === 'habit' ? '🔁 عادات' : '💰 ميزانية'}
          </button>
        ))}
      </div>

      {/* ===== أهداف ===== */}
      {tab === 'goal' && GOAL_TEMPLATES.map((t) => {
        const unlocked = isUnlocked(t.id);
        return (
          <div className="card" key={t.id}>
            <div className="tpl-head">
              <span className="tpl-emoji">{unlocked ? t.emoji : '🔒'}</span>
              <div>
                <div className="tpl-title">{t.title}</div>
                <div className="tpl-desc">{t.desc} · {t.category} · ~{t.days} يوم</div>
              </div>
            </div>
            {unlocked ? (
              <>
                <ul className="tpl-steps">
                  {t.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
                <button className={applied === t.id ? 'btn-primary done' : 'btn-primary'} style={{ width: '100%' }}
                  disabled={applied === t.id} onClick={() => apply(t)}>
                  {applied === t.id ? '✅ انضاف لأهدافك — كفو!' : `${v('خذ', 'خذي')} هذا القالب`}
                </button>
              </>
            ) : (
              <LockButton t={t} />
            )}
          </div>
        );
      })}

      {/* ===== روتين ===== */}
      {tab === 'routine' && ROUTINE_TEMPLATES.map((t) => {
        const unlocked = isUnlocked(t.id);
        return (
          <div className="card" key={t.id}>
            <div className="tpl-head">
              <span className="tpl-emoji">{unlocked ? t.emoji : '🔒'}</span>
              <div>
                <div className="tpl-title">{t.title} {t.popular && <span className="tpl-badge">⭐ مقترح</span>}</div>
                <div className="tpl-desc">{t.desc}</div>
              </div>
            </div>
            {unlocked ? (
              <>
                <ul className="tpl-steps">
                  {t.morning.map((s, i) => <li key={'m' + i}>🌅 {s}</li>)}
                  {t.evening.map((s, i) => <li key={'e' + i}>🌙 {s}</li>)}
                </ul>
                <button className={applied === t.id ? 'btn-primary done' : 'btn-primary'} style={{ width: '100%' }}
                  disabled={applied === t.id} onClick={() => apply(t)}>
                  {applied === t.id ? `✅ انضاف لروتينك — يا ${v('بطل', 'بطلة')}!` : `${v('خذ', 'خذي')} هذا الروتين`}
                </button>
              </>
            ) : (
              <LockButton t={t} />
            )}
          </div>
        );
      })}

      {/* ===== تحديات ===== */}
      {tab === 'challenge' && CHALLENGE_TEMPLATES.map((t) => {
        const unlocked = isUnlocked(t.id);
        return (
          <div className="card" key={t.id}>
            <div className="tpl-head">
              <span className="tpl-emoji">{unlocked ? t.emoji : '🔒'}</span>
              <div>
                <div className="tpl-title">{t.title}</div>
                <div className="tpl-desc">{t.desc} · {t.days} يوم</div>
              </div>
            </div>
            {unlocked ? (
              <>
                <ul className="tpl-steps">
                  {(t.morning ?? []).map((s, i) => <li key={'m' + i}>🌅 {s}</li>)}
                  {(t.evening ?? []).map((s, i) => <li key={'e' + i}>🌙 {s}</li>)}
                </ul>
                <button className={applied === t.id ? 'btn-primary done' : 'btn-primary'} style={{ width: '100%' }}
                  disabled={applied === t.id} onClick={() => apply(t)}>
                  {applied === t.id ? '✅ بدأ التحدّي — وريهم وش فيك!' : `وريهم وش فيك — ${v('ابدأ', 'ابدئي')} التحدّي وانت قدها 🔥`}
                </button>
              </>
            ) : (
              <LockButton t={t} />
            )}
          </div>
        );
      })}

      {/* ===== عادات ===== */}
      {tab === 'habit' && HABIT_TEMPLATES.map((t) => {
        const unlocked = isUnlocked(t.id);
        return (
          <div className="card" key={t.id}>
            <div className="tpl-head">
              <span className="tpl-emoji">{unlocked ? t.emoji : '🔒'}</span>
              <div>
                <div className="tpl-title">{t.title}</div>
                <div className="tpl-desc">{t.desc}</div>
              </div>
            </div>
            {unlocked ? (
              <>
                <ul className="tpl-steps">
                  <li>{t.reminder}</li>
                </ul>
                <button className={applied === t.id ? 'btn-primary done' : 'btn-primary'} style={{ width: '100%' }}
                  disabled={applied === t.id} onClick={() => apply(t)}>
                  {applied === t.id ? `✅ صارت من عاداتك — يا ${v('بطل', 'بطلة')}!` : `${v('ضيف', 'ضيفي')} هذي العادة`}
                </button>
              </>
            ) : (
              <LockButton t={t} />
            )}
          </div>
        );
      })}

      {/* ===== ميزانية ===== */}
      {tab === 'budget' && BUDGET_TEMPLATES.map((t) => {
        const unlocked = isUnlocked(t.id);
        return (
          <div className="card" key={t.id}>
            <div className="tpl-head">
              <span className="tpl-emoji">{unlocked ? t.emoji : '🔒'}</span>
              <div>
                <div className="tpl-title">{t.title}</div>
                <div className="tpl-desc">{t.desc}</div>
              </div>
            </div>
            {unlocked ? (
              <>
                <ul className="tpl-steps">
                  {Object.entries(t.budgets).map(([cat, amt]) => <li key={cat}>{cat}: {amt} ﷼</li>)}
                </ul>
                <button className={applied === t.id ? 'btn-primary done' : 'btn-primary'} style={{ width: '100%' }}
                  disabled={applied === t.id} onClick={() => apply(t)}>
                  {applied === t.id ? '✅ ضبطنا ميزانيتك — تمام!' : `${v('طبّق', 'طبّقي')} هذه الميزانية`}
                </button>
              </>
            ) : (
              <LockButton t={t} />
            )}
          </div>
        );
      })}
    </div>
  );
}
