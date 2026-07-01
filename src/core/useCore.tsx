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
  useRef,
  type ReactNode,
} from 'react';
import { fireConfetti } from '../components/Confetti';
import { fireXP } from '../components/XPToast';
import { setSoundEnabled, playSuccess, playLevelUp } from './sound';
import type { AnyTemplate } from '../data/templates';
import {
  WEEKLY_CHALLENGES,
  isoWeekKey,
  weekChallengeIndex,
  type WeeklyChallengeDef,
} from '../data/weeklyChallenges';

/* ===== الأنواع المشتركة ===== */

export type Gender = 'male' | 'female';
export type AccentName = 'saudi' | 'gold' | 'emerald' | 'ocean' | 'violet' | 'rose' | 'amber';

export interface Profile {
  name: string;
  nickname: string; // لقب المناداة (يا بطل / يا كابتن)
  gender: Gender; // لتخصيص صيغة الخطاب (أحسنت/أحسنتِ)
  age: number;
  job: string;
  height: number; // مستقل تماماً — لا ربط حسابي (BMI)
  weight: number; // مستقل تماماً — لا ربط حسابي (BMI)
  avatar: string; // صورة شخصية محلية (base64)، فاضية = بدون صورة
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
  history?: string[]; // تواريخ الأيام التي أُنجزت فيها (لحساب سلسلة العادة)
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
  category: string; // فئة الهدف (شخصي/عملي/علاقات/أخرى أو اسم حر)
  deadline: string; // YYYY-MM-DD موعد التسليم (فارغ = بلا موعد)
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
  contactedDate?: string; // YYYY-MM-DD آخر يوم تواصلت فيه (لقياس آخر 7 أيام)
  scheduledAt?: string;   // datetime-local (YYYY-MM-DDTHH:mm) موعد مجدول للاتصال القادم
  note?: string;          // ملاحظة على الموعد المجدول (مثال: وش الموضوع)
}

export interface WeeklyReview {
  id: string;
  date: string; // YYYY-MM-DD
  success: string;
  challenge: string;
  next: string;
}

export interface Session {
  loggedIn: boolean;
  email: string;
}

export type OnboardState = boolean;

export interface CoreState {
  session: Session;
  onboarded: boolean; // أكمل المستخدم شاشة الترحيب؟
  challenge21Started: boolean; // فعّل تحدّي 21 يوم؟
  profile: Profile;
  xp: number;
  streak: Streak;
  accent: AccentName; // اسم الثيم (لا اللون المباشر)
  dark: boolean;
  autoDark: boolean; // وضع ليلي تلقائي حسب الوقت
  fontScale: 'normal' | 'large' | 'xlarge'; // حجم الخط
  fontFamily: 'tajawal' | 'ibmplex' | 'amiri' | 'cairo' | 'almarai' | 'changa' | 'elmessiri'; // نوع خط الواجهة
  soundOn: boolean; // أصوات النجاح (مطفأة افتراضياً)
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
  weeklyReviews: WeeklyReview[];
  identityStatement: string; // "أنا شخص ..."
  constitution: RecurringItem[]; // دستور الذات (حد 5 قواعد)
  notifMaster: boolean; // مفتاح الإشعارات العام
  notifItems: NotifItem[]; // تفضيلات أنواع التذكيرات (واجهة فقط)
  prayerNotif: boolean; // تذكير أوقات الصلاة
  prayerCoords: { lat: number; lng: number } | null; // إحداثيات حساب المواقيت
  guidelinesImage: string | null; // صورة يوم الأرجل التوضيحية (اختيارية)
  pledges: Pledge[];
  timeCapsule: TimeCapsule | null;
  occasions: OccasionEntry[];
  shoppingList: ShoppingItem[];
  quickShopItems: string[]; // عناصر الإضافة السريعة في المشتريات (قابلة للتعديل)
  expenses: ExpenseEntry[];
  customCategories: CustomCategory[];
  budgets: Record<string, number>; // اسم الفئة → السقف الشهري
  workoutPRs: Record<string, number>; // مفتاح التمرين → أعلى وزن
  completedExercises: string[]; // مفاتيح التمارين المكتملة
  workoutLogs: WorkoutLog[];
  meals: MealEntry[];
  favoriteMeals: FavoriteMeal[];
  waterLog: WaterEntry[];
  calorieGoal: number;
  weeklyChallenge: WeeklyChallengeState | null; // التحدّي الأسبوعي العشوائي
  dailyIntention: { date: string; text: string } | null; // نِيّة اليوم — كلمة/جملة تركيز
  intentionLog: { date: string; text: string }[]; // أرشيف النِيّات السابقة (لكل يوم)
  ventNote: { text: string; expiresAt: number } | null; // تفريغ طاقة سلبية — تُمحى تلقائياً بعد ساعة، بدون أرشيف
  homeTileOrder: string[]; // ترتيب بلاطات الرئيسية اليدوي (مصفوفة روابط to)؛ فاضي = الترتيب الافتراضي
}

/* حالة التحدّي الأسبوعي — الفهرس يُشتق من معرّف الأسبوع، ونخزّن الإتمام فقط */
export interface WeeklyChallengeState {
  weekKey: string; // 'YYYY-Www'
  done: boolean;
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

export interface OccasionEntry {
  id: string;
  personName: string;
  relation: string;        // أخ، أخت، صديق، زوجة، والد، والدة، ...
  occasionName: string;    // عيد ميلاد، زواج، تخرّج، ...
  date: string;            // MM-DD للسنوي أو YYYY-MM-DD للمرة الواحدة
  isAnnual: boolean;
  notes: string;
  giftIdeas: string;
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

/* ===== المستويات السبعة (المرجع الوحيد) ===== */
export const LEVELS = [
  'طاير 🐣',
  'صاعد 🚀',
  'نمر 🐅',
  'مبدع 🔥',
  'محترف 🎯',
  'أسطورة 👑',
  'قمة الهمّة 🏔️',
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
  session: { loggedIn: false, email: '' },
  onboarded: false,
  challenge21Started: false,
  profile: {
    name: '',
    nickname: '',
    gender: 'male',
    age: 0,
    job: '',
    height: 0,
    weight: 0,
    avatar: '',
  },
  xp: 0,
  streak: { current: 0, longest: 0, lastDoneDate: '', freezeMonth: '' },
  accent: 'saudi',
  dark: false,
  autoDark: false,
  fontScale: 'normal',
  fontFamily: 'tajawal',
  soundOn: false,
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
  prayerNotif: false,
  prayerCoords: null,
  guidelinesImage: null,
  occasions: [],
  shoppingList: [],
  quickShopItems: ['حليب', 'خبز', 'ماء', 'بنزين', 'بيض', 'أرز', 'دجاج', 'خضار', 'فاكهة', 'تمر'],
  pledges: [],
  timeCapsule: null,
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
  completedExercises: [],
  workoutLogs: [],
  meals: [],
  favoriteMeals: [],
  waterLog: [],
  calorieGoal: 2000,
  weeklyChallenge: null,
  dailyIntention: null,
  intentionLog: [],
  ventNote: null,
  homeTileOrder: [],
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
      session: { ...DEFAULT_STATE.session, ...parsed.session },
      onboarded: parsed.onboarded ?? false,
      challenge21Started: parsed.challenge21Started ?? false,
      profile: { ...DEFAULT_STATE.profile, ...parsed.profile },
      streak: { ...DEFAULT_STATE.streak, ...parsed.streak },
      autoDark: parsed.autoDark ?? false,
      fontScale: parsed.fontScale ?? 'normal',
      fontFamily: parsed.fontFamily ?? 'tajawal',
      soundOn: parsed.soundOn ?? false,
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
      weeklyReviews: parsed.weeklyReviews ?? [],
      identityStatement: parsed.identityStatement ?? '',
      constitution: parsed.constitution ?? [],
      notifMaster: parsed.notifMaster ?? true,
      notifItems: parsed.notifItems ?? DEFAULT_STATE.notifItems,
      prayerNotif: parsed.prayerNotif ?? false,
      prayerCoords: parsed.prayerCoords ?? null,
      guidelinesImage: parsed.guidelinesImage ?? null,
      pledges: parsed.pledges ?? [],
      timeCapsule: parsed.timeCapsule ?? null,
      occasions: parsed.occasions ?? [],
      shoppingList: parsed.shoppingList ?? [],
      quickShopItems: parsed.quickShopItems ?? DEFAULT_STATE.quickShopItems,
      expenses: parsed.expenses ?? [],
      customCategories: parsed.customCategories ?? [],
      budgets: parsed.budgets ?? DEFAULT_STATE.budgets,
      workoutPRs: parsed.workoutPRs ?? {},
      completedExercises: parsed.completedExercises ?? [],
      workoutLogs: parsed.workoutLogs ?? [],
      meals: parsed.meals ?? [],
      favoriteMeals: parsed.favoriteMeals ?? [],
      waterLog: parsed.waterLog ?? [],
      calorieGoal: parsed.calorieGoal ?? 2000,
      weeklyChallenge: parsed.weeklyChallenge ?? null,
      dailyIntention: parsed.dailyIntention ?? null,
      intentionLog: parsed.intentionLog ?? [],
      ventNote:
        parsed.ventNote && parsed.ventNote.expiresAt > Date.now() ? parsed.ventNote : null,
      homeTileOrder: parsed.homeTileOrder ?? [],
    };
  } catch {
    return DEFAULT_STATE;
  }
};

/* ===== سياق النواة ===== */
interface CoreContextValue {
  state: CoreState;
  storageFull: boolean; // امتلأ التخزين وفشل آخر حفظ — نُنبّه المستخدم
  dismissStorageWarning: () => void;
  exportData: () => void; // تنزيل نسخة احتياطية JSON (يستخدمه شريط تنبيه الامتلاء)
  level: number; // 0..6
  levelName: string;
  progress: number; // 0..100 تقدّم داخل المستوى الحالي
  weekly: { def: WeeklyChallengeDef; done: boolean; weekKey: string }; // التحدّي الأسبوعي
  completeWeeklyChallenge: () => void;
  setDailyIntention: (text: string) => void;
  setVentNote: (text: string) => void;
  clearVentNote: () => void;
  setHomeTileOrder: (order: string[]) => void;
  addXP: (amount: number) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  markStreakToday: () => void;
  setAccent: (accent: AccentName) => void;
  toggleDark: () => void;
  toggleAutoDark: () => void;
  toggleSound: () => void;
  setFontScale: (scale: 'normal' | 'large' | 'xlarge') => void;
  setFontFamily: (family: 'tajawal' | 'ibmplex' | 'amiri' | 'cairo' | 'almarai' | 'changa' | 'elmessiri') => void;
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
  addGoal: (title: string, category?: string, deadline?: string) => void;
  editGoalTitle: (goalId: string, title: string) => void;
  editGoalCategory: (goalId: string, category: string) => void;
  removeGoal: (goalId: string) => void;
  addGoalStep: (goalId: string, text: string) => void;
  editGoalStep: (goalId: string, stepId: string, text: string) => void;
  toggleGoalStep: (goalId: string, stepId: string) => void;
  removeGoalStep: (goalId: string, stepId: string) => void;
  moveGoalStep: (goalId: string, stepId: string, dir: -1 | 1) => void;
  moveRoutineTask: (section: RoutineSection, id: string, dir: -1 | 1) => void;
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
  logSleep: (date: string, hours: number) => void; // استيراد مباشر بالتاريخ والساعات
  addRelation: (name: string) => void;
  addAppointment: (name: string, when: string, note?: string) => void;
  toggleRelation: (id: string) => void;
  scheduleRelationCall: (id: string, when: string) => void; // جدولة موعد اتصال ('' يلغي)
  removeRelation: (id: string) => void;
  // ===== مراجعة الأسبوع =====
  addWeeklyReview: (success: string, challenge: string, next: string) => void; // +20
  removeWeeklyReview: (id: string) => void;
  // ===== الهوية + الدستور =====
  setIdentity: (text: string) => void;
  addConstRule: (text: string) => boolean; // false إذا اكتمل الحد (5)
  removeConstRule: (id: string) => void;
  // ===== الإشعارات (واجهة فقط) =====
  setNotifMaster: (on: boolean) => void;
  setPrayerNotif: (on: boolean) => void;
  setPrayerCoords: (coords: { lat: number; lng: number } | null) => void;
  toggleNotif: (id: string) => void;
  setNotifTime: (id: string, time: string) => void;
  setGuidelinesImage: (image: string | null) => void;
  // ===== العهود + صندوق الزمن + رسائل المستقبل =====
  addPledge: (habit: string) => void;
  resetPledge: (id: string) => void; // إعادة بدء دون عقاب
  removePledge: (id: string) => void;
  lockCapsule: (message: string) => void;
  // ===== المصاريف =====
  addOccasion: (entry: Omit<OccasionEntry, 'id'>) => void;
  updateOccasion: (id: string, partial: Partial<OccasionEntry>) => void;
  removeOccasion: (id: string) => void;
  addShoppingItem: (text: string) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearBoughtItems: () => void;
  addExpense: (entry: Omit<ExpenseEntry, 'id'>) => void;
  removeExpense: (id: string) => void;
  addCustomCategory: (name: string, icon: string, note: string) => boolean;
  updateCustomCategory: (id: string, name: string, icon: string, note: string) => boolean;
  removeCustomCategory: (id: string, name: string) => void;
  addQuickShopItem: (text: string) => boolean;
  updateQuickShopItem: (index: number, text: string) => boolean;
  removeQuickShopItem: (index: number) => void;
  setBudget: (category: string, amount: number) => void;
  // ===== جدول المدرب سعود =====
  toggleExerciseDone: (key: string) => void; // +15 عند الإكمال
  recordPR: (key: string, weight: number) => boolean; // true إذا رقم شخصي جديد
  logWorkoutDay: (dayId: string, durationSec: number, doneIds: string[]) => void; // +10 إضافية
  // ===== الوجبات =====
  addMeal: (entry: Omit<MealEntry, 'id'>, saveFavorite: boolean) => void;
  removeMeal: (id: string) => void;
  removeFavorite: (id: string) => void;
  setWaterCups: (cups: number) => void; // لليوم الحالي
  setCalorieGoal: (goal: number) => void;
  // ===== الجلسة (تُربط بمصادقة Manus لاحقاً) =====
  login: (email: string) => void;
  logout: () => void;
  setOnboarded: (v: boolean) => void;
  startChallenge21: () => void; // يضيف روتيناً وهدفاً جاهزاً
  applyTemplate: (t: AnyTemplate) => void; // يطبّق قالباً جاهزاً
}

const CoreContext = createContext<CoreContextValue | null>(null);

export function CoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CoreState>(loadState);
  /* امتلاء التخزين: لو فشل الحفظ ننبّه المستخدم بدل ما تضيع بياناته بصمت */
  const [storageFull, setStorageFull] = useState(false);

  /* حفظ أي تغيير في الحالة تلقائياً */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageFull((prev) => (prev ? false : prev)); // نجح الحفظ — ارفع التنبيه إن وُجد
    } catch {
      /* امتلأ التخزين: لم تُحفظ التغييرات — نبّه المستخدم ليصدّر نسخة احتياطية */
      setStorageFull(true);
    }
  }, [state]);

  const dismissStorageWarning = useCallback(() => setStorageFull(false), []);

  /* تصدير نسخة احتياطية كملف JSON يُنزّله المستخدم */
  const exportData = useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `الهمّة-نسخة-${todayStr()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* تجاهل — نادر جداً */
    }
  }, [state]);

  /* تطبيق الثيم/الوضع الليلي/حجم الخط على <html> فوراً
     الوضع الليلي التلقائي: مفعّل بين 19:00 و 6:00 */
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', state.accent);
    const hour = new Date().getHours();
    const effectiveDark = state.autoDark ? hour >= 19 || hour < 6 : state.dark;
    root.setAttribute('data-dark', String(effectiveDark));
    root.setAttribute('data-font', state.fontScale);
    root.setAttribute('data-fontfamily', state.fontFamily);
  }, [state.accent, state.dark, state.autoDark, state.fontScale, state.fontFamily]);

  /* مزامنة تفعيل أصوات النجاح مع الحالة (عند الإقلاع وأي تغيير) */
  useEffect(() => {
    setSoundEnabled(state.soundOn);
  }, [state.soundOn]);

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

  /* مرجع حيّ لقيمة النقاط (لاكتشاف صعود المستوى خارج محدِّث الحالة
     حتى لا تتكرّر الرسالة/الاحتفال تحت StrictMode) */
  const xpRef = useRef(state.xp);
  useEffect(() => {
    xpRef.current = state.xp;
  }, [state.xp]);

  /* إضافة نقاط — موحّدة كـ useCallback (المرجع الوحيد لكل الصفحات)
     ترسل رسالة تحفيز منبثقة تلقائياً، واحتفالاً خاصاً عند صعود المستوى */
  const addXP = useCallback((amount: number) => {
    const safe = clampNum(Math.round(amount), 0, 10000);
    if (safe === 0) return;
    const before = xpRef.current;
    const after = before + safe;
    xpRef.current = after;
    const lvlOf = (xp: number) => Math.min(Math.floor(xp / 100), LEVELS.length - 1);
    if (lvlOf(after) > lvlOf(before)) {
      fireConfetti();
      playLevelUp();
      fireXP(safe, LEVELS[lvlOf(after)]);
    } else {
      fireXP(safe);
    }
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

  /* تبديل الوضع الليلي التلقائي */
  const toggleAutoDark = useCallback(() => {
    setState((s) => ({ ...s, autoDark: !s.autoDark }));
  }, []);

  /* تبديل أصوات النجاح (مع تشغيل نغمة عيّنة عند التفعيل) */
  const toggleSound = useCallback(() => {
    setState((s) => {
      const next = !s.soundOn;
      setSoundEnabled(next);
      if (next) playSuccess(); // عيّنة فورية عند التفعيل
      return { ...s, soundOn: next };
    });
  }, []);

  /* ضبط حجم الخط */
  const setFontScale = useCallback((scale: 'normal' | 'large' | 'xlarge') => {
    setState((s) => ({ ...s, fontScale: scale }));
  }, []);

  /* ضبط نوع خط الواجهة */
  const setFontFamily = useCallback((family: 'tajawal' | 'ibmplex' | 'amiri' | 'cairo' | 'almarai' | 'changa' | 'elmessiri') => {
    setState((s) => ({ ...s, fontFamily: family }));
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
        { id: crypto.randomUUID(), text: t, priority: 'med', doneDate: '', history: [], subtasks: [] },
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
      let undone = false;
      setState((s) => {
        const list = s.routine[section];
        const nextList = list.map((task) => {
          if (task.id !== id) return task;
          const wasDone = task.doneDate === today;
          if (!wasDone) earned = true;
          else undone = true;
          const hist = task.history ?? [];
          const history = wasDone
            ? hist.filter((d) => d !== today)
            : hist.includes(today) ? hist : [...hist, today];
          return { ...task, doneDate: wasDone ? '' : today, history };
        });
        const allDone =
          nextList.length > 0 && nextList.every((t) => t.doneDate === today);
        if (earned && allDone) fireConfetti();
        // إلغاء التحديد يخصم النقاط ليبقى الرصيد متسقاً (لا تُكسب نقاط لمهمة غير منجزة)
        const xp = undone ? Math.max(0, s.xp - 5) : s.xp;
        return { ...s, xp, routine: { ...s.routine, [section]: nextList } };
      });
      if (earned) {
        navigator.vibrate?.(12); // نبضة خفيفة تعطي إحساس الإنجاز
        playSuccess();
        addXP(5);
        markStreakToday();
      } else if (undone) {
        xpRef.current = Math.max(0, xpRef.current - 5); // مزامنة المرجع مع الخصم
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

  /* إعادة ترتيب مهمة روتين (dir: -1 لأعلى، +1 لأسفل) */
  const moveRoutineTask = useCallback(
    (section: RoutineSection, id: string, dir: -1 | 1) => {
      updateSection(section, (list) => {
        const idx = list.findIndex((t) => t.id === id);
        const j = idx + dir;
        if (idx < 0 || j < 0 || j >= list.length) return list;
        const next = [...list];
        [next[idx], next[j]] = [next[j], next[idx]];
        return next;
      });
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

  /* إضافة هدف جديد (مع فئة وموعد تسليم اختياريين) */
  const addGoal = useCallback(
    (title: string, category = '', deadline = '') => {
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
          category: clean(category),
          deadline: deadline,
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

  /* تعديل فئة هدف (فارغة = بلا فئة) */
  const editGoalCategory = useCallback(
    (goalId: string, category: string) => {
      updateGoals((list) =>
        list.map((g) => (g.id === goalId ? { ...g, category: clean(category) } : g)),
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

  /* إعادة ترتيب خطوة هدف (dir: -1 لأعلى، +1 لأسفل) */
  const moveGoalStep = useCallback(
    (goalId: string, stepId: string, dir: -1 | 1) => {
      updateGoals((list) =>
        list.map((g) => {
          if (g.id !== goalId) return g;
          const idx = g.steps.findIndex((st) => st.id === stepId);
          const j = idx + dir;
          if (idx < 0 || j < 0 || j >= g.steps.length) return g;
          const steps = [...g.steps];
          [steps[idx], steps[j]] = [steps[j], steps[idx]];
          return { ...g, steps };
        }),
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

  /* إعادة تسمية يوم (إدخال حي: نقص الطول فقط مع إبقاء المسافات) */
  const renameCustomDay = useCallback(
    (dayId: string, name: string) => {
      const t = name.slice(0, 200);
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
              // إدخال حي: نقص الطول فقط مع إبقاء المسافات أثناء الكتابة
              if (patch.name !== undefined) next.name = patch.name.slice(0, 200);
              if (patch.reps !== undefined) next.reps = patch.reps.slice(0, 200);
              if (patch.notes !== undefined) next.notes = patch.notes.slice(0, 200);
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

  /* استيراد سجل نوم مباشر (للاستيراد من Apple Health / Google Fit) */
  const logSleep = useCallback((date: string, hours: number) => {
    setState((s) => {
      const others = s.sleepLog.filter((e) => e.date !== date);
      return { ...s, sleepLog: [...others, { date, hours }] };
    });
  }, []);

  /* إضافة شخص لدائرة العلاقات */
  const addRelation = useCallback((name: string) => {
    const t = clean(name);
    if (!t) return;
    setState((s) => ({
      ...s,
      relations: [...s.relations, { id: crypto.randomUUID(), name: t, contacted: false }],
    }));
  }, []);

  /* إضافة موعد مباشرة: شخص جديد (أو موجود بنفس الاسم) + جدولة موعد اتصال عليه بضغطة واحدة */
  const addAppointment = useCallback((name: string, when: string, note?: string) => {
    const t = clean(name);
    if (!t || !when) return;
    const n = note ? clean(note) : undefined;
    setState((s) => {
      const existing = s.relations.find((r) => r.name === t);
      if (existing) {
        return {
          ...s,
          relations: s.relations.map((r) => (r.id === existing.id ? { ...r, scheduledAt: when, note: n } : r)),
        };
      }
      return {
        ...s,
        relations: [...s.relations, { id: crypto.randomUUID(), name: t, contacted: false, scheduledAt: when, note: n }],
      };
    });
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
          // عند تأكيد الاتصال: سجّل تاريخ اليوم وامسح الموعد المجدول (تمّ)
          return { ...r, contacted: nowContacted, contactedDate: nowContacted ? todayStr() : undefined, scheduledAt: nowContacted ? undefined : r.scheduledAt };
        }),
      }));
      if (nowContacted) addXP(5);
    },
    [addXP],
  );

  /* جدولة موعد اتصال قادم (datetime-local) — تمرير '' يلغي الموعد */
  const scheduleRelationCall = useCallback((id: string, when: string) => {
    setState((s) => ({
      ...s,
      relations: s.relations.map((r) =>
        r.id === id ? { ...r, scheduledAt: when || undefined } : r,
      ),
    }));
  }, []);

  /* حذف شخص (يمرّ عبر ConfirmDialog) */
  const removeRelation = useCallback((id: string) => {
    setState((s) => ({ ...s, relations: s.relations.filter((r) => r.id !== id) }));
  }, []);

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

  /* تذكير الصلاة: التفعيل + حفظ الإحداثيات */
  const setPrayerNotif = useCallback((on: boolean) => {
    setState((s) => ({ ...s, prayerNotif: on }));
  }, []);
  const setPrayerCoords = useCallback((coords: { lat: number; lng: number } | null) => {
    setState((s) => ({ ...s, prayerCoords: coords }));
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

  /* إضافة حركة مالية (دخل/مصروف) مع تنظيف وحصر القيم */
  /* ===== المناسبات ===== */
  const addOccasion = useCallback((entry: Omit<OccasionEntry, 'id'>) => {
    setState((s) => ({ ...s, occasions: [...s.occasions, { ...entry, id: crypto.randomUUID() }] }));
  }, []);

  const updateOccasion = useCallback((id: string, partial: Partial<OccasionEntry>) => {
    setState((s) => ({ ...s, occasions: s.occasions.map((o) => o.id === id ? { ...o, ...partial } : o) }));
  }, []);

  const removeOccasion = useCallback((id: string) => {
    setState((s) => ({ ...s, occasions: s.occasions.filter((o) => o.id !== id) }));
  }, []);

  /* ===== قائمة المشتريات ===== */
  const addShoppingItem = useCallback((text: string) => {
    const t = clean(text);
    if (!t) return;
    setState((s) => ({ ...s, shoppingList: [...s.shoppingList, { id: crypto.randomUUID(), text: t, bought: false }] }));
  }, []);

  const toggleShoppingItem = useCallback((id: string) => {
    setState((s) => ({ ...s, shoppingList: s.shoppingList.map((i) => i.id === id ? { ...i, bought: !i.bought } : i) }));
  }, []);

  const removeShoppingItem = useCallback((id: string) => {
    setState((s) => ({ ...s, shoppingList: s.shoppingList.filter((i) => i.id !== id) }));
  }, []);

  const clearBoughtItems = useCallback(() => {
    setState((s) => ({ ...s, shoppingList: s.shoppingList.filter((i) => !i.bought) }));
  }, []);

  /* ===== عناصر الإضافة السريعة (قابلة للتعديل) ===== */
  const addQuickShopItem = useCallback((text: string): boolean => {
    const t = clean(text);
    if (!t) return false;
    let ok = false;
    setState((s) => {
      if (s.quickShopItems.includes(t)) return s;
      ok = true;
      return { ...s, quickShopItems: [...s.quickShopItems, t] };
    });
    return ok;
  }, []);

  const updateQuickShopItem = useCallback((index: number, text: string): boolean => {
    const t = clean(text);
    if (!t) return false;
    let ok = false;
    setState((s) => {
      if (index < 0 || index >= s.quickShopItems.length) return s;
      if (s.quickShopItems.some((q, i) => i !== index && q === t)) return s; // مكرر
      ok = true;
      return { ...s, quickShopItems: s.quickShopItems.map((q, i) => (i === index ? t : q)) };
    });
    return ok;
  }, []);

  const removeQuickShopItem = useCallback((index: number) => {
    setState((s) => ({ ...s, quickShopItems: s.quickShopItems.filter((_, i) => i !== index) }));
  }, []);

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

  /* تعديل فئة مخصصة (الاسم/الإيموجي/الملاحظة) — يعيد false إذا الاسم الجديد مكرر/فارغ.
     عند تغيير الاسم: تُنقل ميزانيتها وتُحدَّث المصاريف المرتبطة بها. */
  const updateCustomCategory = useCallback(
    (id: string, name: string, icon: string, note: string): boolean => {
      const nm = clean(name);
      if (!nm) return false;
      let ok = false;
      setState((s) => {
        const cat = s.customCategories.find((c) => c.id === id);
        if (!cat) return s;
        const oldName = cat.name;
        /* تحقّق التكرار مع غيرها (مع السماح ببقاء نفس الاسم) */
        if (nm !== oldName && (s.customCategories.some((c) => c.id !== id && c.name === nm) || nm in s.budgets)) {
          return s;
        }
        ok = true;
        const customCategories = s.customCategories.map((c) =>
          c.id === id ? { ...c, name: nm, icon: clean(icon) || '🏷️', note: clean(note) } : c,
        );
        /* نقل الميزانية والمصاريف عند تغيّر الاسم */
        let budgets = s.budgets;
        let expenses = s.expenses;
        if (nm !== oldName) {
          const { [oldName]: limit, ...rest } = s.budgets;
          budgets = { ...rest, [nm]: limit ?? 200 };
          expenses = s.expenses.map((e) => (e.category === oldName ? { ...e, category: nm } : e));
        }
        return { ...s, customCategories, budgets, expenses };
      });
      return ok;
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

  /* تسجيل الدخول — حالياً جلسة محلية، تُستبدل بمصادقة Manus عند الرفع */
  const login = useCallback((email: string) => {
    setState((s) => ({ ...s, session: { loggedIn: true, email: clean(email) } }));
  }, []);

  /* تسجيل الخروج */
  const logout = useCallback(() => {
    setState((s) => ({ ...s, session: { loggedIn: false, email: '' } }));
  }, []);

  /* إنهاء/تخطّي شاشة الترحيب */
  const setOnboarded = useCallback((v: boolean) => {
    setState((s) => ({ ...s, onboarded: v }));
  }, []);

  /* تحدّي 21 يوم: روتين جاهز + هدف بموعد بعد 21 يوماً (مرة واحدة) */
  const startChallenge21 = useCallback(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    const deadline = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const mk = (text: string): RoutineTask => ({
      id: crypto.randomUUID(), text, priority: 'med', doneDate: '', history: [], subtasks: [],
    });
    setState((s) => {
      if (s.challenge21Started) return s;
      return {
        ...s,
        challenge21Started: true,
        routine: {
          morning: [
            ...s.routine.morning,
            mk('صلاة الفجر في وقتها'),
            mk('شرب كوب ماء'),
            mk('قراءة 10 دقائق'),
          ],
          evening: [
            ...s.routine.evening,
            mk('مراجعة إنجاز اليوم'),
            mk('النوم مبكراً'),
          ],
        },
        goals: [
          ...s.goals,
          {
            id: crypto.randomUUID(),
            title: 'تحدّي 21 يوم 🔥',
            steps: [],
            completed: false,
            createdDate: todayStr(),
            category: 'شخصي',
            deadline,
          },
        ],
      };
    });
  }, []);

  /* تطبيق قالب جاهز (هدف/روتين/تحدّي/ميزانية) دفعة واحدة آمنة */
  const applyTemplate = useCallback((t: AnyTemplate) => {
    const mkTask = (text: string): RoutineTask => ({
      id: crypto.randomUUID(), text, priority: 'med', doneDate: '', history: [], subtasks: [],
    });
    const deadlineAfter = (days: number) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    setState((s) => {
      if (t.kind === 'goal') {
        return {
          ...s,
          goals: [...s.goals, {
            id: crypto.randomUUID(), title: t.title,
            steps: t.steps.map((text) => ({ id: crypto.randomUUID(), text, done: false })),
            completed: false, createdDate: todayStr(), category: t.category, deadline: deadlineAfter(t.days),
          }],
        };
      }
      if (t.kind === 'routine') {
        return {
          ...s,
          routine: {
            morning: [...s.routine.morning, ...t.morning.map(mkTask)],
            evening: [...s.routine.evening, ...t.evening.map(mkTask)],
          },
        };
      }
      if (t.kind === 'challenge') {
        return {
          ...s,
          routine: {
            morning: [...s.routine.morning, ...(t.morning ?? []).map(mkTask)],
            evening: [...s.routine.evening, ...(t.evening ?? []).map(mkTask)],
          },
          goals: [...s.goals, {
            id: crypto.randomUUID(), title: t.goalTitle, steps: [],
            completed: false, createdDate: todayStr(), category: 'تحدّي', deadline: deadlineAfter(t.days),
          }],
        };
      }
      // budget
      return { ...s, budgets: { ...s.budgets, ...t.budgets } };
    });
    addXP(5);
    fireConfetti();
  }, [addXP]);

  /* التحدّي الأسبوعي العشوائي — يُشتق تحدٍّ ثابت لكل أسبوع، والإتمام يُعاد ضبطه تلقائياً مع الأسبوع الجديد */
  const weekly = useMemo(() => {
    const weekKey = isoWeekKey();
    const def = WEEKLY_CHALLENGES[weekChallengeIndex(weekKey)];
    const done = state.weeklyChallenge?.weekKey === weekKey && state.weeklyChallenge.done;
    return { def, done, weekKey };
  }, [state.weeklyChallenge]);

  const completeWeeklyChallenge = useCallback(() => {
    const weekKey = isoWeekKey();
    const cur = state.weeklyChallenge;
    if (cur?.weekKey === weekKey && cur.done) return; // أُنجز هذا الأسبوع
    setState((s) => ({ ...s, weeklyChallenge: { weekKey, done: true } }));
    addXP(WEEKLY_CHALLENGES[weekChallengeIndex(weekKey)].reward);
    fireConfetti();
  }, [state.weeklyChallenge, addXP]);

  /* نِيّة اليوم — كلمة/جملة تركيز يكتبها المستخدم؛ مكافأة + احتفال أول مرة باليوم فقط.
     تُحفظ أيضاً في الأرشيف (سجل لكل يوم) لتتبّع الالتزام. */
  const setDailyIntention = useCallback((text: string) => {
    const t = clean(text);
    const today = todayStr();
    const isFirstToday = state.dailyIntention?.date !== today;
    setState((s) => {
      const log = s.intentionLog.filter((e) => e.date !== today);
      if (t) log.push({ date: today, text: t });
      return {
        ...s,
        dailyIntention: t ? { date: today, text: t } : null,
        intentionLog: log.sort((a, b) => (a.date < b.date ? 1 : -1)),
      };
    });
    if (t && isFirstToday) {
      addXP(5);
      fireConfetti();
    }
  }, [state.dailyIntention, addXP]);

  /* تفريغ طاقة سلبية — خانة كتابة تُمحى تلقائياً بعد ساعة، بدون أرشيف دائم */
  const setVentNote = useCallback((text: string) => {
    const t = clean(text);
    setState((s) => ({
      ...s,
      ventNote: t ? { text: t, expiresAt: Date.now() + 60 * 60 * 1000 } : null,
    }));
  }, []);

  const clearVentNote = useCallback(() => {
    setState((s) => ({ ...s, ventNote: null }));
  }, []);

  /* ترتيب يدوي لبلاطات الرئيسية */
  const setHomeTileOrder = useCallback((order: string[]) => {
    setState((s) => ({ ...s, homeTileOrder: order }));
  }, []);

  const value = useMemo<CoreContextValue>(
    () => ({
      state,
      storageFull,
      dismissStorageWarning,
      exportData,
      level,
      levelName,
      progress,
      weekly,
      completeWeeklyChallenge,
      setDailyIntention,
      setVentNote,
      clearVentNote,
      setHomeTileOrder,
      addXP,
      updateProfile,
      markStreakToday,
      setAccent,
      toggleDark,
      toggleAutoDark,
      toggleSound,
      setFontScale,
      setFontFamily,
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
      editGoalCategory,
      removeGoal,
      addGoalStep,
      editGoalStep,
      toggleGoalStep,
      removeGoalStep,
      moveGoalStep,
      moveRoutineTask,
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
      logSleep,
      addRelation,
      addAppointment,
      toggleRelation,
      scheduleRelationCall,
      removeRelation,
      addWeeklyReview,
      removeWeeklyReview,
      setIdentity,
      addConstRule,
      removeConstRule,
      setNotifMaster,
      setPrayerNotif,
      setPrayerCoords,
      toggleNotif,
      setNotifTime,
      setGuidelinesImage,
      addPledge,
      resetPledge,
      removePledge,
      lockCapsule,
      addOccasion,
      updateOccasion,
      removeOccasion,
      addShoppingItem,
      toggleShoppingItem,
      removeShoppingItem,
      clearBoughtItems,
      addExpense,
      removeExpense,
      addCustomCategory,
      updateCustomCategory,
      removeCustomCategory,
      addQuickShopItem,
      updateQuickShopItem,
      removeQuickShopItem,
      setBudget,
      toggleExerciseDone,
      recordPR,
      logWorkoutDay,
      addMeal,
      removeMeal,
      removeFavorite,
      setWaterCups,
      setCalorieGoal,
      login,
      logout,
      setOnboarded,
      startChallenge21,
      applyTemplate,
    }),
    [
      state,
      storageFull,
      dismissStorageWarning,
      exportData,
      level,
      levelName,
      progress,
      weekly,
      completeWeeklyChallenge,
      setDailyIntention,
      setVentNote,
      clearVentNote,
      setHomeTileOrder,
      addXP,
      updateProfile,
      markStreakToday,
      setAccent,
      toggleDark,
      toggleAutoDark,
      toggleSound,
      setFontScale,
      setFontFamily,
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
      editGoalCategory,
      removeGoal,
      addGoalStep,
      editGoalStep,
      toggleGoalStep,
      removeGoalStep,
      moveGoalStep,
      moveRoutineTask,
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
      logSleep,
      addRelation,
      addAppointment,
      toggleRelation,
      scheduleRelationCall,
      removeRelation,
      addWeeklyReview,
      removeWeeklyReview,
      setIdentity,
      addConstRule,
      removeConstRule,
      setNotifMaster,
      setPrayerNotif,
      setPrayerCoords,
      toggleNotif,
      setNotifTime,
      setGuidelinesImage,
      addPledge,
      resetPledge,
      removePledge,
      lockCapsule,
      addOccasion,
      updateOccasion,
      removeOccasion,
      addShoppingItem,
      toggleShoppingItem,
      removeShoppingItem,
      clearBoughtItems,
      addExpense,
      removeExpense,
      addCustomCategory,
      updateCustomCategory,
      removeCustomCategory,
      addQuickShopItem,
      updateQuickShopItem,
      removeQuickShopItem,
      setBudget,
      toggleExerciseDone,
      recordPR,
      logWorkoutDay,
      addMeal,
      removeMeal,
      removeFavorite,
      setWaterCups,
      setCalorieGoal,
      login,
      logout,
      setOnboarded,
      startChallenge21,
      applyTemplate,
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
