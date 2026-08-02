import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import { contactAPI } from '../../services/api';
import { SkeletonRow } from '../components/admin/Skeleton';
import { ConfirmDialog } from '../components/admin/ConfirmDialog';
import { useRealtimeUpdates } from '../../hooks/useAdminSocket';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  isRead: boolean;
  emailSent: boolean;
  emailError?: string | null;
  createdAt: string;
}

export function MessagesAdmin() {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { fetchStats }: any = useOutletContext();

  const load = async () => {
    try {
      setPageLoading(true);
      const response = await contactAPI.getAll(100, 0);
      setMessages(Array.isArray(response.data.messages) ? response.data.messages : []);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useRealtimeUpdates(['messages:changed'], load);

  const handleMarkAsRead = async (m: ContactMessage) => {
    if (m.isRead) return;
    try {
      await contactAPI.markAsRead(m._id);
      setMessages(messages.map((msg) => (msg._id === m._id ? { ...msg, isRead: true } : msg)));
      fetchStats?.();
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await contactAPI.delete(deleteTarget.id);
      setMessages(messages.filter((m) => m._id !== deleteTarget.id));
      toast.success('Message deleted');
      fetchStats?.();
    } catch (error) {
      toast.error('Failed to delete message');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div style={{ flex: '1', overflow: 'auto', padding: isMobile ? '18px 16px 40px' : '26px 34px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '20px' }}>
          Messages{' '}
          <span style={{ color: '#9d8371', fontSize: '13px', fontWeight: 400 }}>
            ({messages.length}{unreadCount > 0 ? `, ${unreadCount} unread` : ''})
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '760px' }}>
        {pageLoading && [1, 2, 3].map((i) => <SkeletonRow key={i} />)}

        {!pageLoading && messages.map((m) => (
          <motion.div
            key={m._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => handleMarkAsRead(m)}
            style={{
              background: m.isRead ? '#FFFDF8' : '#FFF7EC',
              borderRadius: '12px',
              padding: isMobile ? '16px' : '18px 20px',
              boxShadow: '0 1px 3px rgba(44,24,16,.08)',
              border: m.isRead ? 'none' : '1px solid rgba(192,99,58,.25)',
              cursor: m.isRead ? 'default' : 'pointer',
            }}
          >
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {!m.isRead && (
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C0633A', flexShrink: 0 }} />
                  )}
                  <span style={{ fontWeight: 700, fontSize: '14px', color: '#2C1810' }}>{m.name}</span>
                  <a
                    href={`mailto:${m.email}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: '12px', color: '#8B6B4A' }}
                  >
                    {m.email}
                  </a>
                  {m.phone && <span style={{ fontSize: '12px', color: '#9d8371' }}>· {m.phone}</span>}
                </div>
                <p style={{ fontSize: '13px', color: '#4A2E1A', marginTop: '8px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {m.message}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#9d8371' }}>
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                  <span
                    title={m.emailError || undefined}
                    style={{
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: m.emailSent ? '#e8f5e9' : '#FBEBD3',
                      color: m.emailSent ? '#22863a' : '#a4522e',
                      fontWeight: 700,
                    }}
                  >
                    {m.emailSent ? 'Email notified ✓' : 'Notification failed'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <a
                  href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: your message to Mad Over Tiramisu`)}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    height: '36px', padding: '0 14px', display: 'inline-flex', alignItems: 'center',
                    background: '#2C1810', color: '#F5EFE0', fontSize: '12px', textDecoration: 'none',
                    borderRadius: '6px',
                  }}
                >
                  Reply
                </a>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({ id: m._id, name: m.name });
                  }}
                  style={{
                    height: '36px', padding: '0 14px', background: 'transparent',
                    border: '1px solid rgba(44,24,16,.2)', color: '#a4522e', fontSize: '12px',
                    borderRadius: '6px', cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {!pageLoading && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#7a5c48' }}>
            No messages yet.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this message?"
        message={`The message from "${deleteTarget?.name}" will be permanently removed. This can't be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
