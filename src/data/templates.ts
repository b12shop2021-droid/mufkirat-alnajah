/* ===================================================================
   templates.ts — قوالب احترافية جاهزة (أهداف/روتين/تحديات/عادات/ميزانية).
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

export interface HabitTemplate {
  kind: 'habit';
  id: string;
  emoji: string;
  title: string;
  desc: string; // العادة + التكرار
  reminder: string; // رسالة تذكير كوميدية محفزة
  section: 'morning' | 'evening'; // وين تنضاف بالروتين
  task: string; // نص المهمة اللي تنضاف
}

export type AnyTemplate = GoalTemplate | RoutineTemplate | ChallengeTemplate | BudgetTemplate | HabitTemplate;

/* تكلفة فتح أي قالب بريالات الهمّة — كل فتح يخصم هذا المبلغ ويفتح قالباً واحداً */
export const TEMPLATE_UNLOCK_COST = 25;

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
  {
    kind: 'goal', id: 'g-gym', emoji: '💪', title: 'تعديل الشاص', desc: 'تضبط جسمك وتلتزم بالنادي قبل ما تروح عليك السنة',
    category: 'رياضة', days: 90,
    steps: ['ألتزم بالنادي ٤ أيام بالأسبوع (بدون سحبات تكتيكية)', 'أقطع الوجبات السريعة اللي آكلة نص راتبي', 'أسجّل تمريني أول ما أخلّص', 'أصوّر نفسي كل شهر أشوف الفرق', 'أنام بدري عشان العضلة تتعافى'],
  },
  {
    kind: 'goal', id: 'g-budget-iron', emoji: '🧊', title: 'الميزانية الحديدية', desc: 'توقف نزيف المحفظة وتعرف فلوسك تروح وين بالضبط',
    category: 'مالي', days: 30,
    steps: ['أحط حد شهري للمطاعم والكافيهات', 'أسجّل كل ريال يطلع من جيبي بالتطبيق', 'ألغي الاشتراكات اللي أدفعها وأنا ما أدري', 'أطبخ بالبيت ٤ مرات بالأسبوع على الأقل', 'أراجع مصاريفي كل يوم أحد'],
  },
  {
    kind: 'goal', id: 'g-cv', emoji: '📄', title: 'قفل ملف السيرة الذاتية', desc: 'تتحول من "محب للقراءة والسفر" لشخص فعلاً يستاهل الوظيفة',
    category: 'مهني', days: 60,
    steps: ['أختار شهادة احترافية معتمدة بمجالي', 'أنهي الكورس أو الكتاب المخصص لها', 'أطبّق اللي تعلمته ساعتين بالأسبوع', 'أحدّث حساب لينكد إن وصورتي الرسمية', 'أضيف الشهادة والمشاريع لسيرتي الذاتية'],
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
  {
    kind: 'routine', id: 'r-nightclose', emoji: '🌙', title: 'تصفير الطبلون', desc: 'تقفل ملف يومك ومخك يرتاح قبل النوم',
    morning: [],
    evening: ['أجهّز جبهة بكرة (أكتب مهام الغد)', 'أشحن عقلي (صفحتين قراءة أو وردي)', 'عزلة تكتيكية عن الشاشة قبل النوم بـ٢٠ دقيقة'],
  },
  {
    kind: 'routine', id: 'r-morning-beast', emoji: '🦅', title: 'قومة وحوش الصباح', desc: 'من ٦ لـ٩ الصبح — تصدم يومك من أول دقيقة',
    morning: ['أنزل من السرير بدون دراما ولا تأمل بالسقف', 'أرتّب مظهري (أسنان + شعر) بثقة', 'ألقّم جمجمتي (قهوة أو شاهي مع فطور خفيف)'],
    evening: [],
  },
  {
    kind: 'routine', id: 'r-afterwork', emoji: '💼', title: 'نفض ضغط الدوام', desc: 'أول ما ترجع البيت — افصل عن وضع الموظف',
    morning: [],
    evening: ['أغيّر لبس الدوام بلبس الراحة', 'قيلولة تكتيكية نص ساعة بس (لا تصير نومة أهل الكهف)', 'أفصل الأسلاك — بدون إيميل ولا قروبات شغل'],
  },
  {
    kind: 'routine', id: 'r-lockscreen', emoji: '🔒', title: 'قفل الشاشة ونم', desc: '٣٠ دقيقة قبل النوم — نم بضمير مرتاح',
    morning: [],
    evening: ['أتشيّك على المنبه (AM مو PM!)', 'وضوء + وتر + أذكار النوم', 'أرمي الجوال بعيد عن السرير'],
  },
  {
    kind: 'routine', id: 'r-examday', emoji: '📚', title: 'تكتيك ما قبل الاختبار', desc: 'روتين طوارئ يوم المذاكرة أو البريزنتيشن',
    morning: ['أطلع من قروب الطقطقة والميمز', 'الجوال وضع الطيران فوق السرير بعيد عني', 'بومودورو: ٢٥ دقيقة تركيز + ٥ بريك × ٣ مرات'],
    evening: [],
  },
  {
    kind: 'routine', id: 'r-afternoon', emoji: '☕', title: 'روقان العصر الفخم', desc: 'من ٤ لـ٦ مساءً — تشحن عشان تكمّل يومك بقوة',
    morning: [],
    evening: ['ألقّم دماغي (شاهي كشري أو قهوة سوداء)', 'مراجعة سريعة ١٠ دقايق على الباقي من مهامي', 'أغيّر الجو — أفتح الدريشة أو أطلع الحوش'],
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
  {
    kind: 'challenge', id: 'c-dust', emoji: '🧹', title: 'نفض غبار الكسل', desc: 'تحدي سريع عشان ترجع للملعب وتصحصح', days: 3,
    goalTitle: 'تحدّي: نفض غبار الكسل 🧹',
    morning: ['أشطب مهمتين أول ما أصحى', 'بدون جوال أول نص ساعة من يومي'],
  },
  {
    kind: 'challenge', id: 'c-productive', emoji: '⚡', title: 'الإنتاجية الشياكة', desc: 'أسبوع كامل تقفّل فيه كل الأشياء المؤجلة', days: 7,
    goalTitle: 'تحدّي: الإنتاجية الشياكة ⚡',
    morning: ['أشطّب أثقل وأرخم مهمة قبل الساعة ٢ الظهر'],
  },
  {
    kind: 'challenge', id: 'c-digital-detox', emoji: '📵', title: 'الديتوكس الرقمي', desc: 'كبح جماح إدمان السوشيال ميديا والتيك توك', days: 3,
    goalTitle: 'تحدّي: الديتوكس الرقمي 📵',
    evening: ['وقت الشاشة اليوم ما يتعدى ساعتين', 'أحجب التطبيقات بعد ١١ بالليل'],
  },
  {
    kind: 'challenge', id: 'c-fajr', emoji: '🕌', title: 'صلاة الفجر في وقتها', desc: 'التزام حديدي بأعظم فريضة، ٧ أيام كاملة', days: 7,
    goalTitle: 'تحدّي: صلاة الفجر جماعة 🕌',
    morning: ['أقوم فوراً مع الأذان بدون زر الغفوة'],
  },
  {
    kind: 'challenge', id: 'c-rescue-week', emoji: '🚨', title: 'أسبوع الإنقاذ', desc: 'لإنقاذ ما يمكن إنقاذه قبل الاختبارات أو التسليم', days: 5,
    goalTitle: 'تحدّي: أسبوع الإنقاذ 🚨',
    morning: ['٤ ساعات تركيز صافي بدون جوال ولا سوالف'],
  },
  {
    kind: 'challenge', id: 'c-no-delivery', emoji: '🍔', title: 'بدون مطاعم ولا توصيل', desc: 'إعلان حرب على تطبيقات التوصيل — ٥ أيام أكل بيت', days: 5,
    goalTitle: 'تحدّي: بدون مطاعم 🍔',
    evening: ['أطبخ أو آكل أكل بيت، صفر توصيل اليوم'],
  },
  {
    kind: 'challenge', id: 'c-silence', emoji: '🤫', title: 'العشرين دقيقة الصامتة', desc: 'تحدي لتهدئة الدماغ وفصل الأسلاك، ٣ أيام', days: 3,
    goalTitle: 'تحدّي: ٢٠ دقيقة صامتة 🤫',
    evening: ['أجلس ٢٠ دقيقة بدون جوال ولا تلفزيون ولا سوالف'],
  },
  {
    kind: 'challenge', id: 'c-content', emoji: '🎥', title: 'صانع المحتوى الصامد', desc: 'تبدأ حسابك أو مشروعك بدل ما تأجّله للأبد، أسبوع كامل', days: 7,
    goalTitle: 'تحدّي: صانع المحتوى 🎥',
    morning: ['أكتب فكرة أو أصوّر مقطع صغير بدون أعذار'],
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

/* ===== قوالب العادات ===== */
export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    kind: 'habit', id: 'h-water', emoji: '💧', title: 'سقيا مخك', desc: 'اشرب مويه ٤ مرات باليوم',
    section: 'morning', task: 'أشرب كأس مويه (سقيا مخك)',
    reminder: 'ألوو.. مخك يقول لك ترى جفيت، قم اشرب مويه وعطه طاقة.',
  },
  {
    kind: 'habit', id: 'h-move', emoji: '🚶', title: 'تحريك العظام', desc: 'رياضة أو مشي سريع ٢٠-٣٠ دقيقة عصر أو مغرب',
    section: 'evening', task: 'أحرّك جسمي ٢٠ دقيقة (مشي أو رياضة)',
    reminder: 'السدحة ما وراها إلا الخمول.. حرّك رجولك، المشي ببلاش وما يحتاج اشتراك!',
  },
  {
    kind: 'habit', id: 'h-learn', emoji: '📖', title: 'استثمار في الوعي', desc: 'قراءة أو تعلّم ١٠ دقايق بس باليوم',
    section: 'evening', task: 'أقرأ أو أتعلّم شي جديد ١٠ دقايق',
    reminder: 'ترى ١٠ دقايق اليوم تخليك بعد سنة بطل بمجالك.. لا تستهين فيها.',
  },
  {
    kind: 'habit', id: 'h-stretch', emoji: '🧘', title: 'تصفية النية والظهر', desc: 'تمدد وإطالات ٥ دقايق باليوم',
    section: 'morning', task: 'أتمدد وأطلّع ظهري ٥ دقايق',
    reminder: 'جلسة المكتب عدّمت ظهرك.. تمدد شوي قبل ما تصير علامة استفهام (؟).',
  },
  {
    kind: 'habit', id: 'h-sadaqah', emoji: '🤲', title: 'حصالة الآخرة', desc: 'صدقة يومية ولو بريال',
    section: 'morning', task: 'أتصدّق ولو بريال',
    reminder: 'بريال واحد الحين في إحسان، تفرّج كربة وتدفع عن نفسك بلاوي.. لا تتردد.',
  },
  {
    kind: 'habit', id: 'h-caffeine', emoji: '☕', title: 'تقليل هبد الكافيين', desc: 'حدّك كوبين قهوة بس باليوم',
    section: 'morning', task: 'ألتزم بكوبين قهوة بس اليوم',
    reminder: 'القهوة الرابعة ما راح تخليك ذكي، بتخلي قلبك يدق كأنه طبل سامري.. اعقل!',
  },
  {
    kind: 'habit', id: 'h-posture', emoji: '🕴️', title: 'تعديل الممشى', desc: 'وقوف ومشية صحية، ٣ مرات باليوم',
    section: 'morning', task: 'أعدّل وقفتي ومشيتي',
    reminder: 'ارفع ظهرك وافرد كتوفك، ترى مشيتك صارت كأنك شايل هموم القارة العجوز.. اعدل الشاص!',
  },
  {
    kind: 'habit', id: 'h-bed', emoji: '🛏️', title: 'ترتيب المقعد', desc: 'رتّب سريرك أول ما تصحى — ٣٠ ثانية بس',
    section: 'morning', task: 'أرتّب سريري فور ما أصحى',
    reminder: 'لا تطلع من الغرفة وسريرك كأنه معركة عالمية.. رتّبه بـ٣٠ ثانية واكسب أول إنجاز باليوم!',
  },
  {
    kind: 'habit', id: 'h-family', emoji: '❤️', title: 'الكلمة الطيبة', desc: 'كلمة أو رسالة حلوة لأهلك كل يوم',
    section: 'evening', task: 'أتواصل مع أهلي بكلمة طيبة',
    reminder: 'مرّ على الوالدة أو الوالد، حب راسهم أو ابعث لهم رسالة.. رضاهم هو اللي موفّقك.',
  },
  {
    kind: 'habit', id: 'h-declutter', emoji: '🗑️', title: 'تنظيف الذاكرة', desc: 'احذف الصور والملفات الزايدة قبل النوم',
    section: 'evening', task: 'أنظّف جوالي من الصور الزايدة',
    reminder: 'جوالك يشتكي المساحة ممتلئة! احذف السكرينشوتات والميمز القديمة.. عطه نفس يتنفس.',
  },
];

/* ===== عرض اليوم — قالب واحد عشوائي (ثابت طول اليوم) بنص السعر ===== */
export const DAILY_DEAL_DISCOUNT = 0.5;

export function getDailyDealId(dateStr: string): string {
  const all: AnyTemplate[] = [...GOAL_TEMPLATES, ...ROUTINE_TEMPLATES, ...CHALLENGE_TEMPLATES, ...HABIT_TEMPLATES, ...BUDGET_TEMPLATES];
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  return all[hash % all.length].id;
}
