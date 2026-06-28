/* ===================================================================
   CustomWorkout.tsx — "صمّم جدول تمارينك"
   جدول مرن (إضافة بديلة لجدول الكابتن سعود، لا بديلاً عنه).
   كل الحالة عبر useCore المركزي (تُحفظ تلقائياً).
   =================================================================== */

import { useState } from 'react';
import { useCore, type Difficulty } from '../core/useCore';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';
import { fireConfetti } from '../components/Confetti';
import PageHero from '../components/PageHero';

const DIFFICULTIES: Difficulty[] = ['سهل', 'متوسط', 'متقدم'];
const MAX_IMAGE_BYTES = 1_500_000; // حد حجم صورة اليوم لمنع تضخّم التخزين

interface PendingDelete {
  dayId: string;
  exId?: string;
  label: string;
}

export default function CustomWorkout({ embedded = false }: { embedded?: boolean }) {
  const core = useCore();
  const days = core.state.customWorkout;

  const [openDay, setOpenDay] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [hint, setHint] = useState<{ kind: 'warn' | 'ok'; text: string } | null>(
    null,
  );

  /* فتح/طي يوم */
  const toggleDay = (id: string) =>
    setOpenDay((cur) => (cur === id ? null : id));

  /* قراءة صورة اليوم مع التحقق من النوع والحجم */
  const handleImage = (
    e: React.ChangeEvent<HTMLInputElement>,
    dayId: string,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // للسماح بإعادة اختيار نفس الملف
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setHint({ kind: 'warn', text: '⚠️ الملف المختار ليس صورة' });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setHint({ kind: 'warn', text: '⚠️ حجم الصورة كبير (الحد 1.5 ميجابايت)' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        core.setCustomDayImage(dayId, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  /* تنفيذ الحذف بعد التأكيد */
  const confirmDelete = () => {
    if (!pendingDelete) return;
    const { dayId, exId } = pendingDelete;
    if (exId) core.removeCustomExercise(dayId, exId);
    else core.removeCustomDay(dayId);
    setPendingDelete(null);
  };

  /* حفظ البرنامج: تحقق ثم احتفال (البيانات محفوظة تلقائياً أصلاً) */
  const handleSave = () => {
    if (days.length === 0) {
      setHint({ kind: 'warn', text: '⚠️ ضِف يوم تمرين واحد أول' });
      return;
    }
    const hasEmpty = days.some((d) =>
      d.exercises.some((ex) => ex.name.trim() === ''),
    );
    if (hasEmpty) {
      setHint({ kind: 'warn', text: '⚠️ تأكد إنك كتبت اسم كل تمرين قبل الحفظ' });
      return;
    }
    fireConfetti();
    setHint({ kind: 'ok', text: '🛠️ حفظنا برنامجك الخاص!' });
  };

  return (
    <div className="page">
      {!embedded && <BackButton />}

      <PageHero
        variant="primary"
        centered
        icon="🛠️"
        title="برنامجك، بطريقتك الخاصة"
        subtitle="صمّم عدد الأيام والتمارين التي تناسبك تماماً — بجانب برنامج «الكابتن سعود» الجاهز، لا بديلاً عنه."
      />

      {days.length === 0 && (
        <div className="card empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-text">
            لم تُضف أي يوم تمرين بعد
            <br />
            اضغط «➕ إضافة يوم» بالأسفل لتبدأ تصميم برنامجك
          </div>
        </div>
      )}

      {days.map((day) => {
        const isOpen = openDay === day.id;
        return (
          <div className="card" key={day.id}>
            <div className="day-head">
              <button
                className={isOpen ? 'day-arrow open' : 'day-arrow'}
                aria-label="فتح/طي اليوم"
                onClick={() => toggleDay(day.id)}
              >
                ›
              </button>
              <input
                className="day-name-input"
                value={day.name}
                maxLength={200}
                placeholder="اسم اليوم (مثال: يوم الصدر والترايسبس)"
                onChange={(e) => core.renameCustomDay(day.id, e.target.value)}
              />
              <span className="day-count">{day.exercises.length} تمرين</span>
              <button
                className="icon-btn"
                aria-label="حذف اليوم"
                onClick={() =>
                  setPendingDelete({ dayId: day.id, label: day.name })
                }
              >
                🗑️
              </button>
            </div>

            {isOpen && (
              <div>
                {day.image && (
                  <div className="day-img-slot">
                    <img src={day.image} alt="صورة اليوم" />
                  </div>
                )}

                {day.exercises.map((ex) => (
                  <div className="cust-ex" key={ex.id}>
                    <div className="cust-ex-top">
                      <input
                        className="input-field"
                        placeholder="🏋️ اسم التمرين (مثال: ضغط صدر بالبار)"
                        value={ex.name}
                        maxLength={200}
                        onChange={(e) =>
                          core.updateCustomExercise(day.id, ex.id, {
                            name: e.target.value,
                          })
                        }
                      />
                      <button
                        className="icon-btn"
                        aria-label="حذف التمرين"
                        onClick={() =>
                          setPendingDelete({
                            dayId: day.id,
                            exId: ex.id,
                            label: ex.name || 'هذا التمرين',
                          })
                        }
                      >
                        🗑️
                      </button>
                    </div>

                    <div className="cust-grid">
                      <div className="field">
                        <label>عدد الجولات</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="مثال: 4"
                          value={ex.sets === 0 ? '' : ex.sets}
                          onChange={(e) =>
                            core.updateCustomExercise(day.id, ex.id, {
                              sets: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="field">
                        <label>التكرارات</label>
                        <input
                          type="text"
                          placeholder="مثال: 8-12"
                          value={ex.reps}
                          maxLength={200}
                          onChange={(e) =>
                            core.updateCustomExercise(day.id, ex.id, {
                              reps: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label>مستوى الصعوبة</label>
                      <select
                        value={ex.difficulty}
                        onChange={(e) =>
                          core.updateCustomExercise(day.id, ex.id, {
                            difficulty: e.target.value as Difficulty,
                          })
                        }
                      >
                        {DIFFICULTIES.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <textarea
                      className="cust-notes"
                      rows={2}
                      placeholder="ملاحظاتك الخاصة على التمرين (اختياري)"
                      value={ex.notes}
                      maxLength={200}
                      onChange={(e) =>
                        core.updateCustomExercise(day.id, ex.id, {
                          notes: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}

                <button
                  className="dashed-btn"
                  onClick={() => core.addCustomExercise(day.id)}
                >
                  ➕ إضافة تمرين لهذا اليوم
                </button>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 10,
                    fontSize: '0.74rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  📷 {day.image ? 'تغيير صورة اليوم' : 'إضافة صورة لهذا اليوم'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImage(e, day.id)}
                  />
                </label>
              </div>
            )}
          </div>
        );
      })}

      <button
        className="dashed-btn"
        style={{ marginBottom: 14 }}
        onClick={core.addCustomDay}
      >
        ➕ إضافة يوم تمرين جديد
      </button>

      {hint && <div className={`hint-msg ${hint.kind}`}>{hint.text}</div>}

      <button className="btn-primary" style={{ width: '100%' }} onClick={handleSave}>
        تـم — حفظ برنامجي المخصّص
      </button>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="تأكيد الحذف"
        message={`متأكد تبي تحذف «${pendingDelete?.label ?? ''}»؟`}
        confirmLabel="حذف"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
