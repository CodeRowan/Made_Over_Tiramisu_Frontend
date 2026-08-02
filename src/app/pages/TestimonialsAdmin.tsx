import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import { testimonialsAPI } from '../../services/api';
import { TESTIMONIAL_LIMITS } from '../../constants/fieldLimits';
import { LimitedField } from '../components/admin/LimitedField';
import { SkeletonRow } from '../components/admin/Skeleton';
import { ConfirmDialog } from '../components/admin/ConfirmDialog';
import { useRealtimeUpdates } from '../../hooks/useAdminSocket';
import { useIsMobile } from '../../hooks/useIsMobile';

interface Testimonial {
  _id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM = { name: '', location: '', text: '', rating: 5, order: 0, isActive: true };

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  padding: '0 12px',
  fontSize: '14px',
  background: 'rgba(245,239,224,.07)',
  border: '1px solid rgba(44,24,16,.16)',
  borderRadius: '8px',
  color: '#2C1810',
  boxSizing: 'border-box',
};

export function TestimonialsAdmin() {
  const isMobile = useIsMobile();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { setStatus }: any = useOutletContext();

  const load = async () => {
    try {
      setPageLoading(true);
      const response = await testimonialsAPI.getAll();
      setItems(Array.isArray(response.data.testimonials) ? response.data.testimonials : []);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useRealtimeUpdates(['testimonials:changed'], load);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditingId(t._id);
    setForm({ name: t.name, location: t.location || '', text: t.text, rating: t.rating, order: t.order, isActive: t.isActive });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await testimonialsAPI.delete(deleteTarget.id);
      setItems(items.filter((t) => t._id !== deleteTarget.id));
      toast.success('Review deleted');
    } catch (error) {
      toast.error('Failed to delete review');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleActive = async (t: Testimonial) => {
    try {
      const response = await testimonialsAPI.update(t._id, { isActive: !t.isActive });
      setItems(items.map((i) => (i._id === t._id ? response.data.testimonial : i)));
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) {
      toast.error('Please fill in name and review text');
      return;
    }

    try {
      setLoading(true);
      setStatus('Saving...');
      if (editingId) {
        const response = await testimonialsAPI.update(editingId, form);
        setItems(items.map((i) => (i._id === editingId ? response.data.testimonial : i)));
        toast.success('Review updated');
      } else {
        const response = await testimonialsAPI.create(form);
        setItems([response.data.testimonial, ...items]);
        toast.success('Review added');
      }
      setStatus('Saved!');
      setTimeout(() => setStatus('No changes'), 2000);
      setShowModal(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save review');
      setStatus('Error saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: '1', overflow: 'auto', padding: isMobile ? '18px 16px 40px' : '26px 34px 60px' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '14px', marginBottom: '22px' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '20px', flex: 1 }}>
          Testimonials <span style={{ color: '#9d8371', fontSize: '13px', fontWeight: 400 }}>({items.length})</span>
        </div>
        <button
          onClick={openCreate}
          style={{ height: '44px', padding: '0 20px', background: '#C0633A', border: 'none', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '14px', cursor: 'pointer', borderRadius: '10px' }}
        >
          + Add review
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {pageLoading && [1, 2, 3].map((i) => <SkeletonRow key={i} />)}
        {!pageLoading && items.map((t) => (
          <motion.div
            key={t._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ background: '#FFFDF8', borderRadius: '10px', padding: '16px 18px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-start', gap: '16px', boxShadow: '0 1px 3px rgba(44,24,16,.08)' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>{t.name}</span>
                <span style={{ fontSize: '12px', color: '#9d8371' }}>{t.location}</span>
                <span style={{ fontSize: '12px', color: '#C0633A' }}>{'★'.repeat(t.rating)}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#4A2E1A', marginTop: '4px' }}>{t.text}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => handleToggleActive(t)}
                style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(44,24,16,.16)', background: t.isActive ? '#e8f5e9' : '#f2eadc', color: t.isActive ? '#22863a' : '#9d8371', cursor: 'pointer' }}
              >
                {t.isActive ? 'Live' : 'Hidden'}
              </button>
              <button onClick={() => openEdit(t)} style={{ fontSize: '13px', padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#2C1810', color: '#F5EFE0', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => setDeleteTarget({ id: t._id, name: t.name })} style={{ fontSize: '13px', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(44,24,16,.2)', background: 'transparent', color: '#a4522e', cursor: 'pointer' }}>Delete</button>
            </div>
          </motion.div>
        ))}
        {!pageLoading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7a5c48' }}>No reviews yet. Add one to get started!</div>
        )}
      </div>

      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(44,24,16,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            style={{ background: '#FFFDF8', borderRadius: '14px', padding: '28px', width: 'min(460px, 92vw)', maxHeight: '88vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '20px' }}>{editingId ? 'Edit review' : 'Add review'}</div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Customer name</label>
              <LimitedField value={form.name} onChange={(value) => setForm({ ...form, name: value })} maxLength={TESTIMONIAL_LIMITS.name} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Location</label>
              <LimitedField value={form.location} onChange={(value) => setForm({ ...form, location: value })} maxLength={TESTIMONIAL_LIMITS.location} placeholder="Gold Coast, QLD" />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Review text</label>
              <LimitedField value={form.text} onChange={(value) => setForm({ ...form, text: value })} maxLength={TESTIMONIAL_LIMITS.text} multiline />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Rating</label>
              <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} style={inputStyle}>
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} star{r !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Show on website
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, height: '44px', background: 'transparent', border: '1px solid rgba(44,24,16,.2)', borderRadius: '8px', color: '#7a5c48', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ flex: 1, height: '44px', background: '#C0633A', border: 'none', borderRadius: '8px', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                {loading ? 'Saving...' : editingId ? 'Save changes' : 'Add review'}
              </button>
            </div>
          </motion.form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this review?"
        message={`The review from "${deleteTarget?.name}" will be permanently removed. This can't be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
