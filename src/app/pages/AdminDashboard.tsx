import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, contactAPI, activityLogAPI } from '../../services/api';
import { authStorage } from '../../services/authStorage';
import { SkeletonBlock } from '../components/admin/Skeleton';
import { useRealtimeUpdates } from '../../hooks/useAdminSocket';
import { useIsMobile } from '../../hooks/useIsMobile';

export function AdminDashboard() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ products: 0, messages: 0, unread: 0, changesLast7Days: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const navigate = useNavigate();

  const loadDashboard = async () => {
    try {
      setPageLoading(true);
      const [prodRes, msgRes, unreadRes, actRes, activityStatsRes] = await Promise.all([
        productsAPI.getAll(1000, 0),
        contactAPI.getAll(1000, 0),
        contactAPI.getUnreadCount(),
        activityLogAPI.getAll(5, 0),
        activityLogAPI.getStats(),
      ]);

      setStats({
        products: prodRes.data.products?.length || 0,
        messages: msgRes.data.messages?.length || 0,
        unread: unreadRes.data.count || 0,
        changesLast7Days: activityStatsRes.data.stats?.logsLast7Days || 0,
      });

      setActivity(
        (actRes.data.logs || []).map((a: any) => {
          const summary = a.changesSummary || `${a.action} ${a.resourceType}`;
          return {
            dot: '#C9A87C',
            // Some summaries embed raw Cloudinary URLs — long unbroken
            // strings that would otherwise force this narrow card wider
            // than the page.
            what: summary.length > 100 ? `${summary.slice(0, 100)}…` : summary,
            when: new Date(a.createdAt).toLocaleDateString(),
          };
        })
      );
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    // authStorage.getUser() already guards against a corrupt stored profile
    setUser(authStorage.getUser());
    loadDashboard();
  }, []);

  useRealtimeUpdates(['products:changed', 'messages:changed', 'activity:changed'], loadDashboard);

  return (
    <div style={{ flex: "1", overflow: "auto", padding: isMobile ? "20px 16px 40px" : "30px 34px 60px" }}>
      <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: isMobile ? "24px" : "30px", marginBottom: "8px" }}>
        Good morning, {user?.name || 'Admin'}
      </div>
      <p style={{ color: "#7a5c48", marginBottom: "24px" }}>
        Here is what is happening on madovertiramisu.com.au today.
      </p>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: isMobile ? "14px" : "20px", marginBottom: "30px" }}>
        {[
          { label: 'Total Products', value: stats.products, sub: 'Total menu items' },
          { label: 'Total Messages', value: stats.messages, sub: 'From customers' },
          { label: 'Unread', value: stats.unread, sub: 'Need attention' },
          { label: 'Changes', value: stats.changesLast7Days, sub: 'Last 7 days' },
        ].map((card) => (
          <div key={card.label} style={{ background: "#FFFDF8", borderRadius: "16px", padding: isMobile ? "16px" : "24px", transition: "transform .2s ease", cursor: "pointer" }} onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"} onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = "none"}>
            <div style={{ fontSize: "12px", color: "#7a5c48" }}>{card.label}</div>
            {pageLoading ? (
              <div style={{ margin: "10px 0 6px" }}><SkeletonBlock width={60} height={36} /></div>
            ) : (
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: isMobile ? "30px" : "42px", lineHeight: "1.15", margin: "6px 0 2px" }}>
                {card.value}
              </div>
            )}
            <div style={{ fontSize: "12px", color: "#C0633A" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Jump Straight In */}
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "18px", marginBottom: "14px" }}>Jump straight in</div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "12px" : "18px" }}>
            <button onClick={() => navigate('/admin/content')} style={{ textAlign: "left", background: "#FFFDF8", borderRadius: "16px", border: "0", padding: isMobile ? "16px" : "24px", cursor: "pointer", font: "inherit", transition: "transform .2s ease" }} onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"} onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = "none"}>
              <div style={{ fontSize: "24px" }}>✏️</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "17px", marginTop: "10px" }}>Edit the website</div>
              <div style={{ fontSize: "13px", color: "#7a5c48" }}>Eleven sections — words, photos and the video.</div>
            </button>
            <button onClick={() => navigate('/admin/products')} style={{ textAlign: "left", background: "#FFFDF8", borderRadius: "16px", border: "0", padding: isMobile ? "16px" : "24px", cursor: "pointer", font: "inherit", transition: "transform .2s ease" }} onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"} onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = "none"}>
              <div style={{ fontSize: "24px" }}>🍰</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "17px", marginTop: "10px" }}>The menu</div>
              <div style={{ fontSize: "13px", color: "#7a5c48" }}>Prices, photos, descriptions and sold-out badges.</div>
            </button>
            <button onClick={() => navigate('/admin/messages')} style={{ textAlign: "left", background: "#FFFDF8", borderRadius: "16px", border: "0", padding: isMobile ? "16px" : "24px", cursor: "pointer", font: "inherit", transition: "transform .2s ease" }} onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"} onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = "none"}>
              <div style={{ fontSize: "24px" }}>💌</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "17px", marginTop: "10px" }}>Messages</div>
              <div style={{ fontSize: "13px", color: "#7a5c48" }}>{stats.unread} unread message{stats.unread !== 1 ? 's' : ''}</div>
            </button>
            <button onClick={() => navigate('/admin/activity-log')} style={{ textAlign: "left", background: "#FFFDF8", borderRadius: "16px", border: "0", padding: isMobile ? "16px" : "24px", cursor: "pointer", font: "inherit", transition: "transform .2s ease" }} onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"} onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = "none"}>
              <div style={{ fontSize: "24px" }}>↻</div>
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "17px", marginTop: "10px" }}>Activity log</div>
              <div style={{ fontSize: "13px", color: "#7a5c48" }}>Every change, who made it and when.</div>
            </button>
          </div>
        </div>

        {/* What Happened Lately */}
        <div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "18px", marginBottom: "14px" }}>What happened lately</div>
          <div style={{ background: "#FFFDF8", borderRadius: "16px", overflow: "hidden" }}>
            {pageLoading ? (
              <div style={{ padding: "15px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                {[1, 2, 3].map((i) => <SkeletonBlock key={i} height={14} width={`${90 - i * 10}%`} />)}
              </div>
            ) : activity.length > 0 ? (
              activity.map((r: any, i: number) => (
                <div key={i} style={{ display: "flex", gap: "14px", alignItems: "center", padding: "15px 18px", borderBottom: i < activity.length - 1 ? "1px solid rgba(44,24,16,.08)" : "none" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: r.dot, flex: "none" }}></span>
                  <span style={{ flex: "1", minWidth: 0, fontSize: "13px", overflowWrap: "break-word", wordBreak: "break-word" }}>{r.what}</span>
                  <span style={{ fontSize: "12px", color: "#9d8371", flex: "none" }}>{r.when}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: "#9d8371", fontSize: "13px" }}>
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
