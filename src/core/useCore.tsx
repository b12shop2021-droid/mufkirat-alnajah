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

export interface GoalStep {
  id: string;
  text: string;
  done: boolean;
}

export interface Goal {
  id: string;
  title: string;
  steps: GoalStep[];
  completed: boolean;
  createdDate: string; // YYYY-MM-DD
}

export type Difficulty = 'سهل' | 'متوسط' | 'متقدم';

export interface CustomExercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // نطاق نصي مثل "8-12"
  difficulty: Difficulty;
  notes: string;
}

export interface CustomDay {
  id: string;
  name: string;
  image: string | null; // dataURL اختياري
  exercises: CustomExercise[];
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  moodIdx: number; // فهرس ضمن قائمة المزاج (0..7)
  energy: number; // 1..10
}

export interface PrideEntry {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
}

export interface NoteEntry {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD
}

export interface GratitudeEntry {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD (حد 3 يومياً)
}

export type QuranStatus = 'read' | 'mem';

export interface QuranMinutesEntry {
  date: string; // YYYY-MM-DD
  minutes: number;
}

export interface SleepEntry {
  date: string; // YYYY-MM-DD
  hours: number;
}

export interface Relation {
  id: string;
  name: string;
  contacted: boolean;
}

export interface WeeklyReview {
  id: string;
  date: string; // YYYY-MM-DD
  success: string;
  challenge: string;
  next: string;
}

export interface CoreState {
  profile: Profile;
  xp: number;
  streak: Streak;
  accent: AccentName; // اسم الثيم (لا اللون المباشر)
  dark: boolean;
  countedMemorizedJuz: number[]; // أجزاء حُسبت +50 لمنع التكرار
  countedReadJuz: number[]; // أجزاء حُسبت +20 لمنع التكرار
  quranJuz: Record<number, QuranStatus>; // حالة كل جزء
  quranMinutes: QuranMinutesEntry[]; // دقائق التلاوة اليومية
  routine: { morning: RoutineTask[]; evening: RoutineTask[] };
  goals: Goal[];
  customWorkout: CustomDay[];
  moodLog: MoodEntry[];
  prideArchive: PrideEntry[];
  notes: NoteEntry[];
  gratitudeLog: GratitudeEntry[];
  sleepLog: SleepEntry[];
  relations: Relation[];
  wheelAreas: number[]; // 8 قيم (1..10) لمجالات عجلة الحياة
  wheelLastMonth: string; // 'YYYY-MM' لمنع تكرار +25 شهرياً
  weeklyReviews: WeeklyReview[];
  identityStatement: string; // "أنا شخص ..."
  constitution: RecurringItem[]; // دستور الذات (حد 5 قواعد)
  notifMaster: boolean; // مفتاح الإشعارات العام
  notifItems: NotifItem[]; // تفضيلات أنواع التذكيرات (واجهة فقط)
  guidelinesImage: string | null; // صورة يوم الأرجل التوضيحية (اختيارية)
}

export interface NotifItem {
  id: string;
  enabled: boolean;
  time: string; // 'HH:MM' أو وصف تلقائي
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
  countedReadJuz: [],
  quranJuz: {},
  quranMinutes: [],
  routine: { morning: [], evening: [] },
  goals: [],
  customWorkout: [],
  moodLog: [],
  prideArchive: [],
  notes: [],
  gratitudeLog: [],
  sleepLog: [],
  relations: [],
  wheelAreas: [5, 5, 5, 5, 5, 5, 5, 5],
  wheelLastMonth: '',
  weeklyReviews: [],
  identityStatement: '',
  constitution: [],
  notifMaster: true,
  notifItems: [
    { id: 'morning', enabled: true, time: '07:00' },
    { id: 'evening', enabled: true, time: '21:30' },
    { id: 'meal', enabled: true, time: 'تلقائي' },
    { id: 'water', enabled: false, time: 'كل 3 ساعات' },
    { id: 'gratitude', enabled: true, time: '20:00' },
    { id: 'streak', enabled: true, time: '23:00' },
  ],
  guidelinesImage: null,
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
      countedReadJuz: parsed.countedReadJuz ?? [],
      quranJuz: parsed.quranJuz ?? {},
      quranMinutes: parsed.quranMinutes ?? [],
      routine: {
        morning: parsed.routine?.morning ?? [],
        evening: parsed.routine?.evening ?? [],
      },
      goals: parsed.goals ?? [],
      customWorkout: parsed.customWorkout ?? [],
      moodLog: parsed.moodLog ?? [],
      prideArchive: parsed.prideArchive ?? [],
      notes: parsed.notes ?? [],
      gratitudeLog: parsed.gratitudeLog ?? [],
      sleepLog: parsed.sleepLog ?? [],
      relations: parsed.relations ?? [],
      wheelAreas: parsed.wheelAreas ?? [5, 5, 5, 5, 5, 5, 5, 5],
      wheelLastMonth: parsed.wheelLastMonth ?? '',
      weeklyReviews: parsed.weeklyReviews ?? [],
      identityStatement: parsed.identityStatement ?? '',
      constitution: parsed.constitution ?? [],
      notifMaster: parsed.notifMaster ?? true,
      notifItems: parsed.notifItems ?? DEFAULT_STATE.notifItems,
      guidelinesImage: parsed.guidelinesImage ?? null,
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
  // ===== الأهداف =====
  addGoal: (title: string) => void;
  editGoalTitle: (goalId: string, title: string) => void;
  removeGoal: (goalId: string) => void;
  addGoalStep: (goalId: string, text: string) => void;
  editGoalStep: (goalId: string, stepId: string, text: string) => void;
  toggleGoalStep: (goalId: string, stepId: string) => void;
  removeGoalStep: (goalId: string, stepId: string) => void;
  // ===== الجدول المخصص =====
  addCustomDay: () => void;
  renameCustomDay: (dayId: string, name: string) => void;
  removeCustomDay: (dayId: string) => void;
  setCustomDayImage: (dayId: string, image: string | null) => void;
  addCustomExercise: (dayId: string) => void;
  updateCustomExercise: (
    dayId: string,
    exId: string,
    patch: Partial<Omit<CustomExercise, 'id'>>,
  ) => void;
  removeCustomExercise: (dayId: string, exId: string) => void;
  // ===== المزاج والفخر =====
  saveMood: (moodIdx: number, energy: number) => void;
  addPride: (text: string) => void;
  removePride: (id: string) => void;
  // ===== ملاحظات وشكر =====
  addNote: (text: string) => void;
  removeNote: (id: string) => void;
  addGratitude: (text: string) => boolean; // false إذا اكتمل حد اليوم (3)
  removeGratitude: (id: string) => void;
  // ===== القرآن =====
  cycleJuz: (juz: number) => void; // فارغ→مقروء(+20)→محفوظ(+50)→فارغ
  addQuranMinutes: (minutes: number) => void; // +10 وتجميع دقائق اليوم
  // ===== النوم والعلاقات =====
  saveSleep: (sleepTime: string, wakeTime: string) => number; // يعيد عدد الساعات
  addRelation: (name: string) => void;
  toggleRelation: (id: string) => void;
  removeRelation: (id: string) => void;
  // ===== عجلة الحياة + مراجعة الأسبوع =====
  setWheelArea: (index: number, value: number) => void;
  saveWheel: () => void; // +25 مرة شهرياً
  addWeeklyReview: (success: string, challenge: string, next: string) => void; // +20
  removeWeeklyReview: (id: string) => void;
  // ===== الهوية + الدستور =====
  setIdentity: (text: string) => void;
  addConstRule: (text: string) => boolean; // false إذا اكتمل الحد (5)
  removeConstRule: (id: string) => void;
  // ===== الإشعارات (واجهة فقط) =====
  setNotifMaster: (on: boolean) => void;
  toggleNotif: (id: string) => void;
  setNotifTime: (id: string, time: string) => void;
  setGuidelinesImage: (image: string | null) => void;
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

  /* تعديل قائمة الأهداف بدالة محوِّلة (يمنع تكرار منطق الوصول) */
  const updateGoals = useCallback(
    (fn: (list: Goal[]) => Goal[]) => {
      setState((s) => ({ ...s, goals: fn(s.goals) }));
    },
    [],
  );

  /* إضافة هدف جديد */
  const addGoal = useCallback(
    (title: string) => {
      const t = clean(title);
      if (!t) return;
      updateGoals((list) => [
        ...list,
        {
          id: crypto.randomUUID(),
          title: t,
          steps: [],
          completed: false,
          createdDate: todayStr(),
        },
      ]);
    },
    [updateGoals],
  );

  /* تعديل عنوان هدف */
  const editGoalTitle = useCallback(
    (goalId: string, title: string) => {
      const t = clean(title);
      if (!t) return;
      updateGoals((list) =>
        list.map((g) => (g.id === goalId ? { ...g, title: t } : g)),
      );
    },
    [updateGoals],
  );

  /* حذف هدف (يمرّ عبر ConfirmDialog) */
  const removeGoal = useCallback(
    (goalId: string) => {
      updateGoals((list) => list.filter((g) => g.id !== goalId));
    },
    [updateGoals],
  );

  /* إضافة خطوة (مهمة فرعية) لهدف */
  const addGoalStep = useCallback(
    (goalId: string, text: string) => {
      const t = clean(text);
      if (!t) return;
      updateGoals((list) =>
        list.map((g) =>
          g.id === goalId
            ? {
                ...g,
                steps: [
                  ...g.steps,
                  { id: crypto.randomUUID(), text: t, done: false },
                ],
              }
            : g,
        ),
      );
    },
    [updateGoals],
  );

  /* تعديل نص خطوة */
  const editGoalStep = useCallback(
    (goalId: string, stepId: string, text: string) => {
      const t = clean(text);
      if (!t) return;
      updateGoals((list) =>
        list.map((g) =>
          g.id === goalId
            ? {
                ...g,
                steps: g.steps.map((st) =>
                  st.id === stepId ? { ...st, text: t } : st,
                ),
              }
            : g,
        ),
      );
    },
    [updateGoals],
  );

  /* تبديل إنجاز خطوة + احتساب +3 عند الإنجاز + إكمال الهدف تلقائياً (+25 واحتفال) */
  const toggleGoalStep = useCallback(
    (goalId: string, stepId: string) => {
      let earnedStep = false;
      let goalJustCompleted = false;
      updateGoals((list) =>
        list.map((g) => {
          if (g.id !== goalId) return g;
          const steps = g.steps.map((st) => {
            if (st.id !== stepId) return st;
            if (!st.done) earnedStep = true;
            return { ...st, done: !st.done };
          });
          const allDone = steps.length > 0 && steps.every((st) => st.done);
          let completed = g.completed;
          if (allDone && !g.completed) {
            completed = true; // يُقفل عند الاكتمال لمنع تكرار +25
            goalJustCompleted = true;
          }
          return { ...g, steps, completed };
        }),
      );
      if (earnedStep) addXP(3);
      if (goalJustCompleted) {
        addXP(25);
        fireConfetti();
      }
    },
    [updateGoals, addXP],
  );

  /* حذف خطوة من هدف */
  const removeGoalStep = useCallback(
    (goalId: string, stepId: string) => {
      updateGoals((list) =>
        list.map((g) =>
          g.id === goalId
            ? { ...g, steps: g.steps.filter((st) => st.id !== stepId) }
            : g,
        ),
      );
    },
    [updateGoals],
  );

  /* تعديل قائمة أيام الجدول المخصص بدالة محوِّلة (يمنع تكرار منطق الوصول) */
  const updateCustom = useCallback(
    (fn: (list: CustomDay[]) => CustomDay[]) => {
      setState((s) => ({ ...s, customWorkout: fn(s.customWorkout) }));
    },
    [],
  );

  /* إضافة يوم تمرين مخصص جديد */
  const addCustomDay = useCallback(() => {
    updateCustom((list) => [
      ...list,
      {
        id: crypto.randomUUID(),
        name: clean(`يوم تمرين ${list.length + 1}`),
        image: null,
        exercises: [],
      },
    ]);
  }, [updateCustom]);

  /* إعادة تسمية يوم */
  const renameCustomDay = useCallback(
    (dayId: string, name: string) => {
      const t = clean(name);
      updateCustom((list) =>
        list.map((d) => (d.id === dayId ? { ...d, name: t } : d)),
      );
    },
    [updateCustom],
  );

  /* حذف يوم (يمرّ عبر ConfirmDialog) */
  const removeCustomDay = useCallback(
    (dayId: string) => {
      updateCustom((list) => list.filter((d) => d.id !== dayId));
    },
    [updateCustom],
  );

  /* تعيين/إزالة صورة اليوم */
  const setCustomDayImage = useCallback(
    (dayId: string, image: string | null) => {
      updateCustom((list) =>
        list.map((d) => (d.id === dayId ? { ...d, image } : d)),
      );
    },
    [updateCustom],
  );

  /* إضافة تمرين فارغ ليوم */
  const addCustomExercise = useCallback(
    (dayId: string) => {
      updateCustom((list) =>
        list.map((d) =>
          d.id === dayId
            ? {
                ...d,
                exercises: [
                  ...d.exercises,
                  {
                    id: crypto.randomUUID(),
                    name: '',
                    sets: 0,
                    reps: '',
                    difficulty: 'متوسط',
                    notes: '',
                  },
                ],
              }
            : d,
        ),
      );
    },
    [updateCustom],
  );

  /* تحديث حقول تمرين مع تنظيف النصوص وحصر الأرقام */
  const updateCustomExercise = useCallback(
    (dayId: string, exId: string, patch: Partial<Omit<CustomExercise, 'id'>>) => {
      updateCustom((list) =>
        list.map((d) => {
          if (d.id !== dayId) return d;
          return {
            ...d,
            exercises: d.exercises.map((ex) => {
              if (ex.id !== exId) return ex;
              const next: CustomExercise = { ...ex };
              if (patch.name !== undefined) next.name = clean(patch.name);
              if (patch.reps !== undefined) next.reps = clean(patch.reps);
              if (patch.notes !== undefined) next.notes = clean(patch.notes);
              if (patch.difficulty !== undefined) next.difficulty = patch.difficulty;
              if (patch.sets !== undefined) next.sets = clampNum(patch.sets, 0, 100);
              return next;
            }),
          };
        }),
      );
    },
    [updateCustom],
  );

  /* حذف تمرين من يوم */
  const removeCustomExercise = useCallback(
    (dayId: string, exId: string) => {
      updateCustom((list) =>
        list.map((d) =>
          d.id === dayId
            ? { ...d, exercises: d.exercises.filter((ex) => ex.id !== exId) }
            : d,
        ),
      );
    },
    [updateCustom],
  );

  /* حفظ مزاج اليوم وطاقته: تحديث سجل اليوم + احتساب +5 مرة واحدة يومياً */
  const saveMood = useCallback(
    (moodIdx: number, energy: number) => {
      const today = todayStr();
      const idx = clampNum(moodIdx, 0, 7);
      const en = clampNum(Math.round(energy), 1, 10);
      let firstToday = false;
      setState((s) => {
        const existing = s.moodLog.find((m) => m.date === today);
        if (!existing) firstToday = true;
        const others = s.moodLog.filter((m) => m.date !== today);
        return {
          ...s,
          moodLog: [...others, { date: today, moodIdx: idx, energy: en }],
        };
      });
      if (firstToday) addXP(5);
    },
    [addXP],
  );

  /* إضافة لحظة فخر للأرشيف + احتساب +5 */
  const addPride = useCallback(
    (text: string) => {
      const t = clean(text);
      if (!t) return;
      setState((s) => ({
        ...s,
        prideArchive: [
          { id: crypto.randomUUID(), text: t, date: todayStr() },
          ...s.prideArchive,
        ],
      }));
      addXP(5);
    },
    [addXP],
  );

  /* حذف لحظة فخر (يمرّ عبر ConfirmDialog) */
  const removePride = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      prideArchive: s.prideArchive.filter((p) => p.id !== id),
    }));
  }, []);

  /* إضافة ملاحظة سريعة + احتساب +5 */
  const addNote = useCallback(
    (text: string) => {
      const t = clean(text);
      if (!t) return;
      setState((s) => ({
        ...s,
        notes: [{ id: crypto.randomUUID(), text: t, date: todayStr() }, ...s.notes],
      }));
      addXP(5);
    },
    [addXP],
  );

  /* حذف ملاحظة (يمرّ عبر ConfirmDialog) */
  const removeNote = useCallback((id: string) => {
    setState((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
  }, []);

  /* إضافة شكر مع فرض حد 3 يومياً + احتساب +5 (يعيد false إذا اكتمل الحد) */
  const addGratitude = useCallback(
    (text: string): boolean => {
      const t = clean(text);
      if (!t) return false;
      const today = todayStr();
      let added = false;
      setState((s) => {
        const todayCount = s.gratitudeLog.filter((g) => g.date === today).length;
        if (todayCount >= 3) return s;
        added = true;
        return {
          ...s,
          gratitudeLog: [
            ...s.gratitudeLog,
            { id: crypto.randomUUID(), text: t, date: today },
          ],
        };
      });
      if (added) addXP(5);
      return added;
    },
    [addXP],
  );

  /* حذف شكر (يمرّ عبر ConfirmDialog) */
  const removeGratitude = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      gratitudeLog: s.gratitudeLog.filter((g) => g.id !== id),
    }));
  }, []);

  /* تدوير حالة جزء قرآن: فارغ→مقروء(+20)→محفوظ(+50 واحتفال)→فارغ
     مع منع تكرار النقاط عبر مصفوفات الاحتساب */
  const cycleJuz = useCallback(
    (juz: number) => {
      const j = clampNum(juz, 1, 30);
      let awardRead = false;
      let awardMem = false;
      setState((s) => {
        const cur = s.quranJuz[j];
        const nextJuz = { ...s.quranJuz };
        let countedRead = s.countedReadJuz;
        let countedMem = s.countedMemorizedJuz;
        if (!cur) {
          nextJuz[j] = 'read';
          if (!countedRead.includes(j)) {
            countedRead = [...countedRead, j];
            awardRead = true;
          }
        } else if (cur === 'read') {
          nextJuz[j] = 'mem';
          if (!countedMem.includes(j)) {
            countedMem = [...countedMem, j];
            awardMem = true;
          }
        } else {
          delete nextJuz[j];
        }
        return {
          ...s,
          quranJuz: nextJuz,
          countedReadJuz: countedRead,
          countedMemorizedJuz: countedMem,
        };
      });
      if (awardRead) addXP(20);
      if (awardMem) {
        addXP(50);
        fireConfetti();
      }
    },
    [addXP],
  );

  /* تسجيل دقائق تلاوة اليوم (تجميع) + احتساب +10 */
  const addQuranMinutes = useCallback(
    (minutes: number) => {
      const min = clampNum(Math.round(minutes), 1, 1440);
      const today = todayStr();
      setState((s) => {
        const existing = s.quranMinutes.find((q) => q.date === today);
        const others = s.quranMinutes.filter((q) => q.date !== today);
        const total = (existing?.minutes ?? 0) + min;
        return {
          ...s,
          quranMinutes: [...others, { date: today, minutes: total }],
        };
      });
      addXP(10);
    },
    [addXP],
  );

  /* حفظ نوم الليلة: حساب الساعات مع معالجة عبور منتصف الليل + احتساب +5 */
  const saveSleep = useCallback(
    (sleepTime: string, wakeTime: string): number => {
      const [sh, sm] = sleepTime.split(':').map(Number);
      const [wh, wm] = wakeTime.split(':').map(Number);
      if ([sh, sm, wh, wm].some((n) => Number.isNaN(n))) return 0;
      let sleepMin = sh * 60 + sm;
      let wakeMin = wh * 60 + wm;
      if (wakeMin <= sleepMin) wakeMin += 24 * 60; // عبور منتصف الليل
      const hours = Math.round(((wakeMin - sleepMin) / 60) * 10) / 10;
      const today = todayStr();
      setState((s) => {
        const others = s.sleepLog.filter((e) => e.date !== today);
        return { ...s, sleepLog: [...others, { date: today, hours }] };
      });
      addXP(5);
      return hours;
    },
    [addXP],
  );

  /* إضافة شخص لدائرة العلاقات */
  const addRelation = useCallback((name: string) => {
    const t = clean(name);
    if (!t) return;
    setState((s) => ({
      ...s,
      relations: [...s.relations, { id: crypto.randomUUID(), name: t, contacted: false }],
    }));
  }, []);

  /* تبديل حالة التواصل + احتساب +5 عند تأكيد التواصل */
  const toggleRelation = useCallback(
    (id: string) => {
      let nowContacted = false;
      setState((s) => ({
        ...s,
        relations: s.relations.map((r) => {
          if (r.id !== id) return r;
          nowContacted = !r.contacted;
          return { ...r, contacted: !r.contacted };
        }),
      }));
      if (nowContacted) addXP(5);
    },
    [addXP],
  );

  /* حذف شخص (يمرّ عبر ConfirmDialog) */
  const removeRelation = useCallback((id: string) => {
    setState((s) => ({ ...s, relations: s.relations.filter((r) => r.id !== id) }));
  }, []);

  /* تعديل قيمة مجال في عجلة الحياة (1..10) */
  const setWheelArea = useCallback((index: number, value: number) => {
    const v = clampNum(Math.round(value), 1, 10);
    setState((s) => {
      const next = [...s.wheelAreas];
      if (index >= 0 && index < next.length) next[index] = v;
      return { ...s, wheelAreas: next };
    });
  }, []);

  /* حفظ تقييم العجلة: +25 مرة واحدة شهرياً (يمنع التكرار) */
  const saveWheel = useCallback(() => {
    const month = monthStr();
    let award = false;
    setState((s) => {
      if (s.wheelLastMonth === month) return s;
      award = true;
      return { ...s, wheelLastMonth: month };
    });
    if (award) {
      addXP(25);
      fireConfetti();
    }
  }, [addXP]);

  /* إضافة مراجعة أسبوعية للأرشيف + احتساب +20 */
  const addWeeklyReview = useCallback(
    (success: string, challenge: string, next: string) => {
      const s1 = clean(success);
      const s2 = clean(challenge);
      const s3 = clean(next);
      if (!s1 && !s2 && !s3) return;
      setState((s) => ({
        ...s,
        weeklyReviews: [
          {
            id: crypto.randomUUID(),
            date: todayStr(),
            success: s1,
            challenge: s2,
            next: s3,
          },
          ...s.weeklyReviews,
        ],
      }));
      addXP(20);
    },
    [addXP],
  );

  /* حذف مراجعة (يمرّ عبر ConfirmDialog) */
  const removeWeeklyReview = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      weeklyReviews: s.weeklyReviews.filter((r) => r.id !== id),
    }));
  }, []);

  /* حفظ جملة بطاقة الهوية */
  const setIdentity = useCallback((text: string) => {
    setState((s) => ({ ...s, identityStatement: clean(text) }));
  }, []);

  /* إضافة قاعدة للدستور بحد أقصى 5 (يعيد false إذا اكتمل) */
  const addConstRule = useCallback((text: string): boolean => {
    const t = clean(text);
    if (!t) return false;
    let added = false;
    setState((s) => {
      if (s.constitution.length >= 5) return s;
      added = true;
      return {
        ...s,
        constitution: [...s.constitution, { id: crypto.randomUUID(), text: t }],
      };
    });
    return added;
  }, []);

  /* حذف قاعدة من الدستور (يمرّ عبر ConfirmDialog) */
  const removeConstRule = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      constitution: s.constitution.filter((r) => r.id !== id),
    }));
  }, []);

  /* تفعيل/إيقاف الإشعارات العام */
  const setNotifMaster = useCallback((on: boolean) => {
    setState((s) => ({ ...s, notifMaster: on }));
  }, []);

  /* تبديل تفعيل نوع تذكير */
  const toggleNotif = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      notifItems: s.notifItems.map((n) =>
        n.id === id ? { ...n, enabled: !n.enabled } : n,
      ),
    }));
  }, []);

  /* ضبط وقت تذكير (HH:MM) */
  const setNotifTime = useCallback((id: string, time: string) => {
    setState((s) => ({
      ...s,
      notifItems: s.notifItems.map((n) => (n.id === id ? { ...n, time } : n)),
    }));
  }, []);

  /* تعيين/إزالة صورة الإرشادات */
  const setGuidelinesImage = useCallback((image: string | null) => {
    setState((s) => ({ ...s, guidelinesImage: image }));
  }, []);

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
      addGoal,
      editGoalTitle,
      removeGoal,
      addGoalStep,
      editGoalStep,
      toggleGoalStep,
      removeGoalStep,
      addCustomDay,
      renameCustomDay,
      removeCustomDay,
      setCustomDayImage,
      addCustomExercise,
      updateCustomExercise,
      removeCustomExercise,
      saveMood,
      addPride,
      removePride,
      addNote,
      removeNote,
      addGratitude,
      removeGratitude,
      cycleJuz,
      addQuranMinutes,
      saveSleep,
      addRelation,
      toggleRelation,
      removeRelation,
      setWheelArea,
      saveWheel,
      addWeeklyReview,
      removeWeeklyReview,
      setIdentity,
      addConstRule,
      removeConstRule,
      setNotifMaster,
      toggleNotif,
      setNotifTime,
      setGuidelinesImage,
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
      addGoal,
      editGoalTitle,
      removeGoal,
      addGoalStep,
      editGoalStep,
      toggleGoalStep,
      removeGoalStep,
      addCustomDay,
      renameCustomDay,
      removeCustomDay,
      setCustomDayImage,
      addCustomExercise,
      updateCustomExercise,
      removeCustomExercise,
      saveMood,
      addPride,
      removePride,
      addNote,
      removeNote,
      addGratitude,
      removeGratitude,
      cycleJuz,
      addQuranMinutes,
      saveSleep,
      addRelation,
      toggleRelation,
      removeRelation,
      setWheelArea,
      saveWheel,
      addWeeklyReview,
      removeWeeklyReview,
      setIdentity,
      addConstRule,
      removeConstRule,
      setNotifMaster,
      toggleNotif,
      setNotifTime,
      setGuidelinesImage,
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
