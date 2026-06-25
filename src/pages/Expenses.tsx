/* ===================================================================
   Expenses.tsx — المصاريف (نظرة عامة + الميزانية + السجل)
   فئات أساسية محمية + فئات مخصصة بإيموجي حر، ميزانيات بتنبيه 80/100%،
   Pie chart، يوم بدون مصاريف، صندوق الخير كفئة فعلية. الحالة عبر useCore.
   =================================================================== */

import { useState } from 'react';
import { useCore, todayStr, type ExpenseType } from '../core/useCore';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';

type Tab = 'overview' | 'budget' | 'list';

/* الفئات الأساسية المحمية (أيقونة + لون من لوحة الرسوم) */
const BASE_CATS: { name: string; icon: string; color: string }[] = [
  { name: 'طعام', icon: '🍽️', color: 'var(--chart-1)' },
  { name: 'نقل', icon: '🚗', color: 'var(--chart-2)' },
  { name: 'تسوق', icon: '🛍️', color: 'var(--chart-3)' },
  { name: 'فواتير', icon: '📄', color: 'var(--chart-4)' },
  { name: 'صحة', icon: '💊', color: 'var(--chart-5)' },
  { name: 'أخرى', icon: '📦', color: 'var(--chart-8)' },
  { name: 'صندوق الخير', icon: '🤲', color: 'var(--chart-6)' },
];

const CUSTOM_COLORS = ['var(--chart-7)', 'var(--chart-6)', 'var(--chart-5)', 'var(--chart-4)'];
const PAYMENTS = ['نقدي', 'بطاقة', 'تحويل بنكي'];
const monthOf = (d: string) => d.slice(0, 7);

export default function Expenses() {
  const core = useCore();
  const { expenses, customCategories, budgets } = core.state;

  const [tab, setTab] = useState<Tab>('overview');
  const [adding, setAdding] = useState(false);
  const [managing, setManaging] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* نموذج الإضافة */
  const [form, setForm] = useState({
    type: 'expense' as ExpenseType,
    amount: '',
    date: todayStr(),
    category: 'طعام',
    payment: 'نقدي',
    desc: '',
    notes: '',
  });
  const [sadaqah, setSadaqah] = useState('');
  const [newCat, setNewCat] = useState({ icon: '', name: '', note: '' });
  const [budgetForm, setBudgetForm] = useState({ category: 'طعام', amount: '' });

  /* بيانات الفئات المجمّعة (أساسية + مخصصة) */
  const allCats = [
    ...BASE_CATS,
    ...customCategories.map((c, i) => ({
      name: c.name,
      icon: c.icon,
      color: CUSTOM_COLORS[i % CUSTOM_COLORS.length],
    })),
  ];
  const catMeta = (name: string) =>
    allCats.find((c) => c.name === name) ?? { name, icon: '📦', color: 'var(--chart-8)' };

  /* إحصائيات */
  const income = expenses.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const expenseTotal = expenses.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const net = income - expenseTotal;
  const today = todayStr();
  const noExpenseToday = !expenses.some((e) => e.date === today && e.type === 'expense');

  /* مقارنة شهرية */
  const thisMonth = monthOf(today);
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const sumMonth = (m: string) =>
    expenses.filter((e) => e.type === 'expense' && monthOf(e.date) === m).reduce((s, e) => s + e.amount, 0);
  const thisM = sumMonth(thisMonth);
  const prevM = sumMonth(prevMonth);
  const diffPct = prevM > 0 ? Math.round(((thisM - prevM) / prevM) * 100) : null;

  /* توزيع الفئات للـ Pie */
  const catTotals: Record<string, number> = {};
  expenses.filter((e) => e.type === 'expense').forEach((e) => {
    catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
  });
  const pieEntries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const pieSum = pieEntries.reduce((s, [, v]) => s + v, 0) || 1;

  /* بناء مسارات Pie */
  let cum = 0;
  const r = 55, cx = 60, cy = 60;
  const piePaths = pieEntries.map(([cat, val]) => {
    const angle = (val / pieSum) * 360;
    const s = ((cum - 90) * Math.PI) / 180;
    const e = ((cum + angle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const large = angle > 180 ? 1 : 0;
    cum += angle;
    return { d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`, color: catMeta(cat).color, cat };
  });

  const handleSaveExpense = () => {
    const amt = Number(form.amount);
    if (!amt || amt <= 0) {
      setHint('⚠️ أدخل مبلغاً صحيحاً');
      return;
    }
    if (form.desc.trim() === '') {
      setHint('⚠️ أضف وصفاً');
      return;
    }
    core.addExpense({
      type: form.type,
      amount: amt,
      date: form.date,
      category: form.type === 'income' ? '' : form.category,
      payment: form.payment,
      desc: form.desc,
      notes: form.notes,
    });
    setForm({ ...form, amount: '', desc: '', notes: '' });
    setAdding(false);
    setHint('💾 سجّلنا الحركة');
  };

  const handleAddSadaqah = () => {
    const amt = Number(sadaqah);
    if (!amt || amt <= 0) {
      setHint('⚠️ أدخل مبلغاً صحيحاً');
      return;
    }
    core.addExpense({
      type: 'expense',
      amount: amt,
      date: today,
      category: 'صندوق الخير',
      payment: '',
      desc: 'صدقة',
      notes: '',
    });
    setSadaqah('');
    setHint('🤲 جزاك الله خير، سُجّلت صدقتك');
  };

  const handleAddCat = () => {
    const ok = core.addCustomCategory(newCat.name, newCat.icon, newCat.note);
    if (!ok) {
      setHint('⚠️ اسم الفئة فارغ أو مكرر');
      return;
    }
    setNewCat({ icon: '', name: '', note: '' });
    setHint('🏷️ أُضيفت الفئة');
  };

  const sadaqahTotal = catTotals['صندوق الخير'] || 0;

  return (
    <div className="page">
      <BackButton />

      <div className="subtabs">
        <button className={tab === 'overview' ? 'subtab active' : 'subtab'} onClick={() => setTab('overview')}>
          📊 نظرة عامة
        </button>
        <button className={tab === 'budget' ? 'subtab active' : 'subtab'} onClick={() => setTab('budget')}>
          💼 الميزانية
        </button>
        <button className={tab === 'list' ? 'subtab active' : 'subtab'} onClick={() => setTab('list')}>
          📋 السجل
        </button>
      </div>

      <button className="btn-primary" style={{ width: '100%', marginBottom: 14 }} onClick={() => setAdding((v) => !v)}>
        ➕ تسجيل حركة جديدة
      </button>

      {adding && (
        <div className="card">
          <div className="add-row" style={{ marginTop: 0, marginBottom: 12 }}>
            {(['expense', 'income'] as ExpenseType[]).map((t) => (
              <button
                key={t}
                className={form.type === t ? 'btn-primary' : 'btn-ghost'}
                style={{ flex: 1 }}
                onClick={() => setForm({ ...form, type: t })}
              >
                {t === 'expense' ? '❤️ مصروف' : '💚 دخل'}
              </button>
            ))}
          </div>
          <input
            className="input-field" type="number" min={0} placeholder="المبلغ (ر.س)"
            style={{ marginBottom: 10 }}
            value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <input
            className="input-field" type="date" style={{ marginBottom: 10 }}
            value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          {form.type === 'expense' && (
            <select
              className="input-field" style={{ marginBottom: 10 }}
              value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {allCats.map((c) => (
                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          )}
          <select
            className="input-field" style={{ marginBottom: 10 }}
            value={form.payment} onChange={(e) => setForm({ ...form, payment: e.target.value })}
          >
            {PAYMENTS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input
            className="input-field" placeholder="الوصف" maxLength={200} style={{ marginBottom: 10 }}
            value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })}
          />
          <textarea
            className="input-field" rows={2} placeholder="ملاحظات (اختياري)" maxLength={200}
            value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <button className="btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handleSaveExpense}>
            حفظ
          </button>
        </div>
      )}

      {tab === 'overview' && (
        <>
          <div className="money-stats">
            <div className="money-stat ms-income"><div className="money-stat-num">{income}</div><div className="money-stat-label">💚 الدخل</div></div>
            <div className="money-stat ms-expense"><div className="money-stat-num">{expenseTotal}</div><div className="money-stat-label">❤️ المصروف</div></div>
            <div className="money-stat ms-net"><div className="money-stat-num">{net}</div><div className="money-stat-label">💙 الصافي</div></div>
          </div>

          {noExpenseToday && (
            <div className="zero-day-card">
              <div style={{ fontSize: '1.8rem' }}>🌿</div>
              <div style={{ fontWeight: 800, marginTop: 6 }}>يوم بدون مصاريف! ادخار حقيقي يستحق الاحتفال</div>
            </div>
          )}

          {diffPct !== null && (
            <div className="intro-card">
              {diffPct < 0
                ? `📉 هذا الشهر أنفقت أقل من الماضي بـ ${Math.abs(diffPct)}% — استمر بهذا الانضباط!`
                : `📈 هذا الشهر أنفقت أكثر من الماضي بـ ${diffPct}% — انتبه لميزانيتك.`}
            </div>
          )}

          <div className="card">
            <div className="section-title">🥧 توزيع المصاريف حسب الفئة</div>
            {pieEntries.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>لا مصاريف بعد</div>
            ) : (
              <div className="pie-wrap">
                <svg width={120} height={120} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
                  {piePaths.map((p) => (
                    <path key={p.cat} d={p.d} fill={p.color} stroke="var(--surface)" strokeWidth={2} />
                  ))}
                  <circle cx={60} cy={60} r={28} fill="var(--surface)" />
                </svg>
                <div className="pie-legend">
                  {pieEntries.map(([cat, val]) => (
                    <div className="pie-legend-item" key={cat}>
                      <span className="pie-dot" style={{ background: catMeta(cat).color }} />
                      <span className="pie-legend-text">{catMeta(cat).icon} {cat}</span>
                      <span className="pie-legend-pct">{Math.round((val / pieSum) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="sadaqah-card">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ fontSize: '1.6rem' }}>🤲</div>
              <div>
                <div style={{ fontWeight: 800 }}>صندوق الخير الأسبوعي</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>مبلغ بسيط ثابت أسبوعياً</div>
              </div>
            </div>
            <div className="sadaqah-total">{sadaqahTotal} ر.س</div>
            <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>إجمالي ما تصدّقت به</div>
            <div className="add-row">
              <input
                className="input-field" type="number" min={0} placeholder="المبلغ هذا الأسبوع..."
                value={sadaqah} onChange={(e) => setSadaqah(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSadaqah()}
              />
              <button className="btn-ghost" onClick={handleAddSadaqah}>إضافة</button>
            </div>
          </div>
        </>
      )}

      {tab === 'budget' && (
        <>
          <div className="card">
            {Object.entries(budgets).map(([cat, limit]) => {
              const spent = catTotals[cat] || 0;
              const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
              const cls = pct >= 100 ? 'over' : pct >= 80 ? 'warn' : '';
              return (
                <div className="budget-row" key={cat}>
                  <div className="budget-top">
                    <div className="budget-cat">
                      <div className="budget-icon">{catMeta(cat).icon}</div>
                      <div className="budget-name">{cat}</div>
                    </div>
                    <div className="budget-amounts"><strong>{spent}</strong> / {limit} ر.س</div>
                  </div>
                  <div className="budget-bar-bg">
                    <div className={`budget-bar-fill ${cls}`} style={{ width: `${pct}%` }} />
                  </div>
                  {pct >= 80 && pct < 100 && <div className="budget-alert">⚠️ اقتربت من حد هذه الفئة</div>}
                  {pct >= 100 && <div className="budget-alert">🚨 تجاوزت السقف المحدد</div>}
                </div>
              );
            })}
          </div>

          <div className="card">
            <div className="section-title">⚙️ تعديل سقف فئة</div>
            <select
              className="input-field" style={{ marginBottom: 10 }}
              value={budgetForm.category} onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
            >
              {Object.keys(budgets).map((c) => <option key={c} value={c}>{catMeta(c).icon} {c}</option>)}
            </select>
            <div className="add-row" style={{ marginTop: 0 }}>
              <input
                className="input-field" type="number" min={0} placeholder="السقف الشهري (ر.س)"
                value={budgetForm.amount} onChange={(e) => setBudgetForm({ ...budgetForm, amount: e.target.value })}
              />
              <button
                className="btn-primary"
                onClick={() => {
                  const a = Number(budgetForm.amount);
                  if (!a || a <= 0) { setHint('⚠️ أدخل سقفاً صحيحاً'); return; }
                  core.setBudget(budgetForm.category, a);
                  setBudgetForm({ ...budgetForm, amount: '' });
                  setHint('💼 تم تحديث السقف');
                }}
              >
                حفظ
              </button>
            </div>
          </div>

          <button className="dashed-btn" onClick={() => setManaging((v) => !v)}>
            🏷️ إدارة الفئات المخصصة
          </button>

          {managing && (
            <div className="card" style={{ marginTop: 14 }}>
              {customCategories.length === 0 && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: 10 }}>
                  لا فئات مخصصة بعد. الفئات الأساسية الست + صندوق الخير محمية.
                </div>
              )}
              {customCategories.map((c) => (
                <div className="cat-manage-item" key={c.id}>
                  <div className="cat-manage-emoji">{c.icon}</div>
                  <div className="cat-manage-info">
                    <div className="cat-manage-name">{c.name}</div>
                    {c.note && <div className="cat-manage-note">📌 {c.note}</div>}
                  </div>
                  <button className="icon-btn" aria-label="حذف" onClick={() => core.removeCustomCategory(c.id, c.name)}>
                    🗑️
                  </button>
                </div>
              ))}
              <div className="add-row">
                <input
                  className="input-field emoji-input" placeholder="😀" maxLength={4}
                  value={newCat.icon} onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                />
                <input
                  className="input-field" placeholder="اسم الفئة" maxLength={200}
                  value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                />
              </div>
              <input
                className="input-field" placeholder="ملاحظة تذكيرية (اختياري)" maxLength={200}
                style={{ marginTop: 10 }}
                value={newCat.note} onChange={(e) => setNewCat({ ...newCat, note: e.target.value })}
              />
              <button className="btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handleAddCat}>
                ➕ إضافة الفئة
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'list' && (
        <>
          {expenses.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              💰 لا حركات مسجّلة بعد
            </div>
          ) : (
            [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1)).map((e) => {
              const isIncome = e.type === 'income';
              return (
                <div className="exp-item" key={e.id}>
                  <div className="exp-icon">{isIncome ? '💚' : catMeta(e.category).icon}</div>
                  <div className="exp-info">
                    <div className="exp-desc">{e.desc}</div>
                    <div className="exp-meta">
                      {e.date}{e.category ? ` · ${e.category}` : ''}{e.payment ? ` · ${e.payment}` : ''}
                    </div>
                  </div>
                  <div className={isIncome ? 'exp-amount income' : 'exp-amount expense'}>
                    {isIncome ? '+' : '-'}{e.amount} ر.س
                  </div>
                  <button className="icon-btn" aria-label="حذف" onClick={() => setDeleteId(e.id)}>
                    🗑️
                  </button>
                </div>
              );
            })
          )}
        </>
      )}

      {hint && <div className="hint-msg ok">{hint}</div>}

      <ConfirmDialog
        open={deleteId !== null}
        title="تأكيد الحذف"
        message="هل تريد حذف هذه الحركة نهائياً؟"
        confirmLabel="حذف"
        danger
        onConfirm={() => {
          if (deleteId) core.removeExpense(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
