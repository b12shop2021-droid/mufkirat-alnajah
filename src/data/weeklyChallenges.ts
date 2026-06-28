/* ===================================================================
   weeklyChallenges.ts — قائمة التحدّيات الأسبوعية (تطوير ذاتي، لهجة شبابية)
   يُختار تحدٍّ واحد لكل أسبوع بطريقة ثابتة-عشوائية (نفس التحدّي طوال الأسبوع،
   يتغيّر تلقائياً مع بداية أسبوع جديد). كل تحدٍّ يمنح نقاطاً عند إتمامه.
   =================================================================== */

export interface WeeklyChallengeDef {
  emoji: string;
  title: string;
  hint: string;
  reward: number;
}

export const WEEKLY_CHALLENGES: WeeklyChallengeDef[] = [
  { emoji: '📵', title: 'قلّل الجوال ساعة يومياً', hint: 'حدّد وقتاً بلا شاشات وعِشه بحضور كامل', reward: 30 },
  { emoji: '🌅', title: 'صلِّ الفجر في وقته ٥ أيام', hint: 'بداية اليوم الصح تفرق في كل شي بعدها', reward: 30 },
  { emoji: '📖', title: 'اقرأ ١٠ صفحات يومياً', hint: 'كتاب يطوّرك — صفحات بسيطة تبني عقلاً كبيراً', reward: 30 },
  { emoji: '🚶', title: 'امشِ ٣٠ دقيقة × ٣ مرات', hint: 'حركتك طاقتك — لا تستهين بالمشي', reward: 30 },
  { emoji: '💧', title: 'اشرب ٨ أكواب ماء يومياً', hint: 'جسمك يستاهل، والتركيز يبدأ من الترطيب', reward: 25 },
  { emoji: '🌙', title: 'نَم قبل منتصف الليل ٤ ليالٍ', hint: 'النوم الباكر استثمار في يومك الجاي', reward: 30 },
  { emoji: '🤝', title: 'تواصل مع شخص تحبه', hint: 'كلّم أحداً اشتقت له وما تواصلت معه من زمان', reward: 25 },
  { emoji: '🧹', title: 'رتّب مساحتك بالكامل', hint: 'مكان مرتّب = ذهن صافي وإنتاجية أعلى', reward: 25 },
  { emoji: '🍬', title: 'جرّب أسبوعاً بأقل سكر', hint: 'قلّل المشروبات والحلى — بتحس بالفرق', reward: 30 },
  { emoji: '🧘', title: 'ابدأ صباحك بـ١٠ دقائق تنفّس', hint: 'هدوء بسيط الصبح يضبط مزاجك لطول اليوم', reward: 25 },
  { emoji: '💸', title: 'راجع مصاريفك ووفّر بنداً', hint: 'اكتشف وين يروح فلوسك وقصّ بنداً غير ضروري', reward: 25 },
  { emoji: '🎯', title: 'أنجز أصعب مهمة أول النهار', hint: 'كُل الضفدع الصبح — والباقي يصير سهل', reward: 30 },
  { emoji: '🙏', title: 'اكتب ٣ امتنانات كل يوم', hint: 'الامتنان يدرّب عقلك يشوف الجميل حولك', reward: 25 },
  { emoji: '🌱', title: 'تعلّم مهارة صغيرة جديدة', hint: 'فيديو أو درس قصير — أضف شيئاً لرصيدك', reward: 30 },
  { emoji: '❤️', title: 'تصدّق ولو بمبلغ بسيط', hint: 'العطاء يكبّر القلب ويبارك في الرزق', reward: 25 },
  { emoji: '✍️', title: 'اكتب أهدافك للشهر القادم', hint: 'وضوح الوجهة نص الطريق', reward: 30 },
];

/* معرّف أسبوع ثابت (ISO) — 'YYYY-Www' */
export function isoWeekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/* فهرس ثابت-عشوائي مشتق من معرّف الأسبوع (نفس النتيجة طوال الأسبوع) */
export function weekChallengeIndex(weekKey: string): number {
  let h = 0;
  for (let i = 0; i < weekKey.length; i++) h = (h * 31 + weekKey.charCodeAt(i)) >>> 0;
  return h % WEEKLY_CHALLENGES.length;
}
