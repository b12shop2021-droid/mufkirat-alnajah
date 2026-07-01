/* ===================================================================
   Occasions.tsx — العلاقات والمناسبات
   إدارة المناسبات مع عدّ تنازلي وتذكير قبل يوم وأفكار هدايا
   =================================================================== */

import { useState, useMemo } from 'react';
import { useCore, todayStr, type OccasionEntry } from '../core/useCore';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';

type Tab = 'all' | 'circle' | 'add';
type AddType = 'occasion' | 'appointment';

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

/* تنسيق تاريخ YYYY-MM-DD → DD/MM/YYYY */
function fmtDate(d?: string): string {
  if (!d) return '';
  const [y, m, day] = d.slice(0, 10).split('-');
  return `${day}/${m}/${y}`;
}

/* تنسيق datetime-local (YYYY-MM-DDTHH:mm) → DD/MM الساعة HH:mm */
function fmtDateTime(s?: string): string {
  if (!s) return '';
  const [datePart, timePart] = s.split('T');
  const [, m, day] = datePart.split('-');
  return `${day}/${m}${timePart ? ` · ${timePart}` : ''}`;
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
  occasionName: '',
  date: '',
  isAnnual: true,
  notes: '',
  giftIdeas: '',
};

export default function Occasions() {
  const core = useCore();
  const { occasions, relations } = core.state;

  const [tab, setTab] = useState<Tab>('all');
  const [addType, setAddType] = useState<AddType>('occasion');
  const [apptName, setApptName] = useState('');
  const [apptWhen, setApptWhen] = useState('');
  const [apptNote, setApptNote] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [hint, setHint] = useState('');

  /* أهلك وربعك (منقولة من صفحة النوم) */
  const [relName, setRelName] = useState('');
  const [relDelete, setRelDelete] = useState<{ id: string; label: string } | null>(null);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);
  const [schedVal, setSchedVal] = useState('');
  const handleAddRel = () => {
    if (relName.trim() === '') { setHint('اكتب اسم الشخص'); return; }
    core.addRelation(relName);
    setRelName('');
  };
  const openSchedule = (id: string, current?: string) => {
    setSchedulingId(schedulingId === id ? null : id);
    setSchedVal(current ?? '');
  };
  const saveSchedule = (id: string) => {
    core.scheduleRelationCall(id, schedVal);
    setSchedulingId(null);
    setSchedVal('');
    setHint(schedVal ? 'جدولنا موعد الاتصال ✓' : 'ألغينا الموعد ✓');
  };

  /* ترتيب المناسبات بالأقرب */
  const sorted = useMemo(() => {
    return [...occasions]
      .map((o) => ({ ...o, next: nextOccurrenceDate(o.date, o.isAnnual), days: 0 }))
      .map((o) => ({ ...o, days: daysUntil(o.next) }))
      .sort((a, b) => a.days - b.days);
  }, [occasions]);

  const thisMonth = sorted.filter((o) => o.days >= 0 && o.days <= 30);

  /* المواعيد المجدولة (من أهلك وربعك) — تُدمج مع المناسبات بتبويب المناسبات */
  const appointments = useMemo(() => {
    return relations
      .filter((r) => r.scheduledAt)
      .map((r) => {
        const when = new Date(r.scheduledAt!);
        return { id: r.id, personName: r.name, when, raw: r.scheduledAt!, note: r.note, days: daysUntil(when) };
      })
      .sort((a, b) => a.when.getTime() - b.when.getTime());
  }, [relations]);

  /* حفظ موعد جديد (بدون تاريخ مناسبة — مباشرة كمكالمة مجدولة على الشخص) */
  const handleSaveAppointment = () => {
    const name = apptName.trim();
    if (!name) { setHint('اكتب اسم الشخص'); return; }
    if (!apptWhen) { setHint('اختر وقت الموعد'); return; }
    core.addAppointment(name, apptWhen, apptNote);
    setApptName('');
    setApptWhen('');
    setApptNote('');
    setHint('جدولنا موعدك ✓');
    setTab('all');
  };

  /* حفظ المناسبة */
  const handleSave = () => {
    const name = form.personName.trim();
    const occ = form.occasionName.trim();
    if (!name) { setHint('اكتب اسم الشخص'); return; }
    if (!form.date) { setHint('اختر تاريخ المناسبة'); return; }
    if (!occ) { setHint('اكتب نوع المناسبة'); return; }

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
    setTab('all');
  };

  const startEdit = (id: string) => {
    const o = occasions.find((x) => x.id === id);
    if (!o) return;
    const fullDate = o.isAnnual ? `${todayStr().slice(0, 4)}-${o.date}` : o.date;
    setForm({
      personName: o.personName,
      relation: o.relation,
      occasionName: o.occasionName,
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
        {(['all', 'circle', 'add'] as Tab[]).map((t) => (
          <button key={t} className={tab === t ? 'subtab active' : 'subtab'}
            onClick={() => { setTab(t); if (t !== 'add') { setEditing(null); setForm(EMPTY_FORM); } }}>
            {t === 'all' ? '🎉 المناسبات' : t === 'circle' ? '📞 أهلك وربعك' : editing ? '✏️ تعديل' : '➕ إضافة'}
          </button>
        ))}
      </div>

      {/* ===== تبويب المناسبات (مناسبات + مواعيد مدمجة) ===== */}
      {tab === 'all' && (
        <>
          {sorted.length === 0 && appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎁</div>
              <div>ما أضفت أي مناسبة أو موعد بعد</div>
              <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setTab('add')}>ضِف مناسبة أو موعد</button>
            </div>
          ) : (
            [
              ...sorted.map((o) => ({ kind: 'occasion' as const, days: o.days, o })),
              ...appointments.map((a) => ({ kind: 'appointment' as const, days: a.days, a })),
            ]
              .sort((x, y) => x.days - y.days)
              .map((item) =>
                item.kind === 'occasion' ? (
                  <OccasionCard key={item.o.id} o={item.o} expanded={expandedId === item.o.id}
                    onExpand={() => setExpandedId(expandedId === item.o.id ? null : item.o.id)}
                    onEdit={() => startEdit(item.o.id)} onDelete={() => setDeleteId(item.o.id)} />
                ) : (
                  <div className="card" key={item.a.id} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>🗓️ موعد — {item.a.personName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{fmtDateTime(item.a.raw)}</div>
                        {item.a.note && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>📝 {item.a.note}</div>
                        )}
                      </div>
                      <div style={{ textAlign: 'left', minWidth: 80 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.88rem', color: formatCountdown(item.a.days).color }}>
                          {formatCountdown(item.a.days).label}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button className="btn-secondary" style={{ flex: 1, fontSize: '0.78rem' }} onClick={() => { core.toggleRelation(item.a.id); setHint('📞 تم تسجيل الاتصال'); }}>📞 تم الاتصال</button>
                      <button className="btn-secondary" style={{ flex: 1, fontSize: '0.78rem' }} onClick={() => setTab('circle')}>✏️ تعديل الموعد</button>
                    </div>
                  </div>
                ),
              )
          )}
        </>
      )}

      {/* ===== تبويب دائرة التواصل (منقول من صفحة النوم) ===== */}
      {tab === 'circle' && (
        <>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.7rem' }}>📞</div>
            <div style={{ fontWeight: 800, color: 'var(--primary)', marginTop: 6 }}>
              مين تتصل فيه اليوم؟ ومين له فترة ما كلّمته؟
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              صِل رحمك واهتم بناسك — اضغط السماعة 📞 أول ما تتصل، وجدول مكالمتك القادمة
            </div>
          </div>

          <div className="add-row">
            <input
              className="input-field"
              placeholder="اسم شخص من أهلك أو ربعك..."
              value={relName}
              maxLength={60}
              onChange={(e) => setRelName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRel()}
            />
            <button className="btn-primary" onClick={handleAddRel}>إضافة</button>
          </div>

          {relations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📞</div>
              <div>ما فيه أحد بالقائمة بعد — ضيف اسم شخص من أهلك أو ربعك</div>
            </div>
          ) : (
            relations.map((r) => (
              <div className="rel-card" key={r.id} style={{ flexWrap: 'wrap' }}>
                <div className="rel-avatar">{r.name.charAt(0)}</div>
                <div className="rel-info">
                  <div className="rel-name">{r.name}</div>
                  <div className={r.contactedDate ? 'rel-status done' : 'rel-status'}>
                    {r.contactedDate ? `📞 آخر اتصال: ${fmtDate(r.contactedDate)}` : 'لسا ما اتصلت'}
                  </div>
                  {r.scheduledAt && (
                    <div className="rel-status" style={{ color: 'var(--warning)' }}>
                      🗓️ موعد الاتصال: {fmtDateTime(r.scheduledAt)}
                    </div>
                  )}
                  {r.note && (
                    <div className="rel-status">📝 {r.note}</div>
                  )}
                </div>
                <button
                  className={r.contacted ? 'rel-check-btn done' : 'rel-check-btn'}
                  aria-label="تم الاتصال اليوم"
                  title="تم الاتصال اليوم"
                  onClick={() => core.toggleRelation(r.id)}
                >
                  📞
                </button>
                <button
                  className="icon-btn"
                  aria-label="جدولة موعد اتصال"
                  title="جدولة موعد اتصال"
                  onClick={() => openSchedule(r.id, r.scheduledAt)}
                >
                  🗓️
                </button>
                <button
                  className="icon-btn"
                  aria-label="حذف"
                  onClick={() => setRelDelete({ id: r.id, label: r.name })}
                >
                  🗑️
                </button>

                {schedulingId === r.id && (
                  <div style={{ flexBasis: '100%', display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                    <input
                      type="datetime-local"
                      className="input-field"
                      style={{ flex: 1 }}
                      value={schedVal}
                      onChange={(e) => setSchedVal(e.target.value)}
                    />
                    <button className="btn-primary" onClick={() => saveSchedule(r.id)}>حفظ</button>
                    {r.scheduledAt && (
                      <button className="btn-secondary" onClick={() => { setSchedVal(''); core.scheduleRelationCall(r.id, ''); setSchedulingId(null); setHint('ألغينا الموعد ✓'); }}>إلغاء الموعد</button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* ===== تبويب الإضافة/التعديل ===== */}
      {tab === 'add' && (
        <div className="card">
          {!editing && (
            <div className="cat-chips" style={{ marginBottom: 14 }}>
              <button className={addType === 'occasion' ? 'cat-pick active' : 'cat-pick'} onClick={() => setAddType('occasion')}>🎉 مناسبة</button>
              <button className={addType === 'appointment' ? 'cat-pick active' : 'cat-pick'} onClick={() => setAddType('appointment')}>🗓️ موعد</button>
            </div>
          )}

          {(editing || addType === 'occasion') ? (
            <>
              <div className="auth-field">
                <label>اسم الشخص *</label>
                <input className="input-field" placeholder="اسم الشخص" value={form.personName}
                  onChange={(e) => setForm((f) => ({ ...f, personName: e.target.value }))} maxLength={60} />
              </div>

              <div className="auth-field">
                <label>نوع المناسبة *</label>
                <input className="input-field" placeholder="مثال: زواج، تخرّج" value={form.occasionName}
                  onChange={(e) => setForm((f) => ({ ...f, occasionName: e.target.value }))} maxLength={40} />
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
            </>
          ) : (
            <>
              <div className="auth-field">
                <label>اسم الشخص *</label>
                <input className="input-field" placeholder="اسم الشخص" value={apptName}
                  onChange={(e) => setApptName(e.target.value)} maxLength={60} />
              </div>

              <div className="auth-field">
                <label>وقت الموعد *</label>
                <input type="datetime-local" className="input-field" value={apptWhen}
                  onChange={(e) => setApptWhen(e.target.value)} />
              </div>

              <div className="auth-field">
                <label>ملاحظة</label>
                <textarea className="input-field" rows={2} placeholder="أي تفاصيل عن الموعد..."
                  value={apptNote} onChange={(e) => setApptNote(e.target.value)} maxLength={200} />
              </div>

              <button className="btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleSaveAppointment}>
                🗓️ إضافة الموعد
              </button>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="تأكيد الحذف"
        message="متأكد تبي تحذفها؟ ترى الهروب مو حل.. بس إذا تبي، بنمشيها لك هالمرة."
        onConfirm={() => { if (deleteId) core.removeOccasion(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={relDelete !== null}
        title="تأكيد الحذف"
        message={`تبي تشيل «${relDelete?.label ?? ''}» من أهلك وربعك؟`}
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
  o: OccasionEntry & { days: number };
  expanded: boolean; onExpand: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const cd = formatCountdown(o.days);

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={onExpand}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.occasionName} — {o.personName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{[o.relation, o.isAnnual ? 'يتكرر سنوياً' : ''].filter(Boolean).join(' · ')}</div>
        </div>
        <div style={{ textAlign: 'left', minWidth: 80 }}>
          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: cd.color }}>{cd.label}</div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          {o.giftIdeas && (
            <div style={{ marginBottom: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>🎁 أفكار الهدايا: </span>
              <span style={{ fontSize: '0.82rem' }}>{o.giftIdeas}</span>
            </div>
          )}
          {o.notes && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>📝 ملاحظات: </span>
              <span style={{ fontSize: '0.82rem' }}>{o.notes}</span>
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
