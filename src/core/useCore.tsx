/* ===================================================================
   useCore.tsx — النواة المركزية الموحّدة لكل التطبيق
   مصدر بيانات واحد: XP، الملف الشخصي، السلسلة، الثيم، الوضع الليلي.
   نمط Observer عبر React Context: أي تغيير يحدّث كل الواجهات فوراً.
   =================================================================== */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { fireConfetti } from '../components/Confetti';

/* ===== الأنواع المشتركة ===== */

export type Gender = 'male' | 'female';
export type AccentName = 'emerald' | 'ocean' | 'violet' | 'rose' | 'amber';

export interface Profile {
  name: string;
  nickname: string; // لقب المناداة (يا بطل / يا كابتن)
  gender: Gender; // لتخصيص صيغة الخطاب (أحسنت/أحسنتِ)
  age: number;
  job: string;
  height: number; // مستقل تماماً — لا ربط حسابي (BMI)
  weight: number; // مستقل تماماً — لا ربط حسابي (BMI)
}

export interface Streak {
  current: number;
  longest: number;
  lastDoneDate: string; // YYYY-MM-DD
  freezeMonth: string; // 'YYYY-MM' آخر شهر استُخدمت فيه بطاقة الحماية
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  note: string;
}

export interface WorkoutLog {
  date: string; // YYYY-MM-DD
  durationSec: number;
  doneIds: string[];
}

export interface ShoppingItem {
  id: string;
  text: string;
  bought: boolean;
}

export interface RecurringItem {
  id: string;
  text: string;
}

export type Priority = 'high' | 'med' | 'low';

export interface SubTask {
  id: string;
  text: string;
  doneDate: string; // YYYY-MM-DD لآخر يوم أُنجزت فيه
}

export interface RoutineTask {
  id: string;
  text: string;
  priority: Priority;
  doneDate: string; // YYYY-MM-DD لآخر يوم أُنجزت فيه
  subtasks: SubTask[];
}

export type RoutineSection = 'morning' | 'evening';

export interface CoreState {
  profile: Profile;
  xp: number;
  streak: Streak;
  accent: AccentName; // اسم الثيم (لا اللون المباشر)
  dark: boolean;
  countedMemorizedJuz: number[]; // أجزاء حُسبت +50 لمنع التكرار
  routine: { morning: RoutineTask[]; evening: RoutineTask[] };
}

/* ===== المستويات السبعة (المرجع الوحيد) ===== */
export const LEVELS = [
  'مبتدئ 🌱',
  'متعلم 📚',
  'منضبط ⚡',
  'مثابر 💪',
  'محترف 🎯',
  'متميز 🌟',
  'بطل النجاح 🏆',
] as const;

const STORAGE_KEY = 'mufkirat_core_v1';
const MAX_LEN = 200;

/* تنظيف أي مدخل نصي: قص + توحيد المسافات + حد أقصى 200 حرف (ضد XSS والإدخال المفرط) */
export const clean = (t: string): string =>
  t.trim().replace(/\s+/g, ' ').slice(0, MAX_LEN);

/* حصر رقم ضمن حدود منطقية (يمنع السالب والقيم الشاذة) */
export const clampNum = (n: number, min: number, max: number): number => {
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
};

/* تاريخ اليوم بصيغة YYYY-MM-DD آمنة للمنطقة الزمنية المحلية */
export const todayStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
};

/* تاريخ الأمس بصيغة YYYY-MM-DD آمن للمنطقة الزمنية */
const yesterdayStr = (): string => {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(
    y.getDate(),
  ).padStart(2, '0')}`;
};

/* مفتاح الشهر الحالي 'YYYY-MM' لتتبع بطاقة الحماية الشهرية */
const monthStr = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

/* الحالة الافتراضية — صفر ألوان ثابتة، فقط اسم الثيم */
const DEFAULT_STATE: CoreState = {
  profile: {
    name: '',
    nickname: '',
    gender: 'male',
    age: 0,
    job: '',
    height: 0,
    weight: 0,
  },
  xp: 0,
  streak: { current: 0, longest: 0, lastDoneDate: '', freezeMonth: '' },
  accent: 'emerald',
  dark: false,
  countedMemorizedJuz: [],
  routine: { morning: [], evening: [] },
};

/* قراءة الحالة المحفوظة من localStorage مع دمج آمن مع الافتراضي */
const loadState = (): CoreState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<CoreState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      profile: { ...DEFAULT_STATE.profile, ...parsed.profile },
      streak: { ...DEFAULT_STATE.streak, ...parsed.streak },
      countedMemorizedJuz: parsed.countedMemorizedJuz ?? [],
      routine: {
        morning: parsed.routine?.morning ?? [],
        evening: parsed.routine?.evening ?? [],
      },
    };
  } catch {
    return DEFAULT_STATE;
  }
};

/* ===== سياق النواة ===== */
interface CoreContextValue {
  state: CoreState;
  level: number; // 0..6
  levelName: string;
  progress: number; // 0..100 تقدّم داخل المستوى الحالي
  addXP: (amount: number) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  markStreakToday: () => void;
  setAccent: (accent: AccentName) => void;
  toggleDark: () => void;
  markMemorizedJuz: (juz: number) => boolean; // true إذا احتُسبت لأول مرة
  // ===== الروتين =====
  addRoutineTask: (section: RoutineSection, text: string) => void;
  editRoutineText: (section: RoutineSection, id: string, text: string) => void;
  cyclePriority: (section: RoutineSection, id: string) => void;
  toggleRoutineDone: (section: RoutineSection, id: string) => void;
  removeRoutineTask: (section: RoutineSection, id: string) => void;
  addSubTask: (section: RoutineSection, taskId: string, text: string) => void;
  editSubText: (section: RoutineSection, taskId: string, subId: string, text: string) => void;
  toggleSubDone: (section: RoutineSection, taskId: string, subId: string) => void;
  removeSubTask: (section: RoutineSection, taskId: string, subId: string) => void;
}

const CoreContext = createContext<CoreContextValue | null>(null);

export function CoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CoreState>(loadState);

  /* حفظ أي تغيير في الحالة تلقائياً */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* تجاهل امتلاء التخزين بصمت */
    }
  }, [state]);

  /* تطبيق الثيم والوضع الليلي على عنصر <html> فوراً */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', state.accent);
    root.setAttribute('data-dark', String(state.dark));
  }, [state.accent, state.dark]);

  /* المستوى: كل 100 نقطة = مستوى، بحد أقصى 7 مستويات */
  const level = useMemo(
    () => Math.min(Math.floor(state.xp / 100), LEVELS.length - 1),
    [state.xp],
  );

  /* اسم المستوى الحالي */
  const levelName = useMemo(() => LEVELS[level], [level]);

  /* التقدّم داخل المستوى الحالي (0..100) */
  const progress = useMemo(() => {
    if (level >= LEVELS.length - 1) return 100;
    return state.xp % 100;
  }, [state.xp, level]);

  /* إضافة نقاط — موحّدة كـ useCallback (المرجع الوحيد لكل الصفحات) */
  const addXP = useCallback((amount: number) => {
    const safe = clampNum(Math.round(amount), 0, 10000);
    if (safe === 0) return;
    setState((s) => ({ ...s, xp: s.xp + safe }));
  }, []);

  /* تحديث الملف الشخصي مع تنظيف النصوص وحصر الأرقام */
  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => {
      const next: Profile = { ...s.profile };
      if (patch.name !== undefined) next.name = clean(patch.name);
      if (patch.nickname !== undefined) next.nickname = clean(patch.nickname);
      if (patch.job !== undefined) next.job = clean(patch.job);
      if (patch.gender !== undefined) next.gender = patch.gender;
      if (patch.age !== undefined) next.age = clampNum(patch.age, 0, 120);
      if (patch.height !== undefined) next.height = clampNum(patch.height, 0, 300);
      if (patch.weight !== undefined) next.weight = clampNum(patch.weight, 0, 500);
      return { ...s, profile: next };
    });
  }, []);

  /* تسجيل إنجاز اليوم في السلسلة مع منطق آمن للمنطقة الزمنية
     + بطاقة الحماية الشهرية (يوم الصفر المسموح) عند تفويت يوم واحد */
  const markStreakToday = useCallback(() => {
    setState((s) => {
      const today = todayStr();
      if (s.streak.lastDoneDate === today) return s; // سُجّل اليوم مسبقاً

      const yesterday = yesterdayStr();
      let current = s.streak.current;
      let freezeMonth = s.streak.freezeMonth;

      if (s.streak.lastDoneDate === yesterday || s.streak.lastDoneDate === '') {
        current += 1; // متواصل
      } else {
        // فُوّت يوم أو أكثر — حاول استخدام بطاقة الحماية الشهرية
        const thisMonth = monthStr();
        const missedOneDay = (() => {
          if (!s.streak.lastDoneDate) return false;
          const last = new Date(s.streak.lastDoneDate + 'T00:00:00');
          const now = new Date(today + 'T00:00:00');
          const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000);
          return diffDays === 2; // يوم واحد فقط مفقود بينهما
        })();

        if (missedOneDay && freezeMonth !== thisMonth) {
          freezeMonth = thisMonth; // جمّد السلسلة دون كسرها
          current += 1;
        } else {
          current = 1; // إعادة البدء
        }
      }

      const longest = Math.max(s.streak.longest, current);
      return {
        ...s,
        streak: { current, longest, lastDoneDate: today, freezeMonth },
      };
    });
  }, []);

  /* تغيير الثيم (يُحفظ بالاسم) */
  const setAccent = useCallback((accent: AccentName) => {
    setState((s) => ({ ...s, accent }));
  }, []);

  /* تبديل الوضع الليلي */
  const toggleDark = useCallback(() => {
    setState((s) => ({ ...s, dark: !s.dark }));
  }, []);

  /* احتساب حفظ جزء قرآن مرة واحدة فقط (+50 لا تتكرر) */
  const markMemorizedJuz = useCallback((juz: number): boolean => {
    let counted = false;
    setState((s) => {
      if (s.countedMemorizedJuz.includes(juz)) return s;
      counted = true;
      return { ...s, countedMemorizedJuz: [...s.countedMemorizedJuz, juz] };
    });
    return counted;
  }, []);

  /* تعديل قائمة قسم روتين معيّن بدالة محوِّلة (يمنع تكرار منطق الوصول للقسم) */
  const updateSection = useCallback(
    (section: RoutineSection, fn: (list: RoutineTask[]) => RoutineTask[]) => {
      setState((s) => ({
        ...s,
        routine: { ...s.routine, [section]: fn(s.routine[section]) },
      }));
    },
    [],
  );

  /* إضافة مهمة روتين دائمة (لا تُحذف يومياً) */
  const addRoutineTask = useCallback(
    (section: RoutineSection, text: string) => {
      const t = clean(text);
      if (!t) return;
      updateSection(section, (list) => [
        ...list,
        { id: crypto.randomUUID(), text: t, priority: 'med', doneDate: '', subtasks: [] },
      ]);
    },
    [updateSection],
  );

  /* تعديل نص مهمة بالضغط المباشر */
  const editRoutineText = useCallback(
    (section: RoutineSection, id: string, text: string) => {
      const t = clean(text);
      if (!t) return;
      updateSection(section, (list) =>
        list.map((task) => (task.id === id ? { ...task, text: t } : task)),
      );
    },
    [updateSection],
  );

  /* تدوير الأولوية: متوسطة → عالية → منخفضة → متوسطة */
  const cyclePriority = useCallback(
    (section: RoutineSection, id: string) => {
      const next: Record<Priority, Priority> = { med: 'high', high: 'low', low: 'med' };
      updateSection(section, (list) =>
        list.map((task) =>
          task.id === id ? { ...task, priority: next[task.priority] } : task,
        ),
      );
    },
    [updateSection],
  );

  /* تبديل حالة "تم اليوم" لمهمة + احتساب +5 مرة واحدة عند الإنجاز + احتفال إذا اكتمل القسم */
  const toggleRoutineDone = useCallback(
    (section: RoutineSection, id: string) => {
      const today = todayStr();
      let earned = false;
      setState((s) => {
        const list = s.routine[section];
        const nextList = list.map((task) => {
          if (task.id !== id) return task;
          const wasDone = task.doneDate === today;
          if (!wasDone) earned = true;
          return { ...task, doneDate: wasDone ? '' : today };
        });
        const allDone =
          nextList.length > 0 && nextList.every((t) => t.doneDate === today);
        if (earned && allDone) fireConfetti();
        return { ...s, routine: { ...s.routine, [section]: nextList } };
      });
      if (earned) {
        addXP(5);
        markStreakToday();
      }
    },
    [addXP, markStreakToday],
  );

  /* حذف مهمة روتين نهائياً (يمرّ عبر ConfirmDialog في الواجهة) */
  const removeRoutineTask = useCallback(
    (section: RoutineSection, id: string) => {
      updateSection(section, (list) => list.filter((task) => task.id !== id));
    },
    [updateSection],
  );

  /* إضافة مهمة فرعية تحت مهمة */
  const addSubTask = useCallback(
    (section: RoutineSection, taskId: string, text: string) => {
      const t = clean(text);
      if (!t) return;
      updateSection(section, (list) =>
        list.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: [
                  ...task.subtasks,
                  { id: crypto.randomUUID(), text: t, doneDate: '' },
                ],
              }
            : task,
        ),
      );
    },
    [updateSection],
  );

  /* تعديل نص مهمة فرعية */
  const editSubText = useCallback(
    (section: RoutineSection, taskId: string, subId: string, text: string) => {
      const t = clean(text);
      if (!t) return;
      updateSection(section, (list) =>
        list.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.map((sub) =>
                  sub.id === subId ? { ...sub, text: t } : sub,
                ),
              }
            : task,
        ),
      );
    },
    [updateSection],
  );

  /* تبديل "تم اليوم" لمهمة فرعية + احتساب +3 مرة واحدة عند الإنجاز */
  const toggleSubDone = useCallback(
    (section: RoutineSection, taskId: string, subId: string) => {
      const today = todayStr();
      let earned = false;
      updateSection(section, (list) =>
        list.map((task) => {
          if (task.id !== taskId) return task;
          return {
            ...task,
            subtasks: task.subtasks.map((sub) => {
              if (sub.id !== subId) return sub;
              const wasDone = sub.doneDate === today;
              if (!wasDone) earned = true;
              return { ...sub, doneDate: wasDone ? '' : today };
            }),
          };
        }),
      );
      if (earned) addXP(3);
    },
    [updateSection, addXP],
  );

  /* حذف مهمة فرعية (يمرّ عبر ConfirmDialog في الواجهة) */
  const removeSubTask = useCallback(
    (section: RoutineSection, taskId: string, subId: string) => {
      updateSection(section, (list) =>
        list.map((task) =>
          task.id === taskId
            ? { ...task, subtasks: task.subtasks.filter((sub) => sub.id !== subId) }
            : task,
        ),
      );
    },
    [updateSection],
  );

  const value = useMemo<CoreContextValue>(
    () => ({
      state,
      level,
      levelName,
      progress,
      addXP,
      updateProfile,
      markStreakToday,
      setAccent,
      toggleDark,
      markMemorizedJuz,
      addRoutineTask,
      editRoutineText,
      cyclePriority,
      toggleRoutineDone,
      removeRoutineTask,
      addSubTask,
      editSubText,
      toggleSubDone,
      removeSubTask,
    }),
    [
      state,
      level,
      levelName,
      progress,
      addXP,
      updateProfile,
      markStreakToday,
      setAccent,
      toggleDark,
      markMemorizedJuz,
      addRoutineTask,
      editRoutineText,
      cyclePriority,
      toggleRoutineDone,
      removeRoutineTask,
      addSubTask,
      editSubText,
      toggleSubDone,
      removeSubTask,
    ],
  );

  return <CoreContext.Provider value={value}>{children}</CoreContext.Provider>;
}

/* hook الوصول للنواة — يُستخدم في كل صفحة بدل أي حالة مستقلة */
export function useCore(): CoreContextValue {
  const ctx = useContext(CoreContext);
  if (!ctx) throw new Error('useCore يجب استخدامه داخل <CoreProvider>');
  return ctx;
}
