/* ===================================================================
   templates.ts — قوالب احترافية جاهزة (أهداف/روتين/تحديات/ميزانية).
   تُطبَّق عبر core.applyTemplate دفعة واحدة. بيانات فقط — خفيفة.
   =================================================================== */

export interface GoalTemplate {
  kind: 'goal';
  id: string;
  emoji: string;
  title: string;
  desc: string;
  category: string;
  days: number; // مدة مقترحة لموعد التسليم
  steps: string[];
}

export interface RoutineTemplate {
  kind: 'routine';
  id: string;
  emoji: string;
  title: string;
  desc: string;
  popular?: boolean; // ⭐ مقترح/شائع
  morning: string[];
  evening: string[];
}

export interface ChallengeTemplate {
  kind: 'challenge';
  id: string;
  emoji: string;
  title: string;
  desc: string;
  days: number;
  goalTitle: string;
  morning?: string[];
  evening?: string[];
}

export interface BudgetTemplate {
  kind: 'budget';
  id: string;
  emoji: string;
  title: string;
  desc: string;
  budgets: Record<string, number>;
}

export type AnyTemplate = GoalTemplate | RoutineTemplate | ChallengeTemplate | BudgetTemplate;

/* ===== قوالب الأهداف ===== */
export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    kind: 'goal', id: 'g-weight', emoji: '⚖️', title: 'أنحف بصحة', desc: 'تنحف بدون ما تجوّع نفسك',
    category: 'صحة', days: 90,
    steps: ['أحسب سعراتي', 'أقلّل ٥٠٠ سعرة عن احتياجي', 'أمشي ٨٠٠٠ خطوة باليوم', 'أشرب ٢ لتر ماء', 'أوزن نفسي كل أسبوع', 'أنام ٧ ساعات'],
  },
  {
    kind: 'goal', id: 'g-quran', emoji: '📖', title: 'أحفظ جزء عمّ', desc: 'تحفظه وتتقنه في ٦٠ يوم',
    category: 'ديني', days: 60,
    steps: ['أثبّت وقت للحفظ كل يوم', 'أحفظ آيتين باليوم', 'أراجع حفظ أمس قبل الجديد', 'أراجع كل خميس اللي حفظته', 'أسمّع لأحد', 'أختم الجزء كامل'],
  },
  {
    kind: 'goal', id: 'g-skill', emoji: '🚀', title: 'أتعلّم مهارة في ٩٠ يوم', desc: 'من الصفر لين تحترف',
    category: 'تطوير', days: 90,
    steps: ['أختار المهارة بالضبط', 'أجمع أحسن ٣ مصادر', 'أتعلّم ساعة باليوم', 'أطبّق بمشروع صغير', 'أنشر شغلي للناس', 'أقيّم تقدّمي كل شهر'],
  },
  {
    kind: 'goal', id: 'g-save', emoji: '💰', title: 'أوفّر للزواج / حلم كبير', desc: 'توفّر بطريقة مرتّبة',
    category: 'مالي', days: 365,
    steps: ['أحدّد المبلغ اللي أبيه', 'أفتح حساب توفير لحاله', 'أحوّل ٢٠٪ من دخلي أول الشهر', 'أقص المصاريف اللي ما لها داعي', 'أتابع تقدّمي كل شهر', 'أكافئ نفسي كل ٢٥٪'],
  },
  {
    kind: 'goal', id: 'g-read', emoji: '📚', title: 'أقرأ ١٢ كتاب هالسنة', desc: 'كتاب كل شهر — تقدر!',
    category: 'تطوير', days: 365,
    steps: ['أجهّز قائمة ١٢ كتاب', 'أقرأ ٢٠ صفحة باليوم', 'ألخّص كل كتاب بصفحة', 'أشارك أحلى فكرة', 'أراجع قائمتي كل ٣ أشهر'],
  },
];

/* ===== قوالب الروتين ===== */
export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    kind: 'routine', id: 'r-fajr', emoji: '🌅', title: 'روتين الفجر', desc: 'ابدأ يومك على بركة', popular: true,
    morning: ['صلاة الفجر في وقتها', 'أذكار الصباح', 'شرب كوب ماء', 'قراءة ١٠ دقائق', 'تمرين خفيف ٥ دقائق'],
    evening: ['أذكار المساء', 'مراجعة إنجاز اليوم', 'النوم مبكراً'],
  },
  {
    kind: 'routine', id: 'r-student', emoji: '🎓', title: 'روتين الطالب', desc: 'تركيز ومذاكرة بدون تشتيت',
    morning: ['مراجعة جدول اليوم', 'أصعب مادة أول النهار', 'جلسة مذاكرة ٥٠ دقيقة', 'استراحة وحركة'],
    evening: ['حل واجبات الغد', 'مراجعة سريعة لما ذاكرت', 'ترتيب الحقيبة', 'نوم ٧ ساعات'],
  },
  {
    kind: 'routine', id: 'r-employee', emoji: '💼', title: 'روتين الموظف', desc: 'تنجز وما تطفّش',
    morning: ['تحديد أهم ٣ مهام', 'إنجاز أصعب مهمة أولاً', 'تفريغ الإيميل مرة واحدة'],
    evening: ['تجهيز مهام الغد', 'فصل عن العمل (لا إيميل)', 'وقت للعائلة', 'نوم منتظم'],
  },
  {
    kind: 'routine', id: 'r-athlete', emoji: '💪', title: 'روتين الرياضي', desc: 'لياقة وأكل صح',
    morning: ['شرب ماء + بروتين', 'إحماء وتمرين', 'وجبة بعد التمرين'],
    evening: ['تمدّد واسترخاء', 'تحضير وجبات الغد', 'نوم ٨ ساعات للاستشفاء'],
  },
];

/* ===== قوالب التحديات ===== */
export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    kind: 'challenge', id: 'c-nophone', emoji: '📵', title: 'تحدّي ترك الجوال قبل النوم', desc: '٢١ يوم وتنام أحسن', days: 21,
    goalTitle: 'تحدّي: لا جوال قبل النوم بساعة 📵',
    evening: ['أطفّي الجوال قبل النوم بساعة', 'أقرأ بدل الجوال'],
  },
  {
    kind: 'challenge', id: 'c-walk', emoji: '🚶', title: 'تحدّي ١٠ آلاف خطوة', desc: '٣٠ يوم حركة وطاقة', days: 30,
    goalTitle: 'تحدّي: ١٠٠٠٠ خطوة يومياً 🚶',
    morning: ['أمشي ١٠٠٠٠ خطوة', 'أتابع خطواتي'],
  },
  {
    kind: 'challenge', id: 'c-water', emoji: '💧', title: 'تحدّي شرب الماء', desc: '٢١ يوم وجسمك يشكرك', days: 21,
    goalTitle: 'تحدّي: ٢ لتر ماء يومياً 💧',
    morning: ['شرب كوب ماء أول الصبح'],
    evening: ['أكملت ٢ لتر ماء اليوم'],
  },
  {
    kind: 'challenge', id: 'c-66', emoji: '🔥', title: 'تحدّي العادة الراسخة ٦٦ يوم', desc: 'لين تصير العادة تلقائية', days: 66,
    goalTitle: 'تحدّي ٦٦ يوم — عادتي الجديدة 🔥',
    morning: ['أنجزت عادتي اليوم'],
  },
];

/* ===== قوالب الميزانية ===== */
export const BUDGET_TEMPLATES: BudgetTemplate[] = [
  {
    kind: 'budget', id: 'b-student', emoji: '🎓', title: 'ميزانية طالب', desc: 'مصروفك محدود؟ رتّبناه لك',
    budgets: { طعام: 400, نقل: 200, تسوق: 150, فواتير: 100, صحة: 50, أخرى: 100, 'صندوق الخير': 50 },
  },
  {
    kind: 'budget', id: 'b-family', emoji: '👨‍👩‍👧', title: 'ميزانية عائلة', desc: 'تكفّي مصاريف البيت',
    budgets: { طعام: 2000, نقل: 800, تسوق: 700, فواتير: 1200, صحة: 500, أخرى: 400, 'صندوق الخير': 300 },
  },
  {
    kind: 'budget', id: 'b-5030 20', emoji: '⚖️', title: 'قاعدة ٥٠/٣٠/٢٠', desc: '٥٠٪ احتياج، ٣٠٪ رغبة، ٢٠٪ ادّخار (على دخل ٥٠٠٠)',
    budgets: { طعام: 1000, نقل: 500, فواتير: 1000, تسوق: 1500, صحة: 250, أخرى: 250, 'صندوق الخير': 500 },
  },
];
