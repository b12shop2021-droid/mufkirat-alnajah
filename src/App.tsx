/* ===================================================================
   App.tsx — جذر التطبيق والتوجيه (wouter).
   الصفحات الفعلية تُضاف لاحقاً صفحة-صفحة وفق منهجية العمل.
   =================================================================== */

import { lazy, Suspense, useEffect, useState } from 'react';
import { Route, Switch } from 'wouter';
import BottomNav from './components/BottomNav';
import Confetti from './components/Confetti';
import XPToast from './components/XPToast';
import ErrorBoundary from './components/ErrorBoundary';
import StorageBanner from './components/StorageBanner';
import { useCore } from './core/useCore';
import { isPinEnabled, isSessionUnlocked } from './core/pinUtils';
import { scheduleNotifications, schedulePrayerNotifications } from './core/notificationScheduler';
import { pickLoadingPhrase } from './data/vibes';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import PinLock from './pages/PinLock';

/* تحميل كسول للصفحات: كل صفحة تُحمّل عند فتحها فقط (أخف وأسرع) */
const Hub = lazy(() => import('./pages/Hub'));
const Routine = lazy(() => import('./pages/Routine'));
const Goals = lazy(() => import('./pages/Goals'));
const Mood = lazy(() => import('./pages/Mood'));
const NotesGratitude = lazy(() => import('./pages/NotesGratitude'));
const QuranCalendar = lazy(() => import('./pages/QuranCalendar'));
const Settings = lazy(() => import('./pages/Settings'));
const Pledges = lazy(() => import('./pages/Pledges'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Meals = lazy(() => import('./pages/Meals'));
const Workouts = lazy(() => import('./pages/Workouts'));
const Achievements = lazy(() => import('./pages/Achievements'));
const SelfDev = lazy(() => import('./pages/SelfDev'));
const Pomodoro = lazy(() => import('./pages/Pomodoro'));
const Occasions = lazy(() => import('./pages/Occasions'));
const Templates = lazy(() => import('./pages/Templates'));
const Search = lazy(() => import('./pages/Search'));
const RewardShop = lazy(() => import('./pages/RewardShop'));

/* مؤشر تحميل بسيط بين الصفحات */
function Loader() {
  return (
    <div className="page" style={{ textAlign: 'center', color: 'var(--text-secondary)', paddingTop: 60 }}>
      {pickLoadingPhrase()}
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
  const [pinUnlocked, setPinUnlocked] = useState(isSessionUnlocked);

  /* إعادة جدولة تذكيرات اليوم عند كل فتح للتطبيق (إذا كان الإذن ممنوحاً) —
     لأن جدولة الـSW عبر setTimeout تنتهي بإغلاق التطبيق، فنعيد تسليحها كل جلسة */
  useEffect(() => {
    if (!state.session.loggedIn || !state.onboarded) return;
    if (state.notifMaster) {
      /* تذكير ذكي: لا نُرسل تنبيه السلسلة إذا أُنجز نشاط اليوم فعلاً */
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const activeToday = state.streak.lastDoneDate === todayStr;
      const items = activeToday
        ? state.notifItems.filter((i) => i.id !== 'streak')
        : state.notifItems;
      void scheduleNotifications({ masterEnabled: true, items });
    }
    if (state.prayerNotif) void schedulePrayerNotifications(state.prayerCoords);
  }, [state.session.loggedIn, state.onboarded, state.notifMaster, state.notifItems, state.prayerNotif, state.prayerCoords, state.streak.lastDoneDate]);

  /* بوابة المصادقة: بدون تسجيل دخول تُعرض صفحة الدخول فقط */
  if (!state.session.loggedIn) {
    return (
      <>
        <Login />
        <Confetti />
        <XPToast />
      </>
    );
  }

  /* شاشة الترحيب الأولى بعد أول تسجيل دخول */
  if (!state.onboarded) {
    return (
      <>
        <Onboarding />
        <Confetti />
        <XPToast />
      </>
    );
  }

  /* بوابة PIN: تظهر مرة واحدة لكل جلسة إذا كان القفل مفعّلاً */
  if (isPinEnabled() && !pinUnlocked) {
    return <PinLock onUnlock={() => setPinUnlocked(true)} />;
  }

  return (
    <>
      <StorageBanner />
      <ErrorBoundary>
      <Suspense fallback={<Loader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/more" component={Hub} />
        <Route path="/routine" component={Routine} />
        <Route path="/goals" component={Goals} />
        <Route path="/mood" component={Mood} />
        <Route path="/notes" component={NotesGratitude} />
        <Route path="/quran" component={QuranCalendar} />
        <Route path="/settings" component={Settings} />
        <Route path="/pledges" component={Pledges} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/meals" component={Meals} />
        <Route path="/workouts" component={Workouts} />
        <Route path="/achievements" component={Achievements} />
        <Route path="/self-dev" component={SelfDev} />
        <Route path="/pomodoro">{() => <Pomodoro />}</Route>
        <Route path="/occasions">{() => <Occasions />}</Route>
        <Route path="/templates" component={Templates} />
        <Route path="/rewards" component={RewardShop} />
        <Route path="/search" component={Search} />
        <Route component={NotFound} />
      </Switch>
      </Suspense>
      </ErrorBoundary>
      <BottomNav />
      <Confetti />
      <XPToast />
    </>
  );
}
