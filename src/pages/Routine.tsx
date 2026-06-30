/* ===================================================================
   Routine.tsx — الروتين الصباحي/المسائي
   مهام دائمة لا تُحذف يومياً؛ حالة "تم اليوم" فقط تُصفَّر يومياً.
   القسم المطابق لوقت اليوم يظهر أولاً. كل الحالة عبر useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import Dose from '../components/Dose';
import SwipeRow from '../components/SwipeRow';
import {
  useCore,
  todayStr,
  type RoutineSection,
  type RoutineTask,
  type Priority,
} from '../core/useCore';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';
import SleepRelations from './SleepRelations';

/* صنف نقطة الأولوية حسب القيمة (لا لون ثابت — الأصناف من global.css) */
const PRIO_CLASS: Record<Priority, string> = {
  high: 'prio-dot prio-high',
  med: 'prio-dot prio-med',
  low: 'prio-dot prio-low',
};

/* هل التاريخ المخزّن هو اليوم؟ */
const isToday = (d: string): boolean => d === todayStr();

/* تاريخ YYYY-MM-DD قبل offset يوماً */
const dateBefore = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/* سلسلة العادة: أيام متتالية أُنجزت فيها (تبدأ من اليوم إن أُنجز، وإلا من أمس) */
const habitStreak = (history?: string[]): number => {
  if (!history || history.length === 0) return 0;
  const set = new Set(history);
  const start = set.has(todayStr()) ? 0 : 1;
  let n = 0;
  for (let i = start; ; i++) {
    if (set.has(dateBefore(i))) n++;
    else break;
  }
  return n;
};

/* القسم الافتراضي حسب الساعة: قبل 16:00 صباحي، بعدها مسائي */
const defaultSection = (): RoutineSection =>
  new Date().getHours() < 16 ? 'morning' : 'evening';

interface PendingDelete {
  section: RoutineSection;
  taskId: string;
  subId?: string;
  label: string;
}

export default function Routine() {
  const core = useCore();
  const [active, setActive] = useState<RoutineSection>(defaultSection());
  const [editKey, setEditKey] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newTask, setNewTask] = useState('');
  const [newSubFor, setNewSubFor] = useState<string | null>(null);
  const [newSub, setNewSub] = useState('');
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  const tasks = core.state.routine[active];
  const doneCount = tasks.filter((t) => isToday(t.doneDate)).length;
  const allDone = tasks.length > 0 && doneCount === tasks.length;

  /* بدء تعديل نص (مهمة أو فرعية) */
  const startEdit = (key: string, current: string) => {
    setEditKey(key);
    setDraft(current);
  };

  /* حفظ التعديل الجاري حسب نوع المفتاح */
  const commitEdit = () => {
    if (!editKey) return;
    const parts = editKey.split('|');
    if (parts[0] === 'task') {
      core.editRoutineText(active, parts[1], draft);
    } else {
      core.editSubText(active, parts[1], parts[2], draft);
    }
    setEditKey(null);
    setDraft('');
  };

  /* فتح/طي المهام الفرعية */
  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* إضافة مهمة جديدة للقسم النشط */
  const handleAddTask = () => {
    core.addRoutineTask(active, newTask);
    setNewTask('');
  };

  /* إضافة مهمة فرعية لمهمة معيّنة */
  const handleAddSub = (taskId: string) => {
    core.addSubTask(active, taskId, newSub);
    setNewSub('');
    setNewSubFor(null);
  };

  /* تنفيذ الحذف بعد تأكيد ConfirmDialog */
  const confirmDelete = () => {
    if (!pendingDelete) return;
    const { section, taskId, subId } = pendingDelete;
    if (subId) core.removeSubTask(section, taskId, subId);
    else core.removeRoutineTask(section, taskId);
    setPendingDelete(null);
  };

  const renderTask = (task: RoutineTask) => {
    const taskDone = isToday(task.doneDate);
    const isEditing = editKey === `task|${task.id}`;
    const isOpen = expanded.has(task.id);
    const streak = habitStreak(task.history);
    return (
      <div key={task.id}>
        <SwipeRow
          done={taskDone}
          onComplete={() => core.toggleRoutineDone(active, task.id)}
          onDelete={() => setPendingDelete({ section: active, taskId: task.id, label: task.text })}
        >
          <div className="task-row">
            <button
              className={taskDone ? 'task-check done' : 'task-check'}
              aria-label="تبديل الإنجاز"
              onClick={() => core.toggleRoutineDone(active, task.id)}
            >
              {taskDone ? '✓' : ''}
            </button>
            <button
              className={PRIO_CLASS[task.priority]}
              aria-label="تغيير الأولوية"
              onClick={() => core.cyclePriority(active, task.id)}
            />
            {isEditing ? (
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
                className={taskDone ? 'task-text done' : 'task-text'}
                onClick={() => startEdit(`task|${task.id}`, task.text)}
              >
                {task.text}
              </span>
            )}
            {streak >= 2 && (
              <span className="habit-streak" title={`${streak} يوم متتالي على هالعادة`}>
                🔥 {streak}
              </span>
            )}
            <button className="icon-btn reorder" aria-label="فوق" onClick={() => core.moveRoutineTask(active, task.id, -1)}>
              ▲
            </button>
            <button className="icon-btn reorder" aria-label="تحت" onClick={() => core.moveRoutineTask(active, task.id, 1)}>
              ▼
            </button>
            <button
              className="icon-btn"
              aria-label="المهام الفرعية"
              onClick={() => toggleExpand(task.id)}
            >
              {isOpen ? '▲' : '▾'}
              {task.subtasks.length > 0 ? ` ${task.subtasks.length}` : ''}
            </button>
            <button
              className="icon-btn"
              aria-label="حذف المهمة"
              onClick={() =>
                setPendingDelete({
                  section: active,
                  taskId: task.id,
                  label: task.text,
                })
              }
            >
              🗑️
            </button>
          </div>
        </SwipeRow>

        {isOpen && (
          <div className="subtask-wrap">
            {task.subtasks.map((sub) => {
              const subDone = isToday(sub.doneDate);
              const subEditing = editKey === `sub|${task.id}|${sub.id}`;
              return (
                <SwipeRow
                  key={sub.id}
                  done={subDone}
                  onComplete={() => core.toggleSubDone(active, task.id, sub.id)}
                >
                  <div className="subtask-row">
                    <button
                      className={subDone ? 'sub-check done' : 'sub-check'}
                      aria-label="تبديل إنجاز الفرعية"
                      onClick={() => core.toggleSubDone(active, task.id, sub.id)}
                    >
                      {subDone ? '✓' : ''}
                    </button>
                    {subEditing ? (
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
                        className={subDone ? 'task-text done' : 'task-text'}
                        onClick={() =>
                          startEdit(`sub|${task.id}|${sub.id}`, sub.text)
                        }
                      >
                        {sub.text}
                      </span>
                    )}
                    <button
                      className="icon-btn"
                      aria-label="حذف الفرعية"
                      onClick={() =>
                        setPendingDelete({
                          section: active,
                          taskId: task.id,
                          subId: sub.id,
                          label: sub.text,
                        })
                      }
                    >
                      🗑️
                    </button>
                  </div>
                </SwipeRow>
              );
            })}

            {newSubFor === task.id ? (
              <div className="add-row">
                <input
                  className="input-field"
                  placeholder="مهمة فرعية جديدة"
                  value={newSub}
                  autoFocus
                  maxLength={200}
                  onChange={(e) => setNewSub(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSub(task.id)}
                />
                <button className="btn-primary" onClick={() => handleAddSub(task.id)}>
                  زِد
                </button>
              </div>
            ) : (
              <button
                className="add-sub-btn"
                onClick={() => {
                  setNewSubFor(task.id);
                  setNewSub('');
                }}
              >
                ➕ مهمة فرعية
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page">
      <BackButton />
      <XPBar />

      <h1 className="section-title">☀️ روتيني الصح</h1>
      <Dose section="challenges" />

      <div className="routine-tabs">
        <button
          className={active === 'morning' ? 'routine-tab active' : 'routine-tab'}
          onClick={() => setActive('morning')}
        >
          ☀️ الروتين الصباحي
        </button>
        <button
          className={active === 'evening' ? 'routine-tab active' : 'routine-tab'}
          onClick={() => setActive('evening')}
        >
          🌙 الروتين المسائي
        </button>
      </div>

      <div className={allDone ? 'card pulse' : 'card'}>
        <div className="section-progress">
          {tasks.length === 0
            ? 'ما فيه مهام — ضيف أول مهمة 👇'
            : `خلّصت ${doneCount} من ${tasks.length}`}
          {allDone ? ' — كمّلت القسم، كفو! ✨' : ''}
        </div>

        {tasks.map(renderTask)}

        <div className="add-row">
          <input
            className="input-field"
            placeholder="مهمة جديدة (ثابتة كل يوم)"
            value={newTask}
            maxLength={200}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          />
          <button className="btn-primary" onClick={handleAddTask}>
            إضافة
          </button>
        </div>
      </div>

      {/* متتبع النوم — مدمج مع الروتين المسائي */}
      {active === 'evening' && (
        <>
          <h2 className="section-title" style={{ marginTop: 18 }}>😴 نومك الليلة</h2>
          <SleepRelations embedded />
        </>
      )}

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
