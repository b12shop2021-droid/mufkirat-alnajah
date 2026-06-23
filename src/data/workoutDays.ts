/* ===================================================================
   workoutDays.ts — بيانات جدول "الكابتن سعود" الستة (منقولة حرفياً)
   لا تُعدَّل محتوياتها بدون إذن.
   =================================================================== */

import type { Difficulty } from '../core/useCore';

export interface CaptainExercise {
  id: number;
  nameAr: string;
  nameEn: string;
  muscles: string;
  difficulty: Difficulty | 'متوسط-متقدم';
  sets: number;
  reps: string;
  note: string;
  baseline: number; // وزن مرجعي لكشف الرقم الشخصي
  advanced?: boolean;
  sameDay?: string;
}

export interface CaptainDay {
  id: string;
  label: string;
  title: string;
  focus: string;
  warmup: boolean;
  exercises: CaptainExercise[];
}

export const WORKOUT_DAYS: CaptainDay[] = [
  {
    id: 'push_a',
    label: 'دفع أ',
    title: '💪 يوم الدفع (أ) — Push A',
    focus: 'الصدر، الكتف الأمامي، الترايسبس',
    warmup: false,
    exercises: [
      { id: 1, nameAr: 'ضغط الصدر بالبار أو الدمبل', nameEn: 'Barbell Bench Press or Dumbbell Bench Press', muscles: 'عضلة الصدر الكبرى (الوسطى)، الكتف الأمامي، الترايسبس', difficulty: 'متوسط', sets: 4, reps: '8-12', note: 'تحكم في نزول الوزن (السلبية)، واضغط للأعلى بقوة باستخدام عضلات الصدر، حافظ على قوس بسيط وآمن في أسفل الظهر.', baseline: 17 },
      { id: 2, nameAr: 'ضغط الكتف الأمامي بالبار', nameEn: 'Barbell Front Shoulder Press', muscles: 'الكتف الأمامي (رئيسي)، الترايسبس، الصدر العلوية', difficulty: 'متوسط', sets: 4, reps: '8-12', note: 'حافظ على استقامة الظهر وشد عضلات البطن لدعم الجذع، لا تدفع رأسك للأمام بشكل مبالغ فيه عند صعود البار.', baseline: 19 },
      { id: 3, nameAr: 'ضغط الصدر العلوي بالدمبل - مائل', nameEn: 'Incline Dumbbell Bench Press', muscles: 'عضلة الصدر العلوية (رئيسي)، الكتف الأمامي، الترايسبس', difficulty: 'متوسط', sets: 4, reps: '8-12', note: 'اضبط زاوية الدكة بين 30-45 درجة، ركز على "عصر" عضلة الصدر العلوية في أعلى الحركة.', baseline: 21 },
      { id: 4, nameAr: 'رفرفة جانبية بالدمبل أو الكيبل', nameEn: 'Dumbbell or Cable Lateral Raise', muscles: 'الكتف الجانبي', difficulty: 'متوسط', sets: 4, reps: '12-15', note: 'اجعل المرفقين هما من يقودان الحركة للأعلى، لا تستخدم قوة الدفع، ركز على العزل التام.', baseline: 23 },
      { id: 5, nameAr: 'عزل الصدر السفلي', nameEn: 'Lower Chest Isolation (High-to-Low Cable Crossover)', muscles: 'عضلة الصدر الكبرى (الجزء السفلي)', difficulty: 'متوسط', sets: 4, reps: '10-15', note: 'عند وصول الكيبل للأسفل، اعصر عضلة الصدر السفلية بقوة، وحافظ على ثني بسيط وآمن في المرفقين.', baseline: 25 },
      { id: 6, nameAr: 'تجميع ترايسبس بالدمبل خلف الرأس', nameEn: 'Overhead Dumbbell Triceps Extension', muscles: 'عضلة الترايسبس (الرأس الطويل)', difficulty: 'متوسط', sets: 4, reps: '8-12', note: 'حافظ على ثبات العضد بجوار الرأس، واعمل على فرد المرفق بالكامل للأعلى باستخدام الترايسبس.', baseline: 27 },
      { id: 7, nameAr: 'سحب ترايسبس بالكيبل - مسطرة', nameEn: 'Triceps Pushdown with Straight Bar', muscles: 'عضلة الترايسبس (الرؤوس الثلاثة)', difficulty: 'متوسط', sets: 4, reps: '10-15', note: 'ألصق المرفقين بجانب جذعك، وقم بفرد الذراع بالكامل للأسفل، لا تستخدم عضلات الكتف أو الظهر لدفع الوزن.', baseline: 29 },
    ],
  },
  {
    id: 'pull_a',
    label: 'سحب أ',
    title: '🔄 يوم السحب (أ) — Pull A',
    focus: 'الظهر، الكتف الخلفي، البايسبس',
    warmup: false,
    exercises: [
      { id: 1, nameAr: 'سحب ظهر بالبار - منحني', nameEn: 'Bent-Over Barbell Row', muscles: 'المجنص (Lats)، الظهر الأوسط، الترابيس السفلى، الكتف الخلفي', difficulty: 'متوسط', sets: 4, reps: '8-12', note: 'حافظ على استقامة الظهر تماماً (متوازي تقريباً مع الأرض)، واسحب البار باتجاه السرة باستخدام عضلات الظهر، ليس الذراعين فقط.', baseline: 12 },
      { id: 2, nameAr: 'سحب عالي بالكيبل - قبضة معكوسة', nameEn: 'Underhand (Reverse Grip) Lat Pulldown', muscles: 'المجنص (الجزء السفلي)، البايسبس', difficulty: 'متوسط', sets: 4, reps: '8-12', note: 'ميل للخلف قليلاً، اسحب البار باتجاه أسفل الصدر، وركز على عصر عضلات المجنص عند النزول.', baseline: 14 },
      { id: 3, nameAr: 'سحب أرضي بالكيبل - مسطرة', nameEn: 'Seated Cable Row with Straight Bar', muscles: 'الظهر الأوسط، المجنص، الكتف الخلفي', difficulty: 'متوسط', sets: 4, reps: '8-12', note: 'حافظ على ثبات الجذع، لا تتمرجح للأمام والخلف، اسحب المسطرة لبطنك مع ضم لوحي الكتف للخلف.', baseline: 16 },
      { id: 4, nameAr: 'هز الأكتاف بالدمبل أو البار', nameEn: 'Dumbbell or Barbell Shrugs', muscles: 'عضلة الترابيس العلوية', difficulty: 'متوسط', sets: 4, reps: '12-15', note: 'ارفع الأكتاف للأعلى باتجاه الأذن بأقصى مدى، اثبت ثانية في الأعلى، ولا تقم بتدوير الأكتاف بشكل دائري.', baseline: 18 },
      { id: 5, nameAr: 'مرجحة بايسبس بالبار الزجزاج', nameEn: 'EZ Bar Biceps Curl', muscles: 'عضلة البايسبس (الرأسين)', difficulty: 'متوسط', sets: 4, reps: '8-12', note: 'ثبت المرفقين بجانب الجسم، ارفع البار للأعلى مع عصر البايسبس، وتحكم في الوزن عند النزول.', baseline: 20 },
      { id: 6, nameAr: 'مرجحة بايسبس تبادل بالدمبل - جالس', nameEn: 'Seated Alternating Dumbbell Biceps Curl', muscles: 'عضلة البايسبس، عضلة الساعد (Brachialis)', difficulty: 'متوسط', sets: 4, reps: '8-12 لكل ذراع', note: 'قم بتدوير الرسغ للأعلى عند رفع الدمبل لتحقيق أقصى انقباض لعضلة البايسبس.', baseline: 22 },
    ],
  },
  {
    id: 'legs_a',
    label: 'أرجل أ',
    title: '🦵 يوم الأرجل (أ) — Legs A',
    focus: 'الجزء السفلي بالكامل',
    warmup: true,
    exercises: [
      { id: 1, nameAr: 'رفرفة أرجل أمامي - جهاز', nameEn: 'Leg Extension', muscles: 'عضلات الفخذ الأمامية (Quads)', difficulty: 'متوسط', sets: 4, reps: '12-15', note: 'افرد الأرجل بالكامل في الأعلى واثبت لثانية، تحكم في النزول، تأكد من ضبط الجهاز ليناسب طول رجلك.', baseline: 33 },
      { id: 2, nameAr: 'سكوات / قرفصاء بالبار', nameEn: 'Barbell Squat', muscles: 'الفخذ الأمامية، الخلفية، المؤخرة، أسفل الظهر', difficulty: 'متوسط-متقدم', sets: 4, reps: '6-10', advanced: true, note: 'حافظ على استقامة الظهر وشد البطن، انزل ببطء حتى يصبح الفخذ متوازياً مع الأرض (أو أعمق)، واضغط للأعلى من خلال الكعب.', baseline: 38 },
      { id: 3, nameAr: 'مرجحة أرجل خلفي - جهاز', nameEn: 'Leg Curl (Hamstring Curl)', muscles: 'عضلات الفخذ الخلفية (Hamstrings)', difficulty: 'متوسط', sets: 4, reps: '10-15', note: 'اعصر عضلات الفخذ الخلفية بقوة في نهاية الحركة، تحكم في رجوع الوزن لوضعه الطبيعي.', baseline: 43 },
      { id: 4, nameAr: 'رفعة ميتة / ديدليفت - بار', nameEn: 'Deadlift', muscles: 'السلسلة الخلفية بالكامل وعضلات الأرجل الأمامية', difficulty: 'متقدم', sets: 4, reps: '5-8', advanced: true, note: 'هذا تمرين مركب يتطلب تكنيك مثالي. حافظ على البار قريباً جداً من جسمك، الظهر مستقيم، وادفع الأرض بقدميك لرفع الوزن.', baseline: 48 },
      { id: 5, nameAr: 'رفع السمانة - جالساً أو واقفاً', nameEn: 'Calf Raises', muscles: 'عضلات السمانة (Calves)', difficulty: 'متوسط', sets: 4, reps: '15-20', note: 'ثبت لثانية في الأعلى (انقباض)، واعمل إطالة كاملة في الأسفل، هذا التمرين يحتاج تكرارات عالية.', baseline: 53 },
    ],
  },
  {
    id: 'push_b',
    label: 'دفع ب',
    title: '💪 يوم الدفع (ب) — Push B',
    focus: 'الصدر، الكتف، الترايسبس — زوايا تركيز مختلفة',
    warmup: false,
    exercises: [
      { id: 1, nameAr: 'ضغط الصدر بالبار أو الدمبل', nameEn: 'Barbell or Dumbbell Bench Press', muscles: 'عضلة الصدر الكبرى (الوسطى)، الكتف الأمامي، الترايسبس', difficulty: 'متوسط', sets: 4, reps: '8-12', sameDay: 'نفس تفاصيل تمرين يوم الدفع (أ)', note: 'تحكم في نزول الوزن (السلبية)، واضغط للأعلى بقوة باستخدام عضلات الصدر، حافظ على قوس بسيط وآمن في أسفل الظهر.', baseline: 17 },
      { id: 2, nameAr: 'ضغط الكتف الأمامي بالبار', nameEn: 'Barbell Front Shoulder Press', muscles: 'الكتف الأمامي، الترايسبس، الصدر العلوية', difficulty: 'متوسط', sets: 4, reps: '8-12', sameDay: 'نفس تفاصيل تمرين يوم الدفع (أ)', note: 'حافظ على استقامة الظهر وشد عضلات البطن لدعم الجذع، لا تدفع رأسك للأمام بشكل مبالغ فيه عند صعود البار.', baseline: 19 },
      { id: 3, nameAr: 'رفرفة جانبية بالدمبل أو الكيبل', nameEn: 'Dumbbell or Cable Lateral Raise', muscles: 'الكتف الجانبي', difficulty: 'متوسط', sets: 4, reps: '12-15', sameDay: 'نفس تفاصيل تمرين يوم الدفع (أ)', note: 'اجعل المرفقين هما من يقودان الحركة للأعلى، لا تستخدم قوة الدفع، ركز على العزل التام.', baseline: 23 },
      { id: 4, nameAr: 'رفع طارة أمامي للكتف', nameEn: 'Front Plate Raise', muscles: 'الكتف الأمامي (عزل)', difficulty: 'متوسط', sets: 4, reps: '12-15', note: 'ارفع الطارة لمستوى الكتف ببطء، لا تتمرجح بجسمك، تحكم في النزول.', baseline: 24 },
      { id: 5, nameAr: 'سحب ترايسبس بالكيبل - حبل', nameEn: 'Triceps Rope Pushdown', muscles: 'الترايسبس (تركيز عالي على الرأس الجانبي والخارجي)', difficulty: 'متوسط', sets: 4, reps: '10-15', note: 'عند فرد الذراع للأسفل، قم بفتح طرفي الحبل للخارج لزيادة عصر عضلة الترايسبس.', baseline: 26 },
      { id: 6, nameAr: 'سحب ترايسبس بالكيبل - قبضة معكوسة', nameEn: 'Reverse Grip Triceps Pushdown', muscles: 'الترايسبس (تركيز على الرأس الإنسي/الداخلي)', difficulty: 'متوسط', sets: 4, reps: '10-15', note: 'استخدم مسطرة، واقبض عليها بيدك من الأسفل (كف اليد للأعلى)، وركز على عزل الترايسبس.', baseline: 28 },
    ],
  },
  {
    id: 'pull_b',
    label: 'سحب ب',
    title: '🔄 يوم السحب (ب) — Pull B',
    focus: 'الظهر، الكتف الخلفي، البايسبس — زوايا تركيز مختلفة',
    warmup: false,
    exercises: [
      { id: 1, nameAr: 'سحب عالي بالكيبل - أمامي، قبضة واسعة', nameEn: 'Front Lat Pulldown', muscles: 'المجنص (الجزء العلوي/الخارجي للعرض)، الظهر الأوسط', difficulty: 'متوسط', sets: 4, reps: '8-12', note: 'اسحب البار باتجاه أعلى الصدر، وحافظ على صدرك مرفوعاً للأعلى، وركز على السحب باستخدام المرفقين.', baseline: 13 },
      { id: 2, nameAr: 'سحب عالي بالكيبل - قبضة معكوسة', nameEn: 'Underhand (Reverse Grip) Lat Pulldown', muscles: 'المجنص (الجزء السفلي)، البايسبس', difficulty: 'متوسط', sets: 4, reps: '8-12', sameDay: 'نفس تفاصيل تمرين يوم السحب (أ)', note: 'ميل للخلف قليلاً، اسحب البار باتجاه أسفل الصدر، وركز على عصر عضلات المجنص عند النزول.', baseline: 14 },
      { id: 3, nameAr: 'رفرفة خلفية للكتف - جهاز أو دمبل', nameEn: 'Rear Delt Fly (Machine or Dumbbell)', muscles: 'الكتف الخلفي', difficulty: 'متوسط', sets: 4, reps: '12-15', note: 'حافظ على ثني بسيط في المرفقين، وركز تماماً على الكتف الخلفي، لا تستخدم عضلات الظهر الأوسط لرفع الوزن.', baseline: 17 },
      { id: 4, nameAr: 'رفعة ميتة - تركيز ظهر', nameEn: 'Back-Focused Deadlift', muscles: 'الظهر بالكامل، الخلفيات والمؤخرة', difficulty: 'متقدم', sets: 4, reps: '8-12', advanced: true, note: 'في هذا اليوم، نستخدم الديدليفت كتمرين للظهر أكثر من الأرجل (وزن أقل من Legs A). ركز على سحب الوزن بالظهر وتحقيق انقباض عضلي آمن.', baseline: 34 },
      { id: 5, nameAr: 'مرجحة بايسبس بالبار الزجزاج', nameEn: 'EZ Bar Biceps Curl', muscles: 'عضلة البايسبس (الرأسين)', difficulty: 'متوسط', sets: 4, reps: '8-12', sameDay: 'نفس تفاصيل تمرين يوم السحب (أ)', note: 'ثبت المرفقين بجانب الجسم، ارفع البار للأعلى مع عصر البايسبس، وتحكم في الوزن عند النزول.', baseline: 20 },
      { id: 6, nameAr: 'مرجحة بايسبس تبادل بالدمبل - جالس أو واقف', nameEn: 'Seated or Standing Alternating Dumbbell Curl', muscles: 'عضلة البايسبس، عضلة الساعد (Brachialis)', difficulty: 'متوسط', sets: 4, reps: '8-12 لكل ذراع', sameDay: 'نفس تفاصيل تمرين يوم السحب (أ)', note: 'قم بتدوير الرسغ للأعلى عند رفع الدمبل لتحقيق أقصى انقباض لعضلة البايسبس.', baseline: 22 },
    ],
  },
  {
    id: 'legs_b',
    label: 'أرجل ب',
    title: '🦵 يوم الأرجل (ب) — Legs B',
    focus: 'الجزء السفلي بالكامل — إضافة جهاز دفع الأرجل',
    warmup: true,
    exercises: [
      { id: 1, nameAr: 'رفرفة أرجل أمامي - جهاز', nameEn: 'Leg Extension', muscles: 'عضلات الفخذ الأمامية (Quads)', difficulty: 'متوسط', sets: 4, reps: '12-15', sameDay: 'نفس تفاصيل تمرين يوم الأرجل (أ)', note: 'افرد الأرجل بالكامل في الأعلى واثبت لثانية، تحكم في النزول، تأكد من ضبط الجهاز ليناسب طول رجلك.', baseline: 33 },
      { id: 2, nameAr: 'سكوات / قرفصاء بالبار', nameEn: 'Barbell Squat', muscles: 'الفخذ الأمامية، الخلفية، المؤخرة، أسفل الظهر', difficulty: 'متوسط-متقدم', sets: 4, reps: '6-10', advanced: true, sameDay: 'نفس تفاصيل تمرين يوم الأرجل (أ)', note: 'حافظ على استقامة الظهر وشد البطن، انزل ببطء حتى يصبح الفخذ متوازياً مع الأرض (أو أعمق)، واضغط للأعلى من خلال الكعب.', baseline: 38 },
      { id: 3, nameAr: 'مرجحة أرجل خلفي - جهاز', nameEn: 'Leg Curl (Hamstring Curl)', muscles: 'عضلات الفخذ الخلفية (Hamstrings)', difficulty: 'متوسط', sets: 4, reps: '10-15', sameDay: 'نفس تفاصيل تمرين يوم الأرجل (أ)', note: 'اعصر عضلات الفخذ الخلفية بقوة في نهاية الحركة، تحكم في رجوع الوزن لوضعه الطبيعي.', baseline: 43 },
      { id: 4, nameAr: 'دفع أرجل - جهاز', nameEn: 'Leg Press', muscles: 'الفخذ الأمامية (تركيز)، الخلفيات والمؤخرة', difficulty: 'متوسط', sets: 4, reps: '10-15', note: 'ضع قدميك في منتصف المنصة بعرض الكتفين، انزل بالوزن ببطء حتى تقترب ركبتيك من صدرك (زاوية 90 درجة آمنة)، ولا تقم بقفل الركبة تماماً في الأعلى.', baseline: 80 },
      { id: 5, nameAr: 'رفع السمانة - جالساً أو واقفاً', nameEn: 'Calf Raises', muscles: 'عضلات السمانة (Calves)', difficulty: 'متوسط', sets: 4, reps: '15-20', sameDay: 'نفس تفاصيل تمرين يوم الأرجل (أ)', note: 'ثبت لثانية في الأعلى (انقباض)، واعمل إطالة كاملة في الأسفل، هذا التمرين يحتاج تكرارات عالية.', baseline: 53 },
    ],
  },
];
