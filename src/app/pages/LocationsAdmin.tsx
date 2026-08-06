import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { toast } from '../components/ui/CommonToaster';
import { locationsAPI } from '../../services/api';
import { LOCATION_LIMITS } from '../../constants/fieldLimits';
import { LimitedField } from '../components/admin/LimitedField';
import { SkeletonRow } from '../components/admin/Skeleton';
import { ConfirmDialog } from '../components/admin/ConfirmDialog';
import { useRealtimeUpdates } from '../../hooks/useAdminSocket';
import { useIsMobile } from '../../hooks/useIsMobile';

interface StoreLocation {
  _id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapEmbedUrl: string;
  orderLink: string;
  order: number;
  isActive: boolean;
}

const EMPTY_FORM = { name: '', address: '', phone: '', email: '', hours: '', mapEmbedUrl: '', orderLink: '', order: 0, isActive: true };

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

export function LocationsAdmin() {
  const isMobile = useIsMobile();
  const [items, setItems] = useState<StoreLocation[]>([]);
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
      const response = await locationsAPI.getAll();
      setItems(Array.isArray(response.data.locations) ? response.data.locations : []);
    } catch (error) {
      toast.error('Failed to load locations');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useRealtimeUpdates(['locations:changed'], load);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (l: StoreLocation) => {
    setEditingId(l._id);
    setForm({
      name: l.name, address: l.address, phone: l.phone || '', email: l.email || '',
      hours: l.hours || '', mapEmbedUrl: l.mapEmbedUrl || '', orderLink: l.orderLink || '',
      order: l.order, isActive: l.isActive,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleFieldChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'This field is required';
    if (!form.address.trim()) newErrors.address = 'This field is required';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (form.orderLink.trim() && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/.*)?$/i.test(form.orderLink.trim())) {
      newErrors.orderLink = 'Please enter a valid order URL (e.g. https://...)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await locationsAPI.delete(deleteTarget.id);
      setItems(items.filter((l) => l._id !== deleteTarget.id));
      toast.success('Location deleted');
    } catch (error) {
      toast.error('Failed to delete location');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleActive = async (l: StoreLocation) => {
    try {
      const response = await locationsAPI.update(l._id, { isActive: !l.isActive });
      setItems(items.map((i) => (i._id === l._id ? response.data.location : i)));
    } catch (error) {
      toast.error('Failed to update location');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields highlighted in red');
      return;
    }

    try {
      setLoading(true);
      setStatus('Saving...');
      if (editingId) {
        const response = await locationsAPI.update(editingId, form);
        setItems(items.map((i) => (i._id === editingId ? response.data.location : i)));
        toast.success('Location updated');
      } else {
        const response = await locationsAPI.create(form);
        setItems([response.data.location, ...items]);
        toast.success('Location added');
      }
      setStatus('Saved!');
      setTimeout(() => setStatus('No changes'), 2000);
      setShowModal(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save location');
      setStatus('Error saving');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: '1', overflow: 'auto', padding: isMobile ? '18px 16px 40px' : '26px 34px 60px' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '14px', marginBottom: '22px' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '20px', flex: 1 }}>
          Locations <span style={{ color: '#9d8371', fontSize: '13px', fontWeight: 400 }}>({items.length})</span>
        </div>
        <button
          onClick={openCreate}
          style={{ height: '44px', padding: '0 20px', background: '#C0633A', border: 'none', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '14px', cursor: 'pointer', borderRadius: '10px' }}
        >
          + Add location
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {pageLoading && [1, 2].map((i) => <SkeletonRow key={i} />)}
        {!pageLoading && items.map((l) => (
          <motion.div key={l._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: '#FFFDF8', borderRadius: '10px', padding: '16px 18px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-start', gap: '16px', boxShadow: '0 1px 3px rgba(44,24,16,.08)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>{l.name}</span>
                {!l.orderLink && (
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '6px', background: '#FBEBD3', color: '#a4522e', fontWeight: 700 }}>
                    No order link
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: '#4A2E1A', marginTop: '4px' }}>{l.address}</div>
              <div style={{ fontSize: '12px', color: '#9d8371', marginTop: '2px' }}>{l.phone} {l.hours ? `· ${l.hours}` : ''}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={() => handleToggleActive(l)}
                style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(44,24,16,.16)', background: l.isActive ? '#e8f5e9' : '#f2eadc', color: l.isActive ? '#22863a' : '#9d8371', cursor: 'pointer' }}
              >
                {l.isActive ? 'Live' : 'Hidden'}
              </button>
              <button onClick={() => openEdit(l)} style={{ fontSize: '13px', padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#2C1810', color: '#F5EFE0', cursor: 'pointer' }}>Edit</button>
              <button onClick={() => setDeleteTarget({ id: l._id, name: l.name })} style={{ fontSize: '13px', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(44,24,16,.2)', background: 'transparent', color: '#a4522e', cursor: 'pointer' }}>Delete</button>
            </div>
          </motion.div>
        ))}
        {!pageLoading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7a5c48' }}>No locations yet. Add one to get started!</div>
        )}
      </div>

      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(44,24,16,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            noValidate
            style={{ background: '#FFFDF8', borderRadius: '14px', padding: '28px', width: 'min(480px, 92vw)', maxHeight: '88vh', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '20px' }}>{editingId ? 'Edit location' : 'Add location'}</div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Location name</label>
              <LimitedField value={form.name} onChange={(value) => handleFieldChange('name', value)} maxLength={LOCATION_LIMITS.name} placeholder="Hope Island" error={errors.name} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Address</label>
              <LimitedField value={form.address} onChange={(value) => handleFieldChange('address', value)} maxLength={LOCATION_LIMITS.address} placeholder="Mariners Cove, Hope Island QLD 4212" error={errors.address} />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Phone</label>
                <LimitedField value={form.phone} onChange={(value) => handleFieldChange('phone', value)} maxLength={LOCATION_LIMITS.phone} placeholder="+61 400 000 001" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Hours</label>
                <LimitedField value={form.hours} onChange={(value) => handleFieldChange('hours', value)} maxLength={LOCATION_LIMITS.hours} placeholder="Tue–Sun: 10am–6pm" />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Email</label>
              <LimitedField value={form.email} onChange={(value) => handleFieldChange('email', value)} maxLength={LOCATION_LIMITS.email} placeholder="hello@madovertiramisu.com.au" error={errors.email} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Google Maps embed URL</label>
              <input value={form.mapEmbedUrl} onChange={(e) => handleFieldChange('mapEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Order link</label>
              <input
                value={form.orderLink}
                onChange={(e) => handleFieldChange('orderLink', e.target.value)}
                placeholder="https://... (UberEats, DoorDash, a form, WhatsApp — any link)"
                style={{
                  ...inputStyle,
                  border: errors.orderLink ? '1.5px solid #EF4444' : '1.8px solid rgba(44,24,16,.2)',
                  background: errors.orderLink ? 'rgba(239,68,68,.05)' : 'rgba(245,239,224,.07)',
                }}
              />
              {errors.orderLink ? (
                <div style={{ color: "#EF4444", fontSize: "12px", marginTop: "4px", fontWeight: 500 }}>
                  {errors.orderLink}
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: '#9d8371', marginTop: '5px' }}>
                  Where "Order Now" sends customers for this location. Leave blank to show "Coming Soon" instead.
                </div>
              )}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Show on website
            </label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, height: '44px', background: 'transparent', border: '1px solid rgba(44,24,16,.2)', borderRadius: '8px', color: '#7a5c48', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ flex: 1, height: '44px', background: '#C0633A', border: 'none', borderRadius: '8px', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1 }}>
                {loading ? 'Saving...' : editingId ? 'Save changes' : 'Add location'}
              </button>
            </div>
          </motion.form>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this location?"
        message={`"${deleteTarget?.name}" will be permanently removed. This can't be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
