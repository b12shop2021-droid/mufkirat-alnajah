/* ===================================================================
   Identity.tsx — بطاقة الهوية الشخصية + دستور الذات (حد 5 قواعد)
   كل الحالة عبر useCore المركزي.
   =================================================================== */

import { useState } from 'react';
import { useCore } from '../core/useCore';
import { saveLabel } from '../core/saveLabel';
import XPBar from '../components/XPBar';
import BackButton from '../components/BackButton';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Identity({ embedded = false }: { embedded?: boolean }) {
  const core = useCore();
  const { identityStatement, constitution } = core.state;
  const nick = core.state.profile.nickname || core.state.profile.name || 'بطل';
  const v = (m: string, f: string) => (core.state.profile.gender === 'female' ? f : m);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(identityStatement);
  const [rule, setRule] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; label: string } | null>(
    null,
  );

  const full = constitution.length >= 5;

  /* حفظ جملة الهوية */
  const handleSaveIdentity = () => {
    if (draft.trim() === '') {
      setHint('⚠️ اكتب وصفك أولاً');
      return;
    }
    core.setIdentity(draft);
    setEditing(false);
    setHint('🪪 حدّثنا بطاقتك');
  };

  /* إضافة قاعدة للدستور */
  const handleAddRule = () => {
    if (rule.trim() === '') {
      setHint('⚠️ اكتب القاعدة أولاً');
      return;
    }
    const ok = core.addConstRule(rule);
    if (!ok) {
      setHint('📜 اكتمل دستورك بخمس قواعد');
      return;
    }
    setRule('');
    setHint(null);
  };

  return (
    <div className="page">
      {!embedded && <BackButton />}
      {!embedded && <XPBar />}

      <h2 className="section-title">🪪 بطاقة هويتي الشخصية</h2>
      <div className="id-card">
        <div className="id-chip">بطاقة هوية النجاح</div>
        <div className="id-statement">
          {identityStatement
            ? `"أنا شخص ${identityStatement}"`
            : '"عرّف نفسك: من تطمح أن تكون؟"'}
        </div>
        <button
          className="btn-ghost"
          style={{ width: '100%', marginTop: 14 }}
          onClick={() => {
            setDraft(identityStatement);
            setEditing((v) => !v);
          }}
        >
          ✏️ تعديل بطاقتي
        </button>
        <div className="linked-tags">
          <span className="linked-tag">🔗 الروتين الصباحي</span>
          <span className="linked-tag">🔗 السلسلة 🔥</span>
        </div>
      </div>

      {editing && (
        <div className="card" style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
            أنا شخص...
          </div>
          <textarea
            className="input-field formal-text"
            rows={3}
            placeholder="اكتب الجملة التي تصف الشخص الذي تطمح أن تكونه..."
            value={draft}
            maxLength={200}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: 12 }}
            onClick={handleSaveIdentity}
          >
            {saveLabel(nick)}
          </button>
        </div>
      )}

      <h2 className="section-title" style={{ marginTop: 18 }}>
        📜 دستور الذات
      </h2>
      <div className="insight-card" style={{ marginTop: 0, marginBottom: 14 }}>
        قواعد حياتك الشخصية الخمس — ليست واجبات بل قيم تختارها بنفسك، تذكّرك بمن
        تريد أن تكون.
      </div>

      {constitution.map((c, i) => (
        <div className="const-item" key={c.id}>
          <div className="const-num">{i + 1}</div>
          <div className="const-text">{c.text}</div>
          <button
            className="icon-btn"
            aria-label="حذف"
            onClick={() => setPendingDelete({ id: c.id, label: c.text })}
          >
            🗑️
          </button>
        </div>
      ))}

      {full ? (
        <div className="hint-msg ok">
          📜 اكتمل دستورك بخمس قواعد — احذف قاعدة لإضافة أخرى
        </div>
      ) : (
        <div className="add-row">
          <input
            className="input-field"
            placeholder={`${v('ضِف', 'ضيفي')} قاعدة (مثال: أصلّي صلاتي بوقتها)`}
            value={rule}
            maxLength={200}
            onChange={(e) => setRule(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
          />
          <button className="btn-primary" onClick={handleAddRule}>
            إضافة
          </button>
        </div>
      )}

      {hint && <div className="hint-msg ok">{hint}</div>}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="تأكيد الحذف"
        message={`تبي تشيل «${pendingDelete?.label ?? ''}» من دستورك؟`}
        confirmLabel="حذف"
        danger
        onConfirm={() => {
          if (pendingDelete) core.removeConstRule(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
