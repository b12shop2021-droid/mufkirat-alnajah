# الهمّة — ملخص المشروع (اقرأ هذا أولاً)

تطبيق تطوير ذاتي عربي محفّز (لهجة سعودية شبابية)، اسمه **«الهمّة»** (شعار نصي: «الهمّة حتى القمّة»)، يُرفع على منصة Manus.
> ملاحظة: الاسم القديم كان «مفكرة النجاح» وتغيّر للهمّة. مفتاح localStorage بقي `mufkirat_core_v1` (لا تغيّره).

## التقنية
React 18 + TypeScript + Vite 8 + wouter (توجيه) + localStorage (مفتاح `mufkirat_core_v1`).
PWA مفعّل (manifest + service worker). البناء: `npm run build` · التطوير: `npm run dev`.

## القواعد الصارمة (لا تُكسر)
- **النواة المركزية `src/core/useCore.tsx`** = المصدر الوحيد لكل الحالة والنقاط (XP). لا حالة مستقلة في أي صفحة.
- **أمان**: ممنوع `innerHTML`/`dangerouslySetInnerHTML` — نص `{متغير}` فقط. كل معرّف `crypto.randomUUID()`. تنظيف المدخلات عبر `clean()` (≤200 حرف) — لكن الحقول الحيّة (إدخال أثناء الكتابة) تُنظَّف عند الحفظ لا كل ضغطة.
- **الألوان**: صفر لون ثابت — الكل `var(--..)` من `:root` في `src/styles/global.css`.
- **الحذف** عبر `ConfirmDialog`. لا `prompt`/`confirm`.
- **الاحتفال** (`fireConfetti`) للإنجازات الكبيرة فقط (هدف مكتمل، رقم شخصي، حفظ جزء، إكمال يوم/قسم، ٣ شكر).
- اللهجة سعودية شبابية للرسائل — لكن **الآيات وصيغة العهد تبقى فصحى**.
- صيغة الخطاب حسب الجنس (`profile.gender`): أحسنت/أحسنتِ.

## البنية
- `src/core/useCore.tsx` — النواة (XP، الملف، السلسلة، الثيم، كل بيانات الأقسام).
- `src/core/useWorkoutTimer.tsx` — مؤقت بـ timestamp.
- `src/components/` — XPBar, BottomNav, BackButton, ConfirmDialog, Confetti.
- `src/pages/` — الصفحات (محمّلة كسولاً عبر lazy في App.tsx).
- `src/data/workoutDays.ts` — بيانات جدول الكابتن سعود الستة.
- `src/pwa.ts` — تسجيل SW + التثبيت.

## الصفحات والمسارات
الرئيسية `/` · الـhub `/more` · الروتين `/routine` · الأهداف `/goals` · المزاج `/mood` ·
الملاحظات+الشكر `/notes` · القرآن+التقويم `/quran` · (النوم مدمج في الروتين المسائي `/routine`، ودائرة التواصل مدمجة في `/occasions`) ·
تطوير الذات (هوية+دستور+مراجعة) `/self-dev` · إنجازاتي (سلسلة+معرض+محطات) `/achievements` ·
التحليلات `/analytics` · العهود+صندوق الزمن `/pledges` · المصاريف `/expenses` ·
الوجبات `/meals` · التمارين (كابتن+جدولي+إرشادات) `/workouts` · الإعدادات `/settings`.
بوابة: تسجيل دخول → شاشة ترحيب (onboarding) → التطبيق.

## تبويبات الـhub
☀️ حياتي · 🔥 التزامي · 🌱 تطوّري · 🏆 فخري · 🛡️ العهود (بارز).

## الحالة الحالية (محدّثة — آخر جلسة)
كل الصفحات مكتملة. 0 ثغرات (`npm audit`)، البناء نظيف (`tsc + vite`). أُنجز مؤخراً:
- **نِيّة اليوم (Daily Intention)**: `state.dailyIntention {date,text}` + `core.setDailyIntention` (تنظيف `clean`، +5 XP وكونفيتي أول مرة باليوم) + بطاقة بالرئيسية (`.intent-card`، لهجة سعودية) قبل شارة إنجاز اليوم.
- **إصلاح إشعارات**: إعادة جدولة `scheduleNotifications` تلقائياً عند فتح التطبيق (effect في `App.tsx` يعتمد على `notifMaster`+`notifItems`) — قبل كانت تتجدول فقط من زر الإعدادات. + زر طلب إذن في صفحة `/notifications` (`requestNotifPermission`).
- **تغيير الاسم** «مفكرة النجاح» → «الهمّة» في كل مكان (manifest, index.html, الرئيسية, hub, الإعدادات, الإشعارات, البومودورو, نص مشاركة Wrapped). الشعار النصي «الهمّة حتى القمّة» في الدخول والترحيب (`.auth-slogan`).
- **ترحيب حسب التوقيت + نجوم متلألئة** في هيرو الرئيسية (`.home-hero-greet`, `.hero-star`, `.home-hero.night`). الافتراضي للترحيب `'بطل'` (لتفادي «يا يا بطل»).
- **نظام تصميم موحّد**: مكوّن `src/components/PageHero.tsx` + توكنز تدرّجات في `:root` (`--grad-primary/deep/night/sunset/calm`) + كلاس `.page-hero`. مطبّق على: الإرشادات، صمّم تمارينك، السلسلة، النوم، الإعدادات.
- **نظام تحفيز على كل الصفحات**: مكوّن `src/components/XPToast.tsx` + `fireXP` مربوط داخل `addXP` في النواة (قمع واحد → توست بكل صفحة + كونفيتي عند صعود المستوى، عبر `xpRef` لتفادي ازدواج StrictMode).
- **تحدّي أسبوعي عشوائي**: `src/data/weeklyChallenges.ts` + `state.weeklyChallenge` + `core.weekly` + `core.completeWeeklyChallenge` + بطاقة بالرئيسية (`.weekly-card`).
- **تجميل لوني**: `--bg #f5f8f8`, `--border #e7edec`, `--text-secondary #6c7a7c`, ظلال أغنى، تدرّج محيطي على `#root`. أصلحت `--deep-2` (كان يشير لنفسه).
- **لهجة سعودية**: رسائل تأكيد الحذف (12 صفحة) + حالات فارغة + تلميحات (مثل «متأكد تبي تحذف...»). حُذفت مناسبة عيد الميلاد من Occasions.

## الأيقونات (مهم — محدّث)
- **أيقونة التطبيق**: `public/icon.svg` تدمج الشعار الذهبي على خلفية متدرّجة غامقة.
- **السبرايت**: استُبدل `icons-sprite.png` بـ`public/icons-sprite.webp` (43KB، 6×3 شفاف). الـCSS يشير لـ`url('/icons-sprite.webp')`. يستخدمه الشريط السفلي و`Hub`.
- **بلاطات الرئيسية (9)**: ملفات webp مستقلة في `public/icons/` (more, routine, goals, expenses, workouts, meals, analytics, pledges, achievements). العرض يدعم الصور عبر `icon.startsWith('/')`. `BottomNav` يدعم `img` أيضاً.
- **صور الكابتن**: `public/workouts/{push_a,pull_a,legs_a,push_b,pull_b,legs_b}.webp` — حقل `image` في `workoutDays.ts`، تُعرض أعلى كل يوم في `CaptainWorkout.tsx` (`.day-infographic`).

## النشر على Manus
- ملف الرفع جاهز: `C:\Users\asus\Desktop\alhimmah-app.zip` (بدون node_modules/.git/dist).
- برومبت Manus الكامل أُعطي للمستخدم (يبني + ينشر + يربط مصادقة/قاعدة بيانات لكل مستخدم بدل localStorage + رفع الصور لتخزين Manus).

## ملاحظات بيئية (هذه الجلسة فقط)
- HMR websocket يفشل أحياناً → أعِد التحميل يدوياً (Ctrl+Shift+R). أداة لقطة الشاشة (preview_screenshot) تتعلّق — اعتمد التحقق عبر DOM (`preview_eval`).

## المتبقّي (أفكار)
- ربط Manus (مصادقة + قاعدة بيانات + تخزين صور) — لم يُنفَّذ بعد (المستخدم يرفع الـZIP لـManus).

## تكامل Manus (مهم)
- المصادقة وقاعدة البيانات والصور تُربط من Manus — التفاصيل في `docs/04-تكامل-Manus-المصادقة-والصور.md`.
- اربط حفظ/تحميل `useCore` بقاعدة بيانات لكل مستخدم بدل localStorage.
- الصور: ارفعها لتخزين Manus واحفظ الرابط بدل base64.

## قاعدة العمل لتفادي التعارض
GitHub هو المصدر الوحيد. لا يعدّل طرفان (أنا + Manus) نفس الملفات بنفس الوقت.
