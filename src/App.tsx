/* ===================================================================
   App.tsx — جذر التطبيق والتوجيه (wouter).
   الصفحات الفعلية تُضاف لاحقاً صفحة-صفحة وفق منهجية العمل.
   =================================================================== */

import { Route, Switch, useLocation } from 'wouter';
import BottomNav from './components/BottomNav';
import XPBar from './components/XPBar';
import Confetti from './components/Confetti';
import { useCore } from './core/useCore';
import Routine from './pages/Routine';
import Goals from './pages/Goals';

/* صفحة ترحيب مؤقتة للتأكد من ربط النواة — تُستبدل بالصفحات الفعلية */
function HomePlaceholder() {
  const { state } = useCore();
  const [, navigate] = useLocation();
  const greeting = state.profile.nickname || 'بكل خير';
  return (
    <div className="page">
      <XPBar />
      <div className="card">
        <h1 className="section-title">مفكرة النجاح</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          أهلاً {greeting} 👋 — البنية التحتية جاهزة (النواة المركزية، الهوية
          البصرية، المكوّنات المشتركة). الصفحات الفعلية تُضاف صفحة-صفحة وفق
          منهجية العمل المعتمدة.
        </p>
        <button
          className="btn-primary"
          style={{ marginTop: 12 }}
          onClick={() => navigate('/routine')}
        >
          ☀️ الروتين الصباحي/المسائي
        </button>
      </div>
    </div>
  );
}

/* صفحة مؤقتة عامة لبقية المسارات حتى بنائها */
function ComingSoon() {
  return (
    <div className="page">
      <XPBar />
      <div className="card">
        <p style={{ color: 'var(--text-secondary)' }}>
          هذا القسم قيد البناء — سيُضاف في مرحلته وفق ترتيب العمل.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePlaceholder} />
        <Route path="/routine" component={Routine} />
        <Route path="/goals" component={Goals} />
        <Route component={ComingSoon} />
      </Switch>
      <BottomNav />
      <Confetti />
    </>
  );
}
