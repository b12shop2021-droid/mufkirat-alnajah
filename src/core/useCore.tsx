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
  dayId: string; // معرّف اليوم (push_a ...)
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
  pledges: Pledge[];
  timeCapsule: TimeCapsule | null;
  futureLetters: FutureLetter[];
  expenses: ExpenseEntry[];
  customCategories: CustomCategory[];
  budgets: Record<string, number>; // اسم الفئة → السقف الشهري
  workoutPRs: Record<string, number>; // مفتاح التمرين → أعلى وزن
  workoutImages: Record<string, string>; // مفتاح التمرين → صورة
  completedExercises: string[]; // مفاتيح التمارين المكتملة
  workoutLogs: WorkoutLog[];
  meals: MealEntry[];
  favoriteMeals: FavoriteMeal[];
  waterLog: WaterEntry[];
  calorieGoal: number;
}

export interface NotifItem {
  id: string;
  enabled: boolean;
  time: string; // 'HH:MM' أو وصف تلقائي
}

export type MealType = 'إفطار' | 'غداء' | 'عشاء' | 'وجبة خفيفة';

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: MealType;
  name: string;
  ingredients: string;
  calories: number;
  notes: string;
}

export interface FavoriteMeal {
  id: string;
  type: MealType;
  name: string;
  ingredients: string;
  calories: number;
}

export interface WaterEntry {
  date: string; // YYYY-MM-DD
  cups: number; // 0..8
}

export type ExpenseType = 'income' | 'expense';

export interface ExpenseEntry {
  id: string;
  type: ExpenseType;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
  payment: string;
  desc: string;
  notes: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  note: string;
}

export interface Pledge {
  id: string;
  habit: string;
  startDate: string; // YYYY-MM-DD لبداية العهد الحالي
  bestDays: number; // أطول مدة التزام
  resets: number; // عدد مرات إعادة البدء (سجل صامت)
}

export interface TimeCapsule {
  message: string;
  lockDate: string; // YYYY-MM-DD وقت الإغلاق (تُفتح بعد 30 يوماً)
}

export interface FutureLetter {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
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
  pledges: [],
  timeCapsule: null,
  futureLetters: [],
  expenses: [],
  customCategories: [],
  budgets: {
    طعام: 800,
    نقل: 400,
    تسوق: 300,
    فواتير: 500,
    صحة: 200,
    أخرى: 150,
    'صندوق الخير': 0,
  },
  workoutPRs: {},
  workoutImages: {},
  completedExercises: [],
  workoutLogs: [],
  meals: [],
  favoriteMeals: [],
  waterLog: [],
  calorieGoal: 2000,
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
      pledges: parsed.pledges ?? [],
      timeCapsule: parsed.timeCapsule ?? null,
      futureLetters: parsed.futureLetters ?? [],
      expenses: parsed.expenses ?? [],
      customCategories: parsed.customCategories ?? [],
      budgets: parsed.budgets ?? DEFAULT_STATE.budgets,
      workoutPRs: parsed.workoutPRs ?? {},
      workoutImages: parsed.workoutImages ?? {},
      completedExercises: parsed.completedExercises ?? [],
      workoutLogs: parsed.workoutLogs ?? [],
      meals: parsed.meals ?? [],
      favoriteMeals: parsed.favoriteMeals ?? [],
      waterLog: parsed.waterLog ?? [],
      calorieGoal: parsed.calorieGoal ?? 2000,
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
  // ===== العهود + صندوق الزمن + رسائل المستقبل =====
  addPledge: (habit: string) => void;
  resetPledge: (id: string) => void; // إعادة بدء دون عقاب
  removePledge: (id: string) => void;
  lockCapsule: (message: string) => void;
  addFutureLetter: (text: string) => void;
  // ===== المصاريف =====
  addExpense: (entry: Omit<ExpenseEntry, 'id'>) => void;
  removeExpense: (id: string) => void;
  addCustomCategory: (name: string, icon: string, note: string) => boolean;
  removeCustomCategory: (id: string, name: string) => void;
  setBudget: (category: string, amount: number) => void;
  // ===== جدول الكابتن سعود =====
  toggleExerciseDone: (key: string) => void; // +15 عند الإكمال
  setWorkoutImage: (key: string, image: string) => void;
  recordPR: (key: string, weight: number) => boolean; // true إذا رقم شخصي جديد
  logWorkoutDay: (dayId: string, durationSec: number, doneIds: string[]) => void; // +10 إضافية
  // ===== الوجبات =====
  addMeal: (entry: Omit<MealEntry, 'id'>, saveFavorite: boolean) => void;
  removeMeal: (id: string) => void;
  removeFavorite: (id: string) => void;
  setWaterCups: (cups: number) => void; // لليوم الحالي
  setCalorieGoal: (goal: number) => void;
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

  /* عدد الأيام منذ تاريخ معيّن (YYYY-MM-DD) */
  const daysSinceDate = (dateStr: string): number => {
    const start = new Date(dateStr + 'T00:00:00').getTime();
    const now = new Date(todayStr() + 'T00:00:00').getTime();
    return Math.max(0, Math.round((now - start) / 86400000));
  };

  /* إضافة عهد جديد (يبدأ العداد اليوم) */
  const addPledge = useCallback((habit: string) => {
    const t = clean(habit);
    if (!t) return;
    setState((s) => ({
      ...s,
      pledges: [
        ...s.pledges,
        { id: crypto.randomUUID(), habit: t, startDate: todayStr(), bestDays: 0, resets: 0 },
      ],
    }));
  }, []);

  /* إعادة بدء عهد بعد انكسار — دون عقاب، تحديث أطول مدة وعدد المرات */
  const resetPledge = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      pledges: s.pledges.map((p) => {
        if (p.id !== id) return p;
        const days = daysSinceDate(p.startDate);
        return {
          ...p,
          bestDays: Math.max(p.bestDays, days),
          resets: p.resets + 1,
          startDate: todayStr(),
        };
      }),
    }));
  }, []);

  /* حذف عهد (يمرّ عبر ConfirmDialog) */
  const removePledge = useCallback((id: string) => {
    setState((s) => ({ ...s, pledges: s.pledges.filter((p) => p.id !== id) }));
  }, []);

  /* إغلاق كبسولة زمنية لـ30 يوماً */
  const lockCapsule = useCallback((message: string) => {
    const t = clean(message);
    if (!t) return;
    setState((s) => ({ ...s, timeCapsule: { message: t, lockDate: todayStr() } }));
  }, []);

  /* إضافة رسالة مستقبلية للأرشيف */
  const addFutureLetter = useCallback((text: string) => {
    const t = clean(text);
    if (!t) return;
    setState((s) => ({
      ...s,
      futureLetters: [
        { id: crypto.randomUUID(), date: todayStr(), text: t },
        ...s.futureLetters,
      ],
    }));
  }, []);

  /* إضافة حركة مالية (دخل/مصروف) مع تنظيف وحصر القيم */
  const addExpense = useCallback((entry: Omit<ExpenseEntry, 'id'>) => {
    setState((s) => ({
      ...s,
      expenses: [
        ...s.expenses,
        {
          id: crypto.randomUUID(),
          type: entry.type,
          amount: clampNum(entry.amount, 0, 1_000_000_000),
          date: entry.date || todayStr(),
          category: clean(entry.category),
          payment: clean(entry.payment),
          desc: clean(entry.desc),
          notes: clean(entry.notes),
        },
      ],
    }));
  }, []);

  /* حذف حركة مالية (يمرّ عبر ConfirmDialog) */
  const removeExpense = useCallback((id: string) => {
    setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
  }, []);

  /* إضافة فئة مخصصة بإيموجي حر + ملاحظة (يعيد false إذا الاسم مكرر/فارغ) */
  const addCustomCategory = useCallback(
    (name: string, icon: string, note: string): boolean => {
      const nm = clean(name);
      if (!nm) return false;
      let added = false;
      setState((s) => {
        const exists =
          s.customCategories.some((c) => c.name === nm) || nm in s.budgets;
        if (exists) return s;
        added = true;
        return {
          ...s,
          customCategories: [
            ...s.customCategories,
            { id: crypto.randomUUID(), name: nm, icon: clean(icon) || '🏷️', note: clean(note) },
          ],
          budgets: { ...s.budgets, [nm]: 200 },
        };
      });
      return added;
    },
    [],
  );

  /* حذف فئة مخصصة (الفئات الأساسية محمية في الواجهة) */
  const removeCustomCategory = useCallback((id: string, name: string) => {
    setState((s) => {
      const { [name]: _omit, ...restBudgets } = s.budgets;
      return {
        ...s,
        customCategories: s.customCategories.filter((c) => c.id !== id),
        budgets: restBudgets,
      };
    });
  }, []);

  /* ضبط سقف ميزانية فئة */
  const setBudget = useCallback((category: string, amount: number) => {
    setState((s) => ({
      ...s,
      budgets: { ...s.budgets, [category]: clampNum(amount, 0, 1_000_000_000) },
    }));
  }, []);

  /* تبديل إكمال تمرين + احتساب +15 مرة عند الإكمال */
  const toggleExerciseDone = useCallback(
    (key: string) => {
      let earned = false;
      setState((s) => {
        const done = s.completedExercises.includes(key);
        if (done) {
          return { ...s, completedExercises: s.completedExercises.filter((k) => k !== key) };
        }
        earned = true;
        return { ...s, completedExercises: [...s.completedExercises, key] };
      });
      if (earned) addXP(15);
    },
    [addXP],
  );

  /* حفظ صورة تمرين */
  const setWorkoutImage = useCallback((key: string, image: string) => {
    setState((s) => ({ ...s, workoutImages: { ...s.workoutImages, [key]: image } }));
  }, []);

  /* تسجيل رقم شخصي إذا تجاوز الأعلى السابق */
  const recordPR = useCallback((key: string, weight: number): boolean => {
    const w = clampNum(weight, 0, 100000);
    if (w <= 0) return false;
    let isPR = false;
    setState((s) => {
      const prev = s.workoutPRs[key] ?? 0;
      if (w > prev) {
        isPR = true;
        return { ...s, workoutPRs: { ...s.workoutPRs, [key]: w } };
      }
      return s;
    });
    return isPR;
  }, []);

  /* تسجيل إكمال يوم تمرين في السجل التاريخي + احتساب +10 إضافية (مرة لكل يوم تاريخي) */
  const logWorkoutDay = useCallback(
    (dayId: string, durationSec: number, doneIds: string[]) => {
      const today = todayStr();
      let award = false;
      setState((s) => {
        const exists = s.workoutLogs.some((l) => l.date === today && l.dayId === dayId);
        if (exists) return s;
        award = true;
        return {
          ...s,
          workoutLogs: [
            ...s.workoutLogs,
            { date: today, dayId, durationSec: clampNum(durationSec, 0, 86400), doneIds },
          ],
        };
      });
      if (award) addXP(10);
    },
    [addXP],
  );

  /* إضافة وجبة + حفظها اختيارياً في "أكلاتي المفضلة" (دون تكرار) */
  const addMeal = useCallback((entry: Omit<MealEntry, 'id'>, saveFavorite: boolean) => {
    const name = clean(entry.name);
    if (!name) return;
    const ingredients = clean(entry.ingredients);
    const calories = clampNum(entry.calories, 0, 20000);
    setState((s) => {
      const next: CoreState = {
        ...s,
        meals: [
          ...s.meals,
          {
            id: crypto.randomUUID(),
            date: entry.date || todayStr(),
            type: entry.type,
            name,
            ingredients,
            calories,
            notes: clean(entry.notes),
          },
        ],
      };
      if (saveFavorite) {
        const dup = s.favoriteMeals.some((f) => f.name === name && f.type === entry.type);
        if (!dup) {
          next.favoriteMeals = [
            ...s.favoriteMeals,
            { id: crypto.randomUUID(), type: entry.type, name, ingredients, calories },
          ];
        }
      }
      return next;
    });
  }, []);

  /* حذف وجبة (يمرّ عبر ConfirmDialog) */
  const removeMeal = useCallback((id: string) => {
    setState((s) => ({ ...s, meals: s.meals.filter((m) => m.id !== id) }));
  }, []);

  /* حذف وجبة مفضلة */
  const removeFavorite = useCallback((id: string) => {
    setState((s) => ({ ...s, favoriteMeals: s.favoriteMeals.filter((f) => f.id !== id) }));
  }, []);

  /* ضبط عدد أكواب الماء لليوم (0..8) */
  const setWaterCups = useCallback((cups: number) => {
    const c = clampNum(cups, 0, 8);
    const today = todayStr();
    setState((s) => {
      const others = s.waterLog.filter((w) => w.date !== today);
      return { ...s, waterLog: [...others, { date: today, cups: c }] };
    });
  }, []);

  /* ضبط هدف السعرات اليومي */
  const setCalorieGoal = useCallback((goal: number) => {
    setState((s) => ({ ...s, calorieGoal: clampNum(goal, 0, 20000) }));
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
      addPledge,
      resetPledge,
      removePledge,
      lockCapsule,
      addFutureLetter,
      addExpense,
      removeExpense,
      addCustomCategory,
      removeCustomCategory,
      setBudget,
      toggleExerciseDone,
      setWorkoutImage,
      recordPR,
      logWorkoutDay,
      addMeal,
      removeMeal,
      removeFavorite,
      setWaterCups,
      setCalorieGoal,
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
      addPledge,
      resetPledge,
      removePledge,
      lockCapsule,
      addFutureLetter,
      addExpense,
      removeExpense,
      addCustomCategory,
      removeCustomCategory,
      setBudget,
      toggleExerciseDone,
      setWorkoutImage,
      recordPR,
      logWorkoutDay,
      addMeal,
      removeMeal,
      removeFavorite,
      setWaterCups,
      setCalorieGoal,
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
