/* ===================================================================
   Occasions.tsx — العلاقات والمناسبات
   إدارة المناسبات مع عدّ تنازلي وتذكير قبل يوم وأفكار هدايا
   =================================================================== */

import { useState, useMemo } from 'react';
import { useCore, todayStr } from '../core/useCore';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';

const OCCASIONS_LIST = ['ذكرى زواج', 'تخرّج', 'عقد قران', 'مولود جديد', 'نجاح', 'عيد فطر', 'عيد أضحى', 'اليوم الوطني 🇸🇦', 'يوم التأسيس', 'أخرى'];

type Tab = 'upcoming' | 'all' | 'circle' | 'add';

/* ====================== مساعدات التاريخ ====================== */

/* يرجع تاريخ المناسبة القادمة (بالنسبة لليوم) */
function nextOccurrenceDate(dateStr: string, isAnnual: boolean): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!isAnnual) return new Date(dateStr);

  const [mm, dd] = dateStr.split('-').map(Number);
  const thisYear = new Date(today.getFullYear(), mm - 1, dd);
  if (thisYear >= today) return thisYear;
  return new Date(today.getFullYear() + 1, mm - 1, dd);
}

function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86_400_000);
}

function formatCountdown(days: number): { label: string; color: string } {
  if (days < 0) return { label: 'انتهت', color: 'var(--text-secondary)' };
  if (days === 0) return { label: 'اليوم! 🎉', color: 'var(--success)' };
  if (days === 1) return { label: 'غداً ⚡', color: 'var(--warning)' };
  if (days <= 7) return { label: `بعد ${days} أيام`, color: 'var(--warning)' };
  if (days <= 30) return { label: `بعد ${days} يوم`, color: 'var(--primary)' };
  return { label: `بعد ${days} يوم`, color: 'var(--text-secondary)' };
}

const EMPTY_FORM = {
  personName: '',
  relation: '',
  occasionName: 'ذكرى زواج',
  customOccasion: '',
  date: '',
  isAnnual: true,
  notes: '',
  giftIdeas: '',
};

export default function Occasions() {
  const core = useCore();
  const { occasions, relations } = core.state;

  const [tab, setTab] = useState<Tab>('upcoming');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [hint, setHint] = useState('');

  /* دائرة التواصل (منقولة من صفحة النوم) */
  const [relName, setRelName] = useState('');
  const [relDelete, setRelDelete] = useState<{ id: string; label: string } | null>(null);
  const handleAddRel = () => {
    if (relName.trim() === '') { setHint('اكتب اسم الشخص'); return; }
    core.addRelation(relName);
    setRelName('');
  };

  /* ترتيب المناسبات بالأقرب */
  const sorted = useMemo(() => {
    return [...occasions]
      .map((o) => ({ ...o, next: nextOccurrenceDate(o.date, o.isAnnual), days: 0 }))
      .map((o) => ({ ...o, days: daysUntil(o.next) }))
      .sort((a, b) => a.days - b.days);
  }, [occasions]);

  const upcoming = sorted.filter((o) => o.days >= 0 && o.days <= 60);
  const thisMonth = sorted.filter((o) => o.days >= 0 && o.days <= 30);

  /* حفظ المناسبة */
  const handleSave = () => {
    const name = form.personName.trim();
    const occ = form.occasionName === 'أخرى' ? form.customOccasion.trim() : form.occasionName;
    if (!name) { setHint('اكتب اسم الشخص'); return; }
    if (!form.date) { setHint('اختر تاريخ المناسبة'); return; }
    if (!occ) { setHint('اكتب اسم المناسبة'); return; }

    /* تحويل التاريخ: السنوي = MM-DD فقط */
    const dateVal = form.isAnnual
      ? form.date.slice(5) // YYYY-MM-DD → MM-DD
      : form.date;

    if (editing) {
      core.updateOccasion(editing, {
        personName: name,
        relation: form.relation,
        occasionName: occ,
        date: dateVal,
        isAnnual: form.isAnnual,
        notes: form.notes.trim(),
        giftIdeas: form.giftIdeas.trim(),
      });
      setHint('عدّلناها ✓');
    } else {
      core.addOccasion({
        personName: name,
        relation: form.relation,
        occasionName: occ,
        date: dateVal,
        isAnnual: form.isAnnual,
        notes: form.notes.trim(),
        giftIdeas: form.giftIdeas.trim(),
      });
      setHint('ضِفناها ✓');
    }
    setForm(EMPTY_FORM);
    setEditing(null);
    setTab('upcoming');
  };

  const startEdit = (id: string) => {
    const o = occasions.find((x) => x.id === id);
    if (!o) return;
    const fullDate = o.isAnnual ? `${todayStr().slice(0, 4)}-${o.date}` : o.date;
    setForm({
      personName: o.personName,
      relation: o.relation,
      occasionName: OCCASIONS_LIST.includes(o.occasionName) ? o.occasionName : 'أخرى',
      customOccasion: OCCASIONS_LIST.includes(o.occasionName) ? '' : o.occasionName,
      date: fullDate,
      isAnnual: o.isAnnual,
      notes: o.notes,
      giftIdeas: o.giftIdeas,
    });
    setEditing(id);
    setTab('add');
  };

  /* ====================== الواجهة ====================== */
  return (
    <div className="page">
      <BackButton to="/more" />
      <h1 className="section-title">🎉 العلاقات والمناسبات</h1>

      {thisMonth.length > 0 && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--deep) 100%)', color: '#fff', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 6 }}>🔔 مناسبات هذا الشهر ({thisMonth.length})</div>
          {thisMonth.slice(0, 3).map((o) => (
            <div key={o.id} style={{ fontSize: '0.78rem', opacity: 0.92, marginBottom: 2 }}>
              {o.occasionName} — {o.personName} · {formatCountdown(o.days).label}
            </div>
          ))}
        </div>
      )}

      {hint && <div className="hint-msg ok" style={{ marginBottom: 8 }}>{hint}</div>}

      <div className="subtabs">
        {(['upcoming', 'all', 'circle', 'add'] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? 'subtab active' : 'subtab'}
            onClick={() => { setTab(t); if (t !== 'add') { setEditing(null); setForm(EMPTY_FORM); } }}>
            {t === 'upcoming' ? '📅 القادمة' : t === 'all' ? '🎉 المناسبات' : t === 'circle' ? '🤝 دائرة التواصل' : editing ? '✏️ تعديل' : '➕ إضافة'}
          </button>
        ))}
      </div>

      {/* ===== تبويب القادمة ===== */}
      {tab === 'upcoming' && (
        <>
          {upcoming.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎁</div>
              <div>ما في مناسبات في الـ 60 يوم القادمة</div>
              <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setTab('add')}>ضِف مناسبة</button>
            </div>
          ) : (
            upcoming.map((o) => <OccasionCard key={o.id} o={o} expanded={expandedId === o.id}
              onExpand={() => setExpandedId(expandedId === o.id ? null : o.id)}
              onEdit={() => startEdit(o.id)} onDelete={() => setDeleteId(o.id)} />)
          )}
          {sorted.filter((o) => o.days > 60).length > 0 && (
            <button className="settings-row" style={{ width: '100%', textAlign: 'right', marginTop: 8 }} onClick={() => setTab('all')}>
              <div className="settings-icon">📋</div>
              <div className="settings-text"><div className="settings-label">عرض كل المناسبات</div></div>
              <div style={{ color: 'var(--text-secondary)' }}>›</div>
            </button>
          )}
        </>
      )}

      {/* ===== تبويب الكل ===== */}
      {tab === 'all' && (
        <>
          {sorted.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div>ما أضفت أي مناسبة بعد</div>
              <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setTab('add')}>ضِف أول وحدة</button>
            </div>
          ) : (
            sorted.map((o) => <OccasionCard key={o.id} o={o} expanded={expandedId === o.id}
              onExpand={() => setExpandedId(expandedId === o.id ? null : o.id)}
              onEdit={() => startEdit(o.id)} onDelete={() => setDeleteId(o.id)} />)
          )}
        </>
      )}

      {/* ===== تبويب دائرة التواصل (منقول من صفحة النوم) ===== */}
      {tab === 'circle' && (
        <>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.7rem' }}>🤝</div>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginTop: 6 }}>
              مين تواصلت معه هالأسبوع؟ ومين ودّك تتصل فيه؟
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              صِل رحمك واهتم بناسك — وتابع مين كلّمت
            </div>
          </div>

          <div className="add-row">
            <input
              className="input-field"
              placeholder="اسم شخص ودّك تتواصل معه..."
              value={relName}
              maxLength={60}
              onChange={(e) => setRelName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRel()}
            />
            <button className="btn-primary" onClick={handleAddRel}>إضافة</button>
          </div>

          {relations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🤝</div>
              <div>ما فيه أحد بالقائمة بعد — ضيف اسم شخص ودّك تتواصل معه</div>
            </div>
          ) : (
            relations.map((r) => (
              <div className="rel-card" key={r.id}>
                <div className="rel-avatar">{r.name.charAt(0)}</div>
                <div className="rel-info">
                  <div className="rel-name">{r.name}</div>
                  <div className={r.contacted ? 'rel-status done' : 'rel-status'}>
                    {r.contacted ? '✓ تواصلت معه هالأسبوع' : 'لسا ما تواصلت'}
                  </div>
                </div>
                <button
                  className={r.contacted ? 'rel-check-btn done' : 'rel-check-btn'}
                  aria-label="تأكيد التواصل"
                  onClick={() => core.toggleRelation(r.id)}
                >
                  {r.contacted ? '✓' : ''}
                </button>
                <button
                  className="icon-btn"
                  aria-label="حذف"
                  onClick={() => setRelDelete({ id: r.id, label: r.name })}
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </>
      )}

      {/* ===== تبويب الإضافة/التعديل ===== */}
      {tab === 'add' && (
        <div className="card">
          <div className="auth-field">
            <label>اسم الشخص *</label>
            <input className="input-field" placeholder="مثال: لمى أو سعود" value={form.personName}
              onChange={(e) => setForm((f) => ({ ...f, personName: e.target.value }))} maxLength={60} />
          </div>

          <div className="auth-field">
            <label>المناسبة</label>
            <div className="chip-row" style={{ flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {OCCASIONS_LIST.map((oc) => (
                <button key={oc} className={form.occasionName === oc ? 'chip active' : 'chip'}
                  onClick={() => setForm((f) => ({ ...f, occasionName: oc }))}>{oc}</button>
              ))}
            </div>
            {form.occasionName === 'أخرى' && (
              <input className="input-field" style={{ marginTop: 8 }} placeholder="اكتب اسم المناسبة"
                value={form.customOccasion} onChange={(e) => setForm((f) => ({ ...f, customOccasion: e.target.value }))} maxLength={40} />
            )}
          </div>

          <div className="auth-field">
            <label>تاريخ المناسبة *</label>
            <input type="date" className="input-field" value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>

          <div className="auth-field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isAnnual}
                onChange={(e) => setForm((f) => ({ ...f, isAnnual: e.target.checked }))} />
              تتكرر كل سنة (مثل ذكرى زواج)
            </label>
          </div>

          <div className="auth-field">
            <label>أفكار الهدايا 🎁</label>
            <textarea className="input-field" rows={2} placeholder="مثال: عطر، ساعة، كتاب..."
              value={form.giftIdeas} onChange={(e) => setForm((f) => ({ ...f, giftIdeas: e.target.value }))} maxLength={200} />
          </div>

          <div className="auth-field">
            <label>ملاحظات</label>
            <textarea className="input-field" rows={2} placeholder="أي تفاصيل إضافية..."
              value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} maxLength={200} />
          </div>

          <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleSave}>
            {editing ? '💾 حفظ التعديل' : '✅ إضافة المناسبة'}
          </button>
          {editing && (
            <button className="btn-secondary" style={{ width: '100%', marginTop: 8 }}
              onClick={() => { setEditing(null); setForm(EMPTY_FORM); setTab('all'); }}>إلغاء</button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="تأكيد الحذف"
        message="تحذف هذي المناسبة؟"
        onConfirm={() => { if (deleteId) core.removeOccasion(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={relDelete !== null}
        title="تأكيد الحذف"
        message={`تبي تشيل «${relDelete?.label ?? ''}» من دائرة التواصل؟`}
        confirmLabel="حذف"
        danger
        onConfirm={() => { if (relDelete) core.removeRelation(relDelete.id); setRelDelete(null); }}
        onCancel={() => setRelDelete(null)}
      />
    </div>
  );
}

/* ===== بطاقة المناسبة ===== */
function OccasionCard({ o, expanded, onExpand, onEdit, onDelete }: {
  o: ReturnType<typeof useMemo> extends never ? never : { id: string; personName: string; relation: string; occasionName: string; isAnnual: boolean; notes: string; giftIdeas: string; days: number };
  expanded: boolean; onExpand: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const cd = formatCountdown((o as { days: number }).days);
  const item = o as { id: string; personName: string; relation: string; occasionName: string; isAnnual: boolean; notes: string; giftIdeas: string; days: number };

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={onExpand}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.occasionName} — {item.personName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{[item.relation, item.isAnnual ? 'يتكرر سنوياً' : ''].filter(Boolean).join(' · ')}</div>
        </div>
        <div style={{ textAlign: 'left', minWidth: 80 }}>
          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: cd.color }}>{cd.label}</div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          {item.giftIdeas && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>🎁 أفكار الهدايا: </span>
              <span style={{ fontSize: '0.82rem' }}>{item.giftIdeas}</span>
            </div>
          )}
          {item.notes && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>📝 ملاحظات: </span>
              <span style={{ fontSize: '0.82rem' }}>{item.notes}</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-secondary" style={{ flex: 1, fontSize: '0.78rem' }} onClick={onEdit}>✏️ تعديل</button>
            <button className="btn-secondary" style={{ flex: 1, fontSize: '0.78rem', color: 'var(--danger)' }} onClick={onDelete}>🗑️ حذف</button>
          </div>
        </div>
      )}
    </div>
  );
}
