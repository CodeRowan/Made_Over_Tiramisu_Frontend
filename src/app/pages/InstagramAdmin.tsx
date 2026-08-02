import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import { instagramAPI } from '../../services/api';
import { INSTAGRAM_POST_LIMITS } from '../../constants/fieldLimits';
import { LimitedField } from '../components/admin/LimitedField';
import { ImageUploadField } from '../components/admin/ImageUploadField';
import { SkeletonCard } from '../components/admin/Skeleton';
import { ConfirmDialog } from '../components/admin/ConfirmDialog';
import { useRealtimeUpdates } from '../../hooks/useAdminSocket';
import { useIsMobile } from '../../hooks/useIsMobile';

interface InstagramPost {
  _id: string;
  image: string;
  caption: string;
  link: string;
  likes: number;
  comments: number;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM = { image: '', caption: '', link: '', likes: 0, comments: 0, order: 0, isActive: true };

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

export function InstagramAdmin() {
  const isMobile = useIsMobile();
  const [items, setItems] = useState<InstagramPost[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { setStatus }: any = useOutletContext();

  const load = async () => {
    try {
      setPageLoading(true);
      const response = await instagramAPI.getAll();
      setItems(Array.isArray(response.data.posts) ? response.data.posts : []);
    } catch (error) {
      toast.error('Failed to load Instagram posts');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useRealtimeUpdates(['instagram:changed'], load);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  };

  const openEdit = (p: InstagramPost) => {
    setEditingId(p._id);
    setForm({ image: p.image, caption: p.caption || '', link: p.link || '', likes: p.likes, comments: p.comments, order: p.order, isActive: p.isActive });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setDeleting(true);
      await instagramAPI.delete(deleteTargetId);
      setItems(items.filter((p) => p._id !== deleteTargetId));
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Failed to delete post');
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const handleToggleActive = async (p: InstagramPost) => {
    try {
      const response = await instagramAPI.update(p._id, { isActive: !p.isActive });
      setItems(items.map((i) => (i._id === p._id ? response.data.post : i)));
    } catch (error) {
      toast.error('Failed to update post');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image.trim()) {
      toast.error('Please provide an image URL');
      return;
    }

    try {
      setLoading(true);
      setStatus('Saving...');
      if (editingId) {
        const response = await instagramAPI.update(editingId, form);
        setItems(items.map((i) => (i._id === editingId ? response.data.post : i)));
        toast.success('Post updated');
      } else {
        const response = await instagramAPI.create(form);
        setItems([response.data.post, ...items]);
        toast.success('Post added');
      }
      setStatus('Saved!');
      setTimeout(() => setStatus('No changes'), 2000);
      setShowModal(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save post');
      setStatus('Error saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: '1', overflow: 'auto', padding: isMobile ? '18px 16px 40px' : '26px 34px 60px' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '14px', marginBottom: '22px' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '20px', flex: 1 }}>
          Instagram feed <span style={{ color: '#9d8371', fontSize: '13px', fontWeight: 400 }}>({items.length})</span>
        </div>
        <button
          onClick={openCreate}
          style={{ height: '44px', padding: '0 20px', background: '#C0633A', border: 'none', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '14px', cursor: 'pointer', borderRadius: '10px' }}
        >
          + Add post
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {pageLoading && [1, 2, 3, 4].map((i) => <SkeletonCard key={i} imageHeight={160} />)}
        {!pageLoading && items.map((p) => (
          <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#FFFDF8', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(44,24,16,.08)' }}>
            <div style={{ height: '160px', background: '#EDE3D2', overflow: 'hidden' }}>
              {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9d8371' }}>No image</div>
              )}
            </div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: '#7a5c48' }}>♥ {p.likes} · 💬 {p.comments}</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleToggleActive(p)}
                  style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(44,24,16,.16)', background: p.isActive ? '#e8f5e9' : '#f2eadc', color: p.isActive ? '#22863a' : '#9d8371', cursor: 'pointer', flex: 1 }}
                >
                  {p.isActive ? 'Live' : 'Hidden'}
                </button>
                <button onClick={() => openEdit(p)} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#2C1810', color: '#F5EFE0', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => setDeleteTargetId(p._id)} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(44,24,16,.2)', background: 'transparent', color: '#a4522e', cursor: 'pointer' }}>Del</button>
              </div>
            </div>
          </motion.div>
        ))}
        {!pageLoading && items.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: '#7a5c48' }}>No posts yet. Add one to get started!</div>
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
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '20px' }}>{editingId ? 'Edit post' : 'Add post'}</div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Photo</label>
              <ImageUploadField value={form.image} onChange={(url) => setForm({ ...form, image: url })} previewHeight={140} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Caption (optional, not shown on site yet)</label>
              <LimitedField value={form.caption} onChange={(value) => setForm({ ...form, caption: value })} maxLength={INSTAGRAM_POST_LIMITS.caption} multiline />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Link to Instagram post (optional)</label>
              <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="https://instagram.com/p/..." style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Likes</label>
                <input type="number" min="0" value={form.likes} onChange={(e) => setForm({ ...form, likes: Number(e.target.value) })} style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Comments</label>
                <input type="number" min="0" value={form.comments} onChange={(e) => setForm({ ...form, comments: Number(e.target.value) })} style={inputStyle} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Show on website
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, height: '44px', background: 'transparent', border: '1px solid rgba(44,24,16,.2)', borderRadius: '8px', color: '#7a5c48', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ flex: 1, height: '44px', background: '#C0633A', border: 'none', borderRadius: '8px', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                {loading ? 'Saving...' : editingId ? 'Save changes' : 'Add post'}
              </button>
            </div>
          </motion.form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTargetId}
        title="Delete this post?"
        message="This Instagram post will be permanently removed from the feed. This can't be undone."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
