---
name: alhimmah-manus-deploy
description: |
  ترحيل تطبيق «الهمّة» (React + Vite + localStorage) إلى Manus WebDev بأسرع وقت:
  نشر مباشر + مصادقة Manus OAuth + قاعدة بيانات لكل مستخدم + تخزين صور سحابي.
  هذا التطبيق يخزّن كل حالته في كائن JSON واحد، فالربط في نقطة واحدة فقط — لا تبنِ سكيما مفصّلة.
---

# الهمّة → Manus (سكِل نشر سريع)

> اقرأ هذا الملف كاملاً قبل البدء. هذا التطبيق مُحلَّل مسبقاً — لا تعيد استكشافه.
> المصدر يصل عبر **ZIP**: `alhimmah-app.zip`. كل المعلومات الحرجة هنا. الهدف: **أسرع نشر صحيح**.

## حقائق ثابتة عن التطبيق (لا تخمّن)
- React 18 + TypeScript + Vite 8 + wouter (توجيه) + PWA. البناء `npm run build`.
- **كل الحالة كائن واحد** اسمه `CoreState` في `src/core/useCore.tsx`، يُحفظ كنص JSON واحد
  في localStorage تحت المفتاح **`mufkirat_core_v1`** (لا تغيّره، لا تطبّع/normalize الحالة).
- المصدر الوحيد للحالة: `useCore.tsx`. نقطتا الربط **الوحيدتان**:
  - التحميل: دالة `loadState()` (≈ سطر 451).
  - الحفظ: `useEffect` يكتب `localStorage.setItem(STORAGE_KEY, JSON.stringify(state))` (≈ سطر 656).
- البوابة: `login()`/`logout()` + الحقل `state.session` في النواة. واجهة الدخول `src/pages/Login.tsx`.
- **قواعد صارمة لا تُكسر**: صفر `innerHTML`/`dangerouslySetInnerHTML`؛ كل لون `var(--..)` من `src/styles/global.css`؛
  كل معرّف `crypto.randomUUID()`. لا تعيد كتابة المنطق — فقط استبدل طبقة التخزين.

---

## المرحلة 1 — نقل الكود (≈15 دقيقة)
```bash
unzip alhimmah-app.zip -d /tmp/alhimmah
# انسخ شجرة src و public كما هي (الهيكل سليم، لا تعيد ترتيبه)
cp -r /tmp/alhimmah/src/*    /home/ubuntu/{project}/client/src/
cp -r /tmp/alhimmah/public/* /home/ubuntu/{project}/client/public/
cp /tmp/alhimmah/index.html  /home/ubuntu/{project}/client/index.html
```
ثبّت الاعتماديات المستخدمة فعلاً:
```bash
cd /home/ubuntu/{project}
pnpm add wouter adhan recharts html-to-image
pnpm check && pnpm build   # يجب أن يمر tsc + vite نظيفاً
```
> إصلاح مسارات الاستيراد فقط لو لزم (`../x` → `@/x`). لا تلمس منطق المكوّنات.

---

## المرحلة 2 — قاعدة البيانات (≈10 دقائق) — جدول واحد فقط
الحالة كائن JSON واحد، فلا تبنِ جداول لكل قسم. أنشئ جدول blob واحد:
```ts
// drizzle/schema.ts
export const appState = mysqlTable("app_state", {
  userId: int("userId").primaryKey(),          // مستخدم واحد = صف واحد
  data: json("data").notNull(),                // كائن CoreState كامل (نفس شكل mufkirat_core_v1)
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```
```bash
pnpm drizzle-kit generate
webdev_execute_sql --query "$(cat drizzle/migrations/0001_*.sql)"
```

---

## المرحلة 3 — المصادقة (Manus OAuth) (≈20 دقيقة)
1. في `src/pages/Login.tsx`: استبدل نموذج الدخول الحالي بزر OAuth.
   - بعد نجاح المصادقة، استدعِ **`core.login(email)`** الموجود لفتح البوابة (لا تغيّر منطق البوابة).
2. لفّ الشجرة بـ`CoreProvider` (موجود في `useCore.tsx`) — تأكد أنه يغلّف كل المسارات في `App.tsx`.
3. الـonboarding يبقى كما هو؛ فقط تأكد أنه يعمل بعد المصادقة.

---

## المرحلة 4 — الربط (أهم مرحلة، نقطة واحدة) (≈30 دقيقة)
استبدل localStorage بالـDB **داخل `useCore.tsx` فقط**. لا تلمس بقية الصفحات.

1. tRPC procedures (محميّة):
```ts
core: router({
  getState: protectedProcedure.query(({ ctx }) => getUserState(ctx.user.id)),
  saveState: protectedProcedure.input(z.any())
    .mutation(({ ctx, input }) => saveUserState(ctx.user.id, input)),
})
```
2. helpers في `server/db.ts`:
```ts
export async function getUserState(userId:number){
  const r = await (await getDb()).select().from(appState).where(eq(appState.userId,userId)).limit(1);
  return r[0]?.data ?? null;            // null = مستخدم جديد → النواة تستخدم DEFAULT_STATE
}
export async function saveUserState(userId:number, data:any){
  await (await getDb()).insert(appState).values({userId,data})
    .onDuplicateKeyUpdate({ set:{ data } });
}
```
3. في `useCore.tsx`:
   - **`loadState()`**: بدل قراءة localStorage، اقرأ من `trpc.core.getState`. لو رجّع `null` استخدم `DEFAULT_STATE`.
     احتفظ بكل دمج الحقول الاحتياطي الموجود (`...DEFAULT_STATE, ...parsed`) — انسخ نفس المنطق على بيانات الـDB.
   - **`useEffect` الحفظ** (≈656): بدل `localStorage.setItem(...)` نادِ `trpc.core.saveState.mutate(state)`
     مع debounce ~800ms (الحالة كبيرة وتتغير كثير). أبقِ تحديثاً تفاؤلياً فورياً في الواجهة.
> ملاحظة: المفاتيح المساعدة الصغيرة (`mufkirat_pin_hash`, `alhimmah_last_seen`, `alhimmah_harvest_*`)
> تبقى في localStorage — محلية بالجهاز ولا تحتاج ترحيل.

---

## المرحلة 5 — الصور (≈20 دقيقة)
المشكلة الوحيدة: الصور تُخزَّن base64 داخل الحالة. بعد الربط بالـDB قد تكبر الصفوف.
استبدل `FileReader → base64` برفع لتخزين Manus وحفظ **الرابط (URL)** بدل النص، في **٣ أماكن فقط**:
- `src/pages/CaptainWorkout.tsx` (`setWorkoutImage`)
- `src/pages/CustomWorkout.tsx` (`setCustomDayImage`)
- `src/pages/Guidelines.tsx` (`setGuidelinesImage`)
الأصول الثابتة (لا ترفعها لقاعدة البيانات، ضعها في تخزين Manus الثابت وحدّث المسارات لو لزم):
```bash
cd /home/ubuntu/{project}/client/public
manus-upload-file --webdev fonts/*.woff2 icons/*.webp workouts/*.webp *.png
```
> الخطوط (`public/fonts/*.woff2`)، أيقونات webp (`public/icons/*`)، صور الكابتن (`public/workouts/*.webp`)،
> أيقونات PWA (`icon-192/512.png`, `apple-touch-icon.png`) — كلها أصول ثابتة.

---

## المرحلة 6 — تحقق (≈15 دقيقة)
- [ ] دخول OAuth → يعود للتطبيق وتُحمَّل بيانات المستخدم.
- [ ] أنشئ/عدّل بيانات → حدّث الصفحة → البيانات باقية (تُقرأ من الـDB).
- [ ] الصور تُعرض (روابط Manus، لا 404).
- [ ] PWA: manifest + service worker يعملان.
- [ ] الستايل/الثيمات تشتغل (متغيرات `var(--..)`).
```bash
tail -50 /home/ubuntu/{project}/.manus-logs/browserConsole.log
tail -50 /home/ubuntu/{project}/.manus-logs/devserver.log
```
ثم: `webdev_save_checkpoint`.

## أخطاء شائعة
- «useCore must be used within CoreProvider» → غلّف الشجرة بـ`CoreProvider` في `App.tsx`.
- «Please login (10001)» → تأكد أن المستخدم مصادق قبل نداء procedures المحميّة.
- بيانات لا تُحفظ → تأكد أن `saveState.mutate` يُستدعى فعلاً من useEffect وأن debounce لا يبتلع آخر تغيير.

## القرار السريع (لِمَ هذا أسرع)
| سؤال | جواب |
|------|------|
| سكيما مفصّلة لكل قسم؟ | ❌ — جدول `app_state` واحد (JSON blob). الحالة كائن واحد أصلاً. |
| كم نقطة ربط بالكود؟ | ٢ فقط: `loadState()` + `useEffect` الحفظ في `useCore.tsx`. |
| الصور؟ | ٣ ملفات فقط (workout/custom/guidelines) + رفع الأصول الثابتة. |
| لوحة تحكم للصور؟ | ❌ — الرفع مبني داخل التطبيق. |
