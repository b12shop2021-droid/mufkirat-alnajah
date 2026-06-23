# مفكرة النجاح

تطبيق تطوير ذاتي عربي محفّز، مبني بـ **React + TypeScript + Vite + wouter**، يُرفع لاحقاً على منصة Manus.

## التشغيل محلياً

```bash
npm install
npm run dev        # خادم التطوير
npm run build      # بناء الإنتاج إلى dist/
npm run preview    # معاينة بناء الإنتاج
```

## البنية

```
src/
├── main.tsx              # نقطة الدخول
├── App.tsx               # الجذر والتوجيه
├── core/
│   ├── useCore.tsx       # النواة المركزية (XP، الملف، السلسلة، الثيم) — المصدر الوحيد للحالة
│   └── useWorkoutTimer.tsx  # مؤقت تصاعدي بـ timestamp
├── styles/
│   └── global.css        # كل الألوان متغيرات :root — صفر لون ثابت
└── components/           # المكوّنات المشتركة
    ├── XPBar.tsx
    ├── ConfirmDialog.tsx
    ├── BottomNav.tsx
    ├── BackButton.tsx
    └── Confetti.tsx
```

## مبادئ الأمان والجودة المعتمدة

- ممنوع `innerHTML` / `dangerouslySetInnerHTML` — كل النصوص عبر `{متغير}` (ضد XSS).
- كل المعرّفات بـ `crypto.randomUUID()`.
- تنظيف كل مدخل: `trim` + توحيد المسافات + حد أقصى 200 حرف + منع القيم السالبة وحصر الأرقام.
- نظام نقاط (XP) موحّد واحد عبر `useCore()` — لا حالة مستقلة في أي صفحة.
- كل CSS مشترك في `global.css` — صفر تكرار، كل لون من `:root`.
- كل حذف/إجراء حسّاس عبر `ConfirmDialog` (لا `confirm`/`prompt`).
- صفر ثغرات أمنية في التبعيات (`npm audit`).
