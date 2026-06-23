/* ===================================================================
   App.tsx — جذر التطبيق والتوجيه (wouter).
   الصفحات الفعلية تُضاف لاحقاً صفحة-صفحة وفق منهجية العمل.
   =================================================================== */

import { Route, Switch } from 'wouter';
import BottomNav from './components/BottomNav';
import Confetti from './components/Confetti';
import { useCore } from './core/useCore';
import Login from './pages/Login';
import Home from './pages/Home';
import Hub from './pages/Hub';
import Routine from './pages/Routine';
import Goals from './pages/Goals';
import CustomWorkout from './pages/CustomWorkout';
import Mood from './pages/Mood';
import NotesGratitude from './pages/NotesGratitude';
import QuranCalendar from './pages/QuranCalendar';
import Streak from './pages/Streak';
import SleepRelations from './pages/SleepRelations';
import WheelReview from './pages/WheelReview';
import Identity from './pages/Identity';
import JourneyGallery from './pages/JourneyGallery';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Guidelines from './pages/Guidelines';
import Pledges from './pages/Pledges';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import CaptainWorkout from './pages/CaptainWorkout';
import Meals from './pages/Meals';

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

  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/more" component={Hub} />
        <Route path="/routine" component={Routine} />
        <Route path="/goals" component={Goals} />
        <Route path="/custom-workout" component={CustomWorkout} />
        <Route path="/mood" component={Mood} />
        <Route path="/notes" component={NotesGratitude} />
        <Route path="/quran" component={QuranCalendar} />
        <Route path="/streak" component={Streak} />
        <Route path="/sleep" component={SleepRelations} />
        <Route path="/wheel" component={WheelReview} />
        <Route path="/identity" component={Identity} />
        <Route path="/gallery" component={JourneyGallery} />
        <Route path="/settings" component={Settings} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/guidelines" component={Guidelines} />
        <Route path="/pledges" component={Pledges} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/captain-workout" component={CaptainWorkout} />
        <Route path="/meals" component={Meals} />
        <Route component={NotFound} />
      </Switch>
      <BottomNav />
      <Confetti />
    </>
  );
}
