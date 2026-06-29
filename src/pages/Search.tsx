/* ===================================================================
   Search.tsx — بحث شامل في كل بياناتك (محلي، لحظي).
   يغطي: الأهداف، الملاحظات، الامتنان، المصاريف، المناسبات،
   الروتين، العهود. كل نتيجة تنقلك لصفحتها.
   =================================================================== */

import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useCore } from '../core/useCore';
import BackButton from '../components/BackButton';

interface Result {
  type: string;
  emoji: string;
  text: string;
  to: string;
}

export default function Search() {
  const { state: s } = useCore();
  const [, navigate] = useLocation();
  const [q, setQ] = useState('');

  const all = useMemo<Result[]>(() => {
    const r: Result[] = [];
    s.goals.forEach((g) => {
      r.push({ type: 'هدف', emoji: '🎯', text: g.title + ' ' + g.category + ' ' + g.steps.map((x) => x.text).join(' '), to: '/goals' });
    });
    [...s.routine.morning, ...s.routine.evening].forEach((t) => r.push({ type: 'روتين', emoji: '☀️', text: t.text, to: '/routine' }));
    s.notes.forEach((n) => r.push({ type: 'ملاحظة', emoji: '📝', text: n.text, to: '/notes' }));
    s.gratitudeLog.forEach((g) => r.push({ type: 'امتنان', emoji: '🙏', text: g.text, to: '/notes' }));
    s.expenses.forEach((e) => r.push({ type: 'مصروف', emoji: '💰', text: `${e.desc} ${e.category} ${e.notes} ${e.amount}`, to: '/expenses' }));
    s.occasions.forEach((o) => r.push({ type: 'مناسبة', emoji: '🎉', text: `${o.personName} ${o.occasionName} ${o.giftIdeas} ${o.notes}`, to: '/occasions' }));
    s.pledges.forEach((p) => r.push({ type: 'عهد', emoji: '🛡️', text: p.habit, to: '/pledges' }));
    return r;
  }, [s]);

  const query = q.trim();
  const results = query.length >= 2
    ? all.filter((x) => x.text.includes(query)).slice(0, 50)
    : [];

  return (
    <div className="page">
      <BackButton to="/" />
      <h1 className="section-title">🔍 بحث شامل</h1>

      <input
        className="input-field"
        placeholder="دوّر في أهدافك، ملاحظاتك، مصاريفك..."
        value={q}
        autoFocus
        onChange={(e) => setQ(e.target.value)}
      />

      {query.length >= 2 && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '12px 2px' }}>
          {results.length === 0 ? 'ما لقيت شي — جرّب كلمة ثانية' : `${results.length} نتيجة`}
        </div>
      )}

      {results.map((r, i) => (
        <button key={i} className="search-result" onClick={() => navigate(r.to)}>
          <span className="search-result-emoji">{r.emoji}</span>
          <span className="search-result-body">
            <span className="search-result-type">{r.type}</span>
            <span className="search-result-text">{r.text.slice(0, 80)}</span>
          </span>
          <span className="search-result-arrow">←</span>
        </button>
      ))}

      {query.length < 2 && (
        <div className="intro-card" style={{ marginTop: 16 }}>
          💡 اكتب حرفين على الأقل — البحث يشمل كل شي: أهدافك، روتينك، ملاحظاتك، امتنانك، مصاريفك، مناسباتك، وعهودك.
        </div>
      )}
    </div>
  );
}
