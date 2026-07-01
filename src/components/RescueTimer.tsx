/* ===================================================================
   RescueTimer.tsx — «صندوق الفزعة»: زر عائم يكسر حاجز الكسل.
   يفتح شاشة "جاك المدد" بثلاث خيارات: تلميح ذهني + مؤقت 5 دقايق حقيقي،
   تفكيك تلقائي لأثقل مهمة اليوم لثلاث خطوات صغيرة، أو هبدة تحفيزية.
   =================================================================== */

import { useState, useEffect } from 'react';
import { useCore, todayStr, type RoutineSection } from '../core/useCore';
import { useWorkoutTimer } from '../core/useWorkoutTimer';
import {
  RESCUE_MESSAGE, RESCUE_DONE_MESSAGE, RESCUE_MIND_TIP, RESCUE_HYPE_LINE,
  RESCUE_SPLIT_DONE, RESCUE_SPLIT_EMPTY, RESCUE_SPLIT_STEPS,
} from '../data/vibes';
import { fireConfetti } from './Confetti';

const RESCUE_SECONDS = 5 * 60;
type Screen = 'menu' | 'mind' | 'split' | 'hype' | null;

export default function RescueTimer() {
  const core = useCore();
  const [screen, setScreen] = useState<Screen>(null);
  const [splitMsg, setSplitMsg] = useState('');
  const [done, setDone] = useState(false);
  const timer = useWorkoutTimer();
  const remaining = Math.max(0, RESCUE_SECONDS - timer.seconds);

  useEffect(() => {
    if (timer.running && remaining === 0) {
      timer.stop();
      timer.reset();
      setDone(true);
      fireConfetti();
    }
  }, [timer.running, remaining, timer]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  const startRescue = () => {
    setScreen(null);
    timer.reset();
    timer.start();
  };

  /* المهمة ثقيلة على قلبي — تفكيك أثقل مهمة غير منجزة اليوم لثلاث خطوات صغيرة */
  const splitHeaviestTask = () => {
    const today = todayStr();
    const sections: RoutineSection[] = ['morning', 'evening'];
    const candidates = sections.flatMap((section) =>
      core.state.routine[section]
        .filter((t) => t.doneDate !== today)
        .map((t) => ({ ...t, section })),
    );
    if (candidates.length === 0) {
      setSplitMsg(RESCUE_SPLIT_EMPTY);
      return;
    }
    const target = candidates.find((t) => t.priority === 'high') ?? candidates[0];
    RESCUE_SPLIT_STEPS.forEach((step) => core.addSubTask(target.section, target.id, step));
    setSplitMsg(`قسّمنا لك «${target.text}» لثلاث خطوات صغيرة تحت الروتين ${target.section === 'morning' ? 'الصباحي' : 'المسائي'}. ${RESCUE_SPLIT_DONE}`);
  };

  if (timer.running) {
    return (
      <button className="rescue-fab running" onClick={() => { timer.stop(); timer.reset(); }} aria-label="إيقاف فزعة 5 دقايق">
        ⏳ {mm}:{ss}
      </button>
    );
  }

  return (
    <>
      <button className="rescue-fab" aria-label="صندوق الفزعة" onClick={() => setScreen('menu')}>
        🆘
      </button>

      {screen === 'menu' && (
        <div className="popup-overlay" onClick={() => setScreen(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-title">🆘 جاك المَدد.. وش السالفة؟</div>
            <button className="btn-primary welcome-cta" onClick={() => setScreen('mind')}>🧠 مخي مقفل</button>
            <button className="btn-primary welcome-cta" style={{ marginTop: 8 }} onClick={() => { splitHeaviestTask(); setScreen('split'); }}>
              😩 المهمة ثقيلة على قلبي
            </button>
            <button className="btn-primary welcome-cta" style={{ marginTop: 8 }} onClick={() => setScreen('hype')}>🔥 أبي هبدة تحفيزية</button>
            <button className="btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setScreen(null)}>
              ليس الآن
            </button>
          </div>
        </div>
      )}

      {screen === 'mind' && (
        <div className="popup-overlay" onClick={() => setScreen(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-title">🧠 مخي مقفل</div>
            <div className="popup-body">{RESCUE_MIND_TIP}</div>
            <div className="popup-body">{RESCUE_MESSAGE}</div>
            <button className="btn-primary welcome-cta" onClick={startRescue}>يلا 5 دقايق 🔥</button>
            <button className="btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setScreen(null)}>
              خلاص كفاية
            </button>
          </div>
        </div>
      )}

      {screen === 'split' && (
        <div className="popup-overlay" onClick={() => setScreen(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-title">😩 قسّمناها لك</div>
            <div className="popup-body">{splitMsg}</div>
            <button className="btn-primary welcome-cta" onClick={() => setScreen(null)}>تمام</button>
          </div>
        </div>
      )}

      {screen === 'hype' && (
        <div className="popup-overlay" onClick={() => setScreen(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-title">🔥 هبدة تحفيزية</div>
            <div className="popup-body">{RESCUE_HYPE_LINE}</div>
            <button className="btn-primary welcome-cta" onClick={() => setScreen(null)}>قدها 💪</button>
          </div>
        </div>
      )}

      {done && (
        <div className="popup-overlay" onClick={() => setDone(false)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-title">🎉 خلصت الفزعة!</div>
            <div className="popup-body">{RESCUE_DONE_MESSAGE}</div>
            <button className="btn-primary welcome-cta" onClick={() => setDone(false)}>تمام</button>
          </div>
        </div>
      )}
    </>
  );
}
