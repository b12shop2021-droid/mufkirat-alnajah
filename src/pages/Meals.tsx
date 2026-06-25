/* ===================================================================
   Meals.tsx — الوجبات
   إدخال وجبات + "أكلاتي المفضلة" (اختيار من وجبات سابقة بضغطة)،
   متتبع ماء، هدف سعرات، ربط تغذية أيام التمرين، تنبيه وجبة منسية.
   كل الحالة عبر useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import { useCore, todayStr, type MealType, type FavoriteMeal } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';

const TYPES: MealType[] = ['إفطار', 'غداء', 'عشاء', 'وجبة خفيفة'];

const dateBefore = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Meals() {
  const core = useCore();
  const s = core.state;
  const today = todayStr();

  const [form, setForm] = useState({
    type: 'إفطار' as MealType,
    name: '',
    ingredients: '',
    calories: '',
    notes: '',
  });
  const [saveFav, setSaveFav] = useState(false);
  const [goalInput, setGoalInput] = useState(String(s.calorieGoal));
  const [hint, setHint] = useState<string | null>(null);
  const [deleteMeal, setDeleteMeal] = useState<{ id: string; label: string } | null>(null);
  const [deleteFav, setDeleteFav] = useState<{ id: string; label: string } | null>(null);

  const todayMeals = s.meals.filter((m) => m.date === today);
  const todayCalories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const water = s.waterLog.find((w) => w.date === today)?.cups ?? 0;
  const workoutToday = s.workoutLogs.some((l) => l.date === today);

  /* تنبيه وجبة منسية: بعد 14:00 بدون غداء مسجّل */
  const lunchMissing =
    new Date().getHours() >= 14 && !todayMeals.some((m) => m.type === 'غداء');

  /* احتفال أسبوع غذائي مكتمل: 7 أيام متتالية فيها إفطار+غداء+عشاء */
  const weekComplete = Array.from({ length: 7 }, (_, i) => dateBefore(i)).every((d) => {
    const dm = s.meals.filter((m) => m.date === d);
    return ['إفطار', 'غداء', 'عشاء'].every((t) => dm.some((m) => m.type === t));
  });

  const handleAdd = () => {
    if (form.name.trim() === '') {
      setHint('⚠️ اكتب اسم الوجبة أولاً');
      return;
    }
    core.addMeal(
      {
        date: today,
        type: form.type,
        name: form.name,
        ingredients: form.ingredients,
        calories: Number(form.calories) || 0,
        notes: form.notes,
      },
      saveFav,
    );
    setForm({ ...form, name: '', ingredients: '', calories: '', notes: '' });
    setSaveFav(false);
    setHint('🍽️ سجّلنا وجبتك، صحتين');
  };

  /* اختيار وجبة مفضلة → تعبئة النموذج لتعديلها قبل الإضافة */
  const pickFavorite = (f: FavoriteMeal) => {
    setForm({
      type: f.type,
      name: f.name,
      ingredients: f.ingredients,
      calories: f.calories ? String(f.calories) : '',
      notes: '',
    });
    setHint('✏️ عُبّئت من المفضلة — عدّلها ثم أضِف');
  };

  return (
    <div className="page">
      <BackButton />
      <XPBar />

      <h1 className="section-title">🍽️ الوجبات</h1>

      {/* السعرات اليومية */}
      <div className="card">
        <div className="cal-ring">
          <div>
            <div className="cal-big">{todayCalories}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              سعرة اليوم من أصل {s.calorieGoal}
            </div>
          </div>
          <div className="progress-track" style={{ flex: 1 }}>
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, s.calorieGoal ? (todayCalories / s.calorieGoal) * 100 : 0)}%` }}
            />
          </div>
        </div>
        <div className="add-row">
          <input
            className="input-field" type="number" min={0} placeholder="هدف السعرات"
            value={goalInput} onChange={(e) => setGoalInput(e.target.value)}
          />
          <button className="btn-ghost" onClick={() => { core.setCalorieGoal(Number(goalInput) || 0); setHint('🎯 حُدّث الهدف'); }}>
            حفظ الهدف
          </button>
        </div>
      </div>

      {/* متتبع الماء */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 4 }}>💧 الماء ({water}/8 أكواب)</div>
        <div className="water-row">
          {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={n <= water ? 'water-cup filled' : 'water-cup'}
              aria-label={`كوب ${n}`}
              onClick={() => core.setWaterCups(n === water ? n - 1 : n)}
            >
              💧
            </button>
          ))}
        </div>
      </div>

      {/* تنبيهات */}
      {lunchMissing && (
        <div className="hint-msg warn">🍽️ لم تسجّل وجبة الغداء بعد — لا تنسَ غذاءك!</div>
      )}
      {weekComplete && (
        <div className="zero-day-card">
          <div style={{ fontSize: '1.8rem' }}>🎉</div>
          <div style={{ fontWeight: 800, marginTop: 6 }}>أسبوع غذائي مكتمل! 7 أيام منتظمة</div>
        </div>
      )}

      {/* ربط تغذية يوم التمرين */}
      {workoutToday && (
        <div className="intro-card" style={{ textAlign: 'right' }}>
          🏋️ <strong>تغذية يوم التمرين:</strong>
          <br />• قبل التمرين: موزة + سكوب واي بروتين.
          <br />• بعد التمرين: 150 جم دجاج + 200 جم أرز.
        </div>
      )}

      {/* أكلاتي المفضلة */}
      {s.favoriteMeals.length > 0 && (
        <>
          <h2 className="section-title">⭐ أكلاتي المفضلة</h2>
          <div className="fav-wrap">
            {s.favoriteMeals.map((f) => (
              <span className="fav-chip" key={f.id}>
                <button className="fav-pick" onClick={() => pickFavorite(f)}>
                  {f.name} {f.calories ? `(${f.calories})` : ''}
                </button>
                <button
                  className="fav-del"
                  aria-label="حذف من المفضلة"
                  onClick={() => setDeleteFav({ id: f.id, label: f.name })}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </>
      )}

      {/* نموذج الإضافة */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 8 }}>➕ إضافة وجبة</div>
        <select
          className="input-field" style={{ marginBottom: 10 }}
          value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as MealType })}
        >
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          className="input-field" placeholder="اسم الوجبة" maxLength={200} style={{ marginBottom: 10 }}
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="input-field" placeholder="المكونات" maxLength={200} style={{ marginBottom: 10 }}
          value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
        />
        <input
          className="input-field" type="number" min={0} placeholder="السعرات" style={{ marginBottom: 10 }}
          value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })}
        />
        <textarea
          className="input-field" rows={2} placeholder="ملاحظات (اختياري)" maxLength={200}
          value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0', fontSize: '0.82rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={saveFav} onChange={(e) => setSaveFav(e.target.checked)} />
          ⭐ احفظها في "أكلاتي المفضلة" لاختيارها لاحقاً بضغطة
        </label>
        <button className="btn-primary" style={{ width: '100%' }} onClick={handleAdd}>
          إضافة الوجبة
        </button>
      </div>

      {/* وجبات اليوم */}
      <h2 className="section-title">وجبات اليوم</h2>
      {todayMeals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          🍽️ لا وجبات مسجّلة اليوم
        </div>
      ) : (
        todayMeals.map((m) => (
          <div className="meal-item" key={m.id}>
            <div className="meal-info">
              <div className="meal-name">{m.name}</div>
              <div className="meal-meta">
                {m.type}{m.ingredients ? ` · ${m.ingredients}` : ''}
              </div>
            </div>
            {m.calories > 0 && <div className="meal-cal">{m.calories} سعرة</div>}
            <button className="icon-btn" aria-label="حذف" onClick={() => setDeleteMeal({ id: m.id, label: m.name })}>
              🗑️
            </button>
          </div>
        ))
      )}

      {hint && <div className="hint-msg ok">{hint}</div>}

      <ConfirmDialog
        open={deleteMeal !== null}
        title="تأكيد الحذف"
        message={`هل تريد حذف «${deleteMeal?.label ?? ''}»؟`}
        confirmLabel="حذف"
        danger
        onConfirm={() => { if (deleteMeal) core.removeMeal(deleteMeal.id); setDeleteMeal(null); }}
        onCancel={() => setDeleteMeal(null)}
      />
      <ConfirmDialog
        open={deleteFav !== null}
        title="حذف من المفضلة"
        message={`إزالة «${deleteFav?.label ?? ''}» من أكلاتك المفضلة؟`}
        confirmLabel="حذف"
        danger
        onConfirm={() => { if (deleteFav) core.removeFavorite(deleteFav.id); setDeleteFav(null); }}
        onCancel={() => setDeleteFav(null)}
      />
    </div>
  );
}
