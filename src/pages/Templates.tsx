/* ===================================================================
   Templates.tsx — قوالب احترافية جاهزة (أهداف/روتين/تحديات/ميزانية).
   تُطبَّق عبر core.applyTemplate بضغطة واحدة.
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../core/useCore';
import BackButton from '../components/BackButton';
import {
  GOAL_TEMPLATES, ROUTINE_TEMPLATES, CHALLENGE_TEMPLATES, BUDGET_TEMPLATES,
  type AnyTemplate,
} from '../data/templates';

type Tab = 'goal' | 'routine' | 'challenge' | 'budget';

export default function Templates() {
  const core = useCore();
  const [tab, setTab] = useState<Tab>('goal');
  const [applied, setApplied] = useState<string | null>(null);

  const apply = (t: AnyTemplate) => {
    core.applyTemplate(t);
    setApplied(t.id);
    setTimeout(() => setApplied((cur) => (cur === t.id ? null : cur)), 2500);
  };

  return (
    <div className="page">
      <BackButton />
      <h1 className="section-title">🎁 قوالب جاهزة</h1>
      <div className="intro-card">
        💊 الجرعة المحفزة: ما تدري وش تكتب؟ ابدأ من قالب جاهز — بضغطة وحدة يتعبّى لك كل شي، وعدّله زي ما تبي.
      </div>

      <div className="subtabs">
        {(['goal', 'routine', 'challenge', 'budget'] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? 'subtab active' : 'subtab'} onClick={() => setTab(t)}>
            {t === 'goal' ? '🎯 أهداف' : t === 'routine' ? '☀️ روتين' : t === 'challenge' ? '🔥 تحديات' : '💰 ميزانية'}
          </button>
        ))}
      </div>

      {/* ===== أهداف ===== */}
      {tab === 'goal' && GOAL_TEMPLATES.map((t) => (
        <div className="card" key={t.id}>
          <div className="tpl-head">
            <span className="tpl-emoji">{t.emoji}</span>
            <div>
              <div className="tpl-title">{t.title}</div>
              <div className="tpl-desc">{t.desc} · {t.category} · ~{t.days} يوم</div>
            </div>
          </div>
          <ul className="tpl-steps">
            {t.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
          <button className={applied === t.id ? 'btn-primary done' : 'btn-primary'} style={{ width: '100%' }}
            disabled={applied === t.id} onClick={() => apply(t)}>
            {applied === t.id ? '✅ تمت الإضافة لأهدافك' : 'استخدم هذا القالب'}
          </button>
        </div>
      ))}

      {/* ===== روتين ===== */}
      {tab === 'routine' && ROUTINE_TEMPLATES.map((t) => (
        <div className="card" key={t.id}>
          <div className="tpl-head">
            <span className="tpl-emoji">{t.emoji}</span>
            <div>
              <div className="tpl-title">{t.title} {t.popular && <span className="tpl-badge">⭐ مقترح</span>}</div>
              <div className="tpl-desc">{t.desc}</div>
            </div>
          </div>
          <ul className="tpl-steps">
            {t.morning.map((s, i) => <li key={'m' + i}>🌅 {s}</li>)}
            {t.evening.map((s, i) => <li key={'e' + i}>🌙 {s}</li>)}
          </ul>
          <button className={applied === t.id ? 'btn-primary done' : 'btn-primary'} style={{ width: '100%' }}
            disabled={applied === t.id} onClick={() => apply(t)}>
            {applied === t.id ? '✅ أُضيف لروتينك' : 'استخدم هذا الروتين'}
          </button>
        </div>
      ))}

      {/* ===== تحديات ===== */}
      {tab === 'challenge' && CHALLENGE_TEMPLATES.map((t) => (
        <div className="card" key={t.id}>
          <div className="tpl-head">
            <span className="tpl-emoji">{t.emoji}</span>
            <div>
              <div className="tpl-title">{t.title}</div>
              <div className="tpl-desc">{t.desc} · {t.days} يوم</div>
            </div>
          </div>
          <ul className="tpl-steps">
            {(t.morning ?? []).map((s, i) => <li key={'m' + i}>🌅 {s}</li>)}
            {(t.evening ?? []).map((s, i) => <li key={'e' + i}>🌙 {s}</li>)}
          </ul>
          <button className={applied === t.id ? 'btn-primary done' : 'btn-primary'} style={{ width: '100%' }}
            disabled={applied === t.id} onClick={() => apply(t)}>
            {applied === t.id ? '✅ بدأ التحدّي — بالتوفيق!' : 'ابدأ التحدّي'}
          </button>
        </div>
      ))}

      {/* ===== ميزانية ===== */}
      {tab === 'budget' && BUDGET_TEMPLATES.map((t) => (
        <div className="card" key={t.id}>
          <div className="tpl-head">
            <span className="tpl-emoji">{t.emoji}</span>
            <div>
              <div className="tpl-title">{t.title}</div>
              <div className="tpl-desc">{t.desc}</div>
            </div>
          </div>
          <ul className="tpl-steps">
            {Object.entries(t.budgets).map(([cat, amt]) => <li key={cat}>{cat}: {amt} ﷼</li>)}
          </ul>
          <button className={applied === t.id ? 'btn-primary done' : 'btn-primary'} style={{ width: '100%' }}
            disabled={applied === t.id} onClick={() => apply(t)}>
            {applied === t.id ? '✅ طُبّقت ميزانيتك' : 'طبّق هذه الميزانية'}
          </button>
        </div>
      ))}
    </div>
  );
}
