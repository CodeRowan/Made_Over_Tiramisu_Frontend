import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { activityLogAPI } from '../../services/api';
import { SkeletonBlock, SkeletonRow } from '../components/admin/Skeleton';
import { useRealtimeUpdates } from '../../hooks/useAdminSocket';
import { useIsMobile } from '../../hooks/useIsMobile';

interface ActivityLog {
  _id: string;
  admin?: { name: string; email: string };
  action: string;
  resourceType: string;
  changesSummary: string;
  createdAt: string;
}

interface ActivityStats {
  totalLogs: number;
  logsLast7Days: number;
}

export function ActivityLogAdmin() {
  const isMobile = useIsMobile();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const loadActivityData = async () => {
    try {
      setPageLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        activityLogAPI.getAll(50, 0),
        activityLogAPI.getStats(),
      ]);

      setLogs(Array.isArray(logsRes.data.logs) ? logsRes.data.logs : []);
      setStats(statsRes.data.stats || null);
    } catch (error) {
      console.error('Failed to load activity data:', error);
      toast.error('Failed to load activity log');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadActivityData();
  }, []);

  useRealtimeUpdates(['activity:changed'], loadActivityData);

  const getDotColor = (action: string) => {
    const colorMap: Record<string, string> = {
      create: '#5A7A40',
      edit: '#C9A87C',
      delete: '#a4522e',
      login: '#8B6B4A',
    };
    const key = Object.keys(colorMap).find((k) => action.includes(k));
    return colorMap[key || 'edit'];
  };

  // Some summaries embed raw Cloudinary URLs, which are long unbroken
  // strings — truncate so a single entry can't blow out the row.
  const formatSummary = (summary: string) => (summary.length > 140 ? `${summary.slice(0, 140)}…` : summary);

  return (
    <div style={{ flex: "1", overflow: "auto", padding: isMobile ? "18px 16px 40px" : "26px 34px 60px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? "12px" : "24px", marginBottom: "18px", maxWidth: "920px" }}>
        {[
          { label: 'Total actions logged', value: stats?.totalLogs },
          { label: 'In the last 7 days', value: stats?.logsLast7Days },
        ].map((card) => (
          <div key={card.label} style={{ background: "#FFFDF8", borderRadius: "12px", padding: isMobile ? "14px 16px" : "16px 22px", flex: isMobile ? "1 1 140px" : 1 }}>
            {pageLoading ? (
              <div style={{ marginBottom: "6px" }}><SkeletonBlock width={40} height={22} /></div>
            ) : (
              <div style={{ fontSize: "22px", fontFamily: "var(--font-heading)", fontWeight: 800, color: "#2C1810" }}>{card.value}</div>
            )}
            <div style={{ fontSize: "12px", color: "#7a5c48" }}>{card.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#FFFDF8", borderRadius: "16px", overflow: "hidden", maxWidth: "920px" }}>
        {pageLoading ? (
          <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
          </div>
        ) : logs.length > 0 ? (
          logs.map((log, i) => (
            <div key={log._id} style={{ display: "flex", gap: isMobile ? "10px" : "16px", alignItems: isMobile ? "flex-start" : "center", padding: isMobile ? "14px 16px" : "18px 22px", borderBottom: i < logs.length - 1 ? "1px solid rgba(44,24,16,.08)" : "none" }}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: getDotColor(log.action),
                  flex: "none",
                  marginTop: isMobile ? "5px" : "0",
                }}
              ></span>
              <div style={{ flex: "1", minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#2C1810", overflowWrap: "break-word", wordBreak: "break-word" }}>
                  {formatSummary(log.changesSummary || `${log.action} ${log.resourceType}`)}
                </div>
                <div style={{ fontSize: "12px", color: "#7a5c48", marginTop: "2px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <span>{log.admin?.name || "Admin"} · {log.resourceType}</span>
                  {isMobile && <span style={{ color: "#9d8371" }}>· {new Date(log.createdAt).toLocaleDateString()}</span>}
                </div>
              </div>
              {!isMobile && (
                <span style={{ fontSize: "12px", color: "#9d8371", flex: "none" }}>
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#9d8371" }}>
            No activity logs yet
          </div>
        )}
      </div>
    </div>
  );
}
