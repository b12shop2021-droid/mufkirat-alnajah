/* ===================================================================
   Guidelines.tsx — إرشادات أساسية قبل البدء (نظام المدرب سعود)
   محتوى ثابت منقول حرفياً + خانة صورة قابلة للرفع. الصورة عبر useCore.
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../core/useCore';
import BackButton from '../components/BackButton';

const MAX_IMAGE_BYTES = 1_500_000;

export default function Guidelines({ embedded = false }: { embedded?: boolean }) {
  const core = useCore();
  const [hint, setHint] = useState<string | null>(null);

  /* رفع صورة الإرشادات مع التحقق من النوع والحجم */
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setHint('⚠️ الملف المختار ليس صورة');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setHint('⚠️ حجم الصورة كبير (الحد 1.5 ميجابايت)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') core.setGuidelinesImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="page">
      {!embedded && <BackButton />}

      <div className="hero">
        <div className="hero-icon">💪</div>
        <div className="hero-title">إرشادات أساسية قبل البدء</div>
        <div className="hero-sub">
          نظام المدرب سعود يستهدف عضلات الجسم المختلفة في اليوم نفسه لتحقيق نتائج
          مضاعفة، مع التركيز على تجنب الإصابات والاستماع إلى إشارات الجسم.
        </div>
      </div>

      <div className="warn-note">
        ⚠️ <span>يجب التوقف فوراً عن أي تمرين يسبب ألماً في المفاصل أو الأوتار.</span>
      </div>

      <div className="card">
        <div className="guide-card-head">
          <div className="guide-icon">🔥</div>
          <div className="guide-title">التسخين الإجباري</div>
        </div>
        <div className="guide-body">
          <ul>
            <li><strong>10 دقائق</strong> كارديو متوسط الشدة لرفع حرارة الجسم.</li>
            <li>جولة واحدة للعضلة المستهدفة بوزن خفيف جداً (<strong>20 تكرار</strong>).</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="guide-card-head">
          <div className="guide-icon">🗓️</div>
          <div className="guide-title">جدول التمرين</div>
        </div>
        <div className="guide-body">
          <ul>
            <li>إذا كنت تتدرب <strong>3 أيام</strong> أسبوعياً، أكمل الأيام المتبقية في الأسبوع التالي.</li>
            <li>إذا كنت تتدرب <strong>5 أيام</strong>، أجّل اليوم السادس للأسبوع التالي لتجنب إجهاد الجسم.</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="guide-card-head">
          <div className="guide-icon">🧘</div>
          <div className="guide-title">تمارين الاستشفاء</div>
        </div>
        <div className="guide-body">
          <ul>
            <li>لا تهمل تمارين <strong>الإطالة</strong> لتقليل آلام ما بعد التمرين.</li>
            <li>راجع الأوزان وزِدها بشكل <strong>دوري وآمن</strong>.</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="guide-card-head">
          <div className="guide-icon">⏱️</div>
          <div className="guide-title">أوقات الراحة</div>
        </div>
        <div className="guide-body">
          <strong>دقيقة كاملة كحد أدنى</strong> بين كل جولة لضمان الأداء الفعال بأوزان قوية.
        </div>
      </div>

      <div className="card">
        <div className="guide-card-head">
          <div className="guide-icon">🏃</div>
          <div className="guide-title">الكارديو</div>
        </div>
        <div className="guide-body">
          <ul>
            <li>يمكن أداؤه <strong>صباحاً</strong> (مشي سريع 40 دقيقة) أو <strong>بعد التمرين</strong> مباشرة (20 دقيقة).</li>
            <li>في حال عدم القدرة عليه صباحاً، يمكن تعويضه مساءً لمدة <strong>25 دقيقة</strong>.</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="guide-card-head">
          <div className="guide-icon">🏋️</div>
          <div className="guide-title">الوزن الفعال</div>
        </div>
        <div className="guide-body">
          ابدأ بوزن خفيف في الجولات الأولى، ثم زد الوزن تدريجياً حتى تصل إلى الوزن
          الذي يسمح لك بأداء التكرارات المحددة <strong>بصعوبة مناسبة</strong>.
        </div>
      </div>

      <div className="card">
        <div className="guide-card-head">
          <div className="guide-icon">🦵</div>
          <div className="guide-title">تسخين خاص بيوم الأرجل</div>
        </div>
        <div className="guide-body">
          <strong>10 دقائق</strong> تسخين للرجل + <strong>5 دقائق</strong> إطالات للجسم كاملاً.
        </div>
        <label className="img-slot">
          {core.state.guidelinesImage ? (
            <img src={core.state.guidelinesImage} alt="صورة توضيحية" />
          ) : (
            <>
              <div style={{ fontSize: '1.8rem', opacity: 0.5 }}>🏋️</div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                اضغط لرفع صورة توضيحية
              </div>
            </>
          )}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
        </label>
      </div>

      <div className="section-label">إضافات احترافية متقدمة</div>

      <div className="card">
        <div className="guide-card-head">
          <span className="num-badge">١</span>
          <div className="guide-title">تمارين البطن الأساسية (Core Training)</div>
        </div>
        <div className="guide-body">
          <ul>
            <li><strong>البلانك (Plank):</strong> 3 جولات × 30-60 ثانية.</li>
            <li><strong>رفع الأرجل المعلقة:</strong> 3 جولات × 10-15 عدة.</li>
            <li><strong>الدراجة الهوائية (Bicycle Crunches):</strong> 3 جولات × 15-20 عدة لكل جانب.</li>
          </ul>
          <div className="example-box">💡 التوصية: أضف هذه التمارين في نهاية أيام Legs A و Legs B.</div>
        </div>
      </div>

      <div className="card">
        <div className="guide-card-head">
          <span className="num-badge">٢</span>
          <div className="guide-title">تمارين الإحماء الديناميكي</div>
        </div>
        <div className="guide-body">
          <ul>
            <li>دورانات الكتفين: 10 تكرارات للأمام والخلف.</li>
            <li>دورانات الجذع: 10 تكرارات لكل جانب.</li>
            <li>القطة والبقرة (Cat-Cow): 8 تكرارات.</li>
            <li>طعنات المشي بدون وزن: 10 خطوات لكل رجل.</li>
            <li>القفز بالحبل (Jumping Jacks): 30 ثانية.</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="guide-card-head">
          <span className="num-badge">٣</span>
          <div className="guide-title">تقنيات متقدمة لتجاوز مرحلة الثبات</div>
        </div>
        <div className="guide-body">
          <ul>
            <li><strong>مجموعات الإسقاط (Drop Sets):</strong> بعد الفشل العضلي، خفف الوزن 20-30% واستمر بدون راحة.</li>
            <li><strong>التكرارات السلبية (Negatives):</strong> ركز على الجزء الهابط من الحركة لمدة 3-5 ثوانٍ.</li>
            <li><strong>الراحة المؤقتة (Rest-Pause):</strong> بعد الفشل، استرح 15 ثانية ثم أكمل 2-3 تكرارات إضافية.</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="guide-card-head">
          <span className="num-badge">٤</span>
          <div className="guide-title">نموذج تتبع الأداء (Progressive Overload)</div>
        </div>
        <div className="guide-body">
          سجل الأوزان والتكرارات أسبوعياً لكل تمرين. إذا استطعت أداء{' '}
          <strong>12 تكراراً بسهولة</strong> في جميع الجولات، زد الوزن بنسبة{' '}
          <strong>2.5-5%</strong> في الجلسة التالية.
          <div className="example-box">
            📌 مثال: بنش بريس 50 كجم × 12 تكرار في 3 جولات بسهولة؟ ارفع الوزن إلى 52.5 كجم في الجلسة القادمة.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="guide-card-head">
          <span className="num-badge">٥</span>
          <div className="guide-title">جدول تغذية مبسط</div>
        </div>
        <div className="guide-body">
          <ul>
            <li><strong>قبل التمرين (30-60 دقيقة):</strong> كربوهيدرات سريعة + بروتين (مثال: موزة + سكوب واي بروتين).</li>
            <li><strong>بعد التمرين (خلال 30 دقيقة):</strong> بروتين + كربوهيدرات (مثال: 150 جم دجاج + 200 جم أرز).</li>
            <li><strong>الترطيب:</strong> اشرب 500-750 مل ماء خلال ساعة التمرين على شكل رشفات.</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ textAlign: 'center' }}>
        <div className="formal-text" style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 700, lineHeight: 1.8 }}>
          بالتوفيق في تمرينك يا بطل! حافظ على التكنيك الصحيح والاستمرارية. رحلتك للنجاح تبدأ من هنا 💪
        </div>
      </div>

      {hint && <div className="hint-msg warn">{hint}</div>}
    </div>
  );
}
