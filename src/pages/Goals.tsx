/* ===================================================================
   Goals.tsx — صفحة الأهداف
   كل هدف بخطوات (+3 لكل خطوة، +25 واحتفال عند الإكمال) + فئة + موعد تسليم بعدّ تنازلي.
   كل الحالة عبر useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import { useCore, todayStr, type Goal } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';

interface PendingDelete {
  goalId: string;
  stepId?: string;
  label: string;
}

/* فئات سريعة جاهزة (والمستخدم يقدر يكتب فئته الخاصة) */
const QUICK_CATS = ['شخصي', 'عملي', 'علاقات', 'أخرى'];

/* الأيام المتبقية لموعد التسليم */
const daysLeft = (deadline: string): number | null => {
  if (!deadline) return null;
  const d = new Date(deadline + 'T00:00:00').getTime();
  const now = new Date(todayStr() + 'T00:00:00').getTime();
  return Math.round((d - now) / 86400000);
};

const countdownText = (n: number): string => {
  if (n > 1) return `⏳ باقي ${n} يوم`;
  if (n === 1) return '⏳ باقي يوم واحد';
  if (n === 0) return '🔥 اليوم موعدك!';
  return `⌛ فات الموعد بـ ${Math.abs(n)} يوم`;
};

export default function Goals() {
  const core = useCore();
  /* ترتيب: غير المكتمل أولاً، ثم الأقرب موعداً (بلا موعد في الآخر) */
  const goals = [...core.state.goals].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const da = a.deadline || '9999-12-31';
    const db = b.deadline || '9999-12-31';
    return da < db ? -1 : da > db ? 1 : 0;
  });

  const [editKey, setEditKey] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newCat, setNewCat] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newStepFor, setNewStepFor] = useState<string | null>(null);
  const [newStep, setNewStep] = useState('');
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const startEdit = (key: string, current: string) => {
    setEditKey(key);
    setDraft(current);
  };

  const commitEdit = () => {
    if (!editKey) return;
    const parts = editKey.split('|');
    if (parts[0] === 'goal') core.editGoalTitle(parts[1], draft);
    else core.editGoalStep(parts[1], parts[2], draft);
    setEditKey(null);
    setDraft('');
  };

  const handleAddGoal = () => {
    core.addGoal(newGoal, newCat, newDeadline);
    setNewGoal('');
    setNewCat('');
    setNewDeadline('');
  };

  const handleAddStep = (goalId: string) => {
    core.addGoalStep(goalId, newStep);
    setNewStep('');
    setNewStepFor(null);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const { goalId, stepId } = pendingDelete;
    if (stepId) core.removeGoalStep(goalId, stepId);
    else core.removeGoal(goalId);
    setPendingDelete(null);
  };

  const renderGoal = (goal: Goal) => {
    const total = goal.steps.length;
    const done = goal.steps.filter((s) => s.done).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    const titleEditing = editKey === `goal|${goal.id}`;
    const dleft = daysLeft(goal.deadline);

    return (
      <div className={goal.completed ? 'card pulse' : 'card'} key={goal.id}>
        <div className="goal-head">
          {titleEditing ? (
            <input
              className="input-field" value={draft} autoFocus maxLength={200}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
            />
          ) : (
            <span
              className={goal.completed ? 'goal-title done' : 'goal-title'}
              onClick={() => startEdit(`goal|${goal.id}`, goal.title)}
            >
              {goal.title}
            </span>
          )}
          {goal.completed && <span className="goal-badge">✅ تم</span>}
          <button
            className="icon-btn" aria-label="حذف الهدف"
            onClick={() => setPendingDelete({ goalId: goal.id, label: goal.title })}
          >
            🗑️
          </button>
        </div>

        {/* الفئة والعدّ التنازلي */}
        {(goal.category || dleft !== null) && (
          <div className="goal-chips">
            {goal.category && <span className="goal-chip cat">🏷️ {goal.category}</span>}
            {dleft !== null && !goal.completed && (
              <span className={dleft < 0 ? 'goal-chip late' : 'goal-chip due'}>
                {countdownText(dleft)}
              </span>
            )}
          </div>
        )}

        <div className="goal-meta">
          {total === 0 ? 'زِد خطوات عشان تخلّص الهدف' : `خلّصت ${done} من ${total} (${pct}%)`}
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>

        <div className="subtask-wrap" style={{ paddingInline: 0 }}>
          {goal.steps.map((step) => {
            const stepEditing = editKey === `step|${goal.id}|${step.id}`;
            return (
              <div className="subtask-row" key={step.id}>
                <button
                  className={step.done ? 'sub-check done' : 'sub-check'}
                  aria-label="تبديل إنجاز الخطوة"
                  onClick={() => core.toggleGoalStep(goal.id, step.id)}
                >
                  {step.done ? '✓' : ''}
                </button>
                {stepEditing ? (
                  <input
                    className="input-field" value={draft} autoFocus maxLength={200}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
                  />
                ) : (
                  <span
                    className={step.done ? 'task-text done' : 'task-text'}
                    onClick={() => startEdit(`step|${goal.id}|${step.id}`, step.text)}
                  >
                    {step.text}
                  </span>
                )}
                <button
                  className="icon-btn" aria-label="حذف الخطوة"
                  onClick={() => setPendingDelete({ goalId: goal.id, stepId: step.id, label: step.text })}
                >
                  🗑️
                </button>
              </div>
            );
          })}

          {newStepFor === goal.id ? (
            <div className="add-row">
              <input
                className="input-field" placeholder="وش الخطوة؟" value={newStep} autoFocus maxLength={200}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStep(goal.id)}
              />
              <button className="btn-primary" onClick={() => handleAddStep(goal.id)}>زِد</button>
            </div>
          ) : (
            <button className="add-sub-btn" onClick={() => { setNewStepFor(goal.id); setNewStep(''); }}>
              ➕ خطوة
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <BackButton />
      <XPBar />

      <h1 className="section-title">🎯 أهدافي</h1>

      {goals.length === 0 && (
        <div className="card">
          <p style={{ color: 'var(--text-secondary)' }}>
            ما عندك أهداف لين الحين — زِد أول هدف وخلنا نبدأ 👇
          </p>
        </div>
      )}

      {goals.map(renderGoal)}

      {/* نموذج إضافة هدف */}
      <div className="card">
        <input
          className="input-field" placeholder="وش هدفك الجديد؟" value={newGoal} maxLength={200}
          style={{ marginBottom: 10 }}
          onChange={(e) => setNewGoal(e.target.value)}
        />
        <div className="cat-chips">
          {QUICK_CATS.map((c) => (
            <button
              key={c}
              className={newCat === c ? 'cat-pick active' : 'cat-pick'}
              onClick={() => setNewCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          className="input-field" placeholder="الفئة (أو اكتب فئتك)" value={newCat} maxLength={200}
          style={{ margin: '10px 0' }}
          onChange={(e) => setNewCat(e.target.value)}
        />
        <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
          ⏳ موعد التسليم (اختياري)
        </label>
        <input
          className="input-field" type="date" value={newDeadline}
          style={{ margin: '6px 0 12px' }}
          onChange={(e) => setNewDeadline(e.target.value)}
        />
        <button className="btn-primary" style={{ width: '100%' }} onClick={handleAddGoal}>
          زِد الهدف 🚀
        </button>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="متأكد؟"
        message={`بتحذف «${pendingDelete?.label ?? ''}» نهائياً؟`}
        confirmLabel="احذف"
        cancelLabel="رجوع"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
