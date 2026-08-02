interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Replaces window.confirm() for destructive actions (delete) — styled to
 * match the rest of the admin UI instead of a native browser dialog.
 */
export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', loading = false, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, background: 'rgba(44,24,16,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#FFFDF8', borderRadius: '14px', padding: '26px', width: 'min(400px, 90vw)', display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '18px', color: '#2C1810' }}>
          {title}
        </div>
        <p style={{ fontSize: '13px', color: '#7a5c48', margin: 0, lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, height: '42px', background: 'transparent', border: '1px solid rgba(44,24,16,.2)', borderRadius: '8px', color: '#7a5c48', cursor: 'pointer', font: 'inherit', fontSize: '13px' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, height: '42px', background: '#a4522e', border: 'none', borderRadius: '8px', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
