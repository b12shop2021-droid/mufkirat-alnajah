/* ===================================================================
   App.tsx — جذر التطبيق والتوجيه (wouter).
   الصفحات الفعلية تُضاف لاحقاً صفحة-صفحة وفق منهجية العمل.
   =================================================================== */

import { lazy, Suspense } from 'react';
import { Route, Switch } from 'wouter';
import BottomNav from './components/BottomNav';
import Confetti from './components/Confetti';
import { useCore } from './core/useCore';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';

/* تحميل كسول للصفحات: كل صفحة تُحمّل عند فتحها فقط (أخف وأسرع) */
const Hub = lazy(() => import('./pages/Hub'));
const Routine = lazy(() => import('./pages/Routine'));
const Goals = lazy(() => import('./pages/Goals'));
const Mood = lazy(() => import('./pages/Mood'));
const NotesGratitude = lazy(() => import('./pages/NotesGratitude'));
const QuranCalendar = lazy(() => import('./pages/QuranCalendar'));
const SleepRelations = lazy(() => import('./pages/SleepRelations'));
const Settings = lazy(() => import('./pages/Settings'));
const Pledges = lazy(() => import('./pages/Pledges'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Meals = lazy(() => import('./pages/Meals'));
const Workouts = lazy(() => import('./pages/Workouts'));
const Achievements = lazy(() => import('./pages/Achievements'));
const SelfDev = lazy(() => import('./pages/SelfDev'));

/* مؤشر تحميل بسيط بين الصفحات */
function Loader() {
  return (
    <div className="page" style={{ textAlign: 'center', color: 'var(--text-secondary)', paddingTop: 60 }}>
      ⏳ لحظة...
    </div>
  );
}

/* صفحة عامة لأي مسار غير معروف */
function NotFound() {
  return (
    <div className="page">
      <div className="card">
        <p style={{ color: 'var(--text-secondary)' }}>الصفحة غير موجودة.</p>
      </div>
    </div>
  );
}

export default function App() {
  const { state } = useCore();

  /* بوابة المصادقة: بدون تسجيل دخول تُعرض صفحة الدخول فقط */
  if (!state.session.loggedIn) {
    return (
      <>
        <Login />
        <Confetti />
      </>
    );
  }

  /* شاشة الترحيب الأولى بعد أول تسجيل دخول */
  if (!state.onboarded) {
    return (
      <>
        <Onboarding />
        <Confetti />
      </>
    );
  }

  return (
    <>
      <Suspense fallback={<Loader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/more" component={Hub} />
        <Route path="/routine" component={Routine} />
        <Route path="/goals" component={Goals} />
        <Route path="/mood" component={Mood} />
        <Route path="/notes" component={NotesGratitude} />
        <Route path="/quran" component={QuranCalendar} />
        <Route path="/sleep" component={SleepRelations} />
        <Route path="/settings" component={Settings} />
        <Route path="/pledges" component={Pledges} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/meals" component={Meals} />
        <Route path="/workouts" component={Workouts} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/self-dev" component={SelfDev} />
        <Route component={NotFound} />
      </Switch>
      </Suspense>
      <BottomNav />
      <Confetti />
    </>
  );
}
