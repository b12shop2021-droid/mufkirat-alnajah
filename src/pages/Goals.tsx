/* ===================================================================
   Goals.tsx — صفحة الأهداف
   كل هدف بخطوات (مهام فرعية): +3 لكل خطوة، +25 واحتفال عند اكتمال الهدف.
   كل الحالة عبر useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import { useCore, type Goal } from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';

interface PendingDelete {
  goalId: string;
  stepId?: string;
  label: string;
}

export default function Goals() {
  const core = useCore();
  const goals = core.state.goals;

  const [editKey, setEditKey] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newStepFor, setNewStepFor] = useState<string | null>(null);
  const [newStep, setNewStep] = useState('');
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  /* بدء تعديل نص (عنوان هدف أو خطوة) */
  const startEdit = (key: string, current: string) => {
    setEditKey(key);
    setDraft(current);
  };

  /* حفظ التعديل الجاري حسب نوع المفتاح */
  const commitEdit = () => {
    if (!editKey) return;
    const parts = editKey.split('|');
    if (parts[0] === 'goal') core.editGoalTitle(parts[1], draft);
    else core.editGoalStep(parts[1], parts[2], draft);
    setEditKey(null);
    setDraft('');
  };

  /* إضافة هدف جديد */
  const handleAddGoal = () => {
    core.addGoal(newGoal);
    setNewGoal('');
  };

  /* إضافة خطوة لهدف */
  const handleAddStep = (goalId: string) => {
    core.addGoalStep(goalId, newStep);
    setNewStep('');
    setNewStepFor(null);
  };

  /* تنفيذ الحذف بعد التأكيد */
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

    return (
      <div className={goal.completed ? 'card pulse' : 'card'} key={goal.id}>
        <div className="goal-head">
          {titleEditing ? (
            <input
              className="input-field"
              value={draft}
              autoFocus
              maxLength={200}
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
          {goal.completed && <span className="goal-badge">✅ مكتمل</span>}
          <button
            className="icon-btn"
            aria-label="حذف الهدف"
            onClick={() =>
              setPendingDelete({ goalId: goal.id, label: goal.title })
            }
          >
            🗑️
          </button>
        </div>

        <div className="goal-meta">
          {total === 0 ? 'أضف خطوات لإكمال الهدف' : `أُنجز ${done} من ${total} (${pct}%)`}
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
                    className="input-field"
                    value={draft}
                    autoFocus
                    maxLength={200}
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
                  className="icon-btn"
                  aria-label="حذف الخطوة"
                  onClick={() =>
                    setPendingDelete({
                      goalId: goal.id,
                      stepId: step.id,
                      label: step.text,
                    })
                  }
                >
                  🗑️
                </button>
              </div>
            );
          })}

          {newStepFor === goal.id ? (
            <div className="add-row">
              <input
                className="input-field"
                placeholder="خطوة جديدة"
                value={newStep}
                autoFocus
                maxLength={200}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddStep(goal.id)}
              />
              <button className="btn-primary" onClick={() => handleAddStep(goal.id)}>
                إضافة
              </button>
            </div>
          ) : (
            <button
              className="add-sub-btn"
              onClick={() => {
                setNewStepFor(goal.id);
                setNewStep('');
              }}
            >
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

      <h1 className="section-title">🎯 الأهداف</h1>

      {goals.length === 0 && (
        <div className="card">
          <p style={{ color: 'var(--text-secondary)' }}>
            لا أهداف بعد — أضف أول هدف لتبدأ رحلتك 👇
          </p>
        </div>
      )}

      {goals.map(renderGoal)}

      <div className="add-row">
        <input
          className="input-field"
          placeholder="هدف جديد"
          value={newGoal}
          maxLength={200}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
        />
        <button className="btn-primary" onClick={handleAddGoal}>
          إضافة
        </button>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="تأكيد الحذف"
        message={`هل تريد حذف «${pendingDelete?.label ?? ''}» نهائياً؟`}
        confirmLabel="حذف"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
