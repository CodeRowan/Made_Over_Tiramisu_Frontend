import { useState, useEffect } from 'react';
import { toast } from '../components/ui/CommonToaster';
import { authAPI } from '../../services/api';
import { useIsMobile } from '../../hooks/useIsMobile';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function SettingsAdmin() {
  const isMobile = useIsMobile();
  const [user, setUser] = useState<User | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const userData = localStorage.getItem('adminUser');
      if (userData) setUser(JSON.parse(userData));
    } catch (error) {
      toast.error('Failed to load user info');
    }
  };

  const [errors, setErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({});

  const validateForm = () => {
    const newErrors: { currentPassword?: string; newPassword?: string; confirmPassword?: string } = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'This field is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'This field is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'This field is required';
    } else if (newPassword && confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields highlighted in red');
      return;
    }

    try {
      setLoading(true);
      await authAPI.changePassword(currentPassword, newPassword, confirmPassword);
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: "1", overflow: "auto", padding: isMobile ? "20px 16px 40px" : "26px 34px 60px" }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px", maxWidth: "920px" }}>
        {/* Account Info */}
        <div style={{ background: "#FFFDF8", borderRadius: "16px", padding: isMobile ? "20px" : "28px" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "19px", marginBottom: "18px" }}>
            Your account
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(44,24,16,.08)", paddingBottom: "12px" }}>
              <span style={{ color: "#7a5c48" }}>Name</span>
              <span>{user?.name || "Admin"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(44,24,16,.08)", paddingBottom: "12px" }}>
              <span style={{ color: "#7a5c48" }}>Email</span>
              <span>{user?.email || "admin@tiramisu.com"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(44,24,16,.08)", paddingBottom: "12px" }}>
              <span style={{ color: "#7a5c48" }}>Role</span>
              <span>{user?.role?.replace("_", " ") || "Super Admin"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#7a5c48" }}>With us since</span>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2024"}</span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div style={{ background: "#FFFDF8", borderRadius: "16px", padding: isMobile ? "20px" : "28px" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "19px", marginBottom: "18px" }}>
            Change your password
          </div>
          <form onSubmit={handleChangePassword} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Current Password */}
            <div>
              <div style={{ fontSize: "13px", color: errors.currentPassword ? "#EF4444" : "#7a5c48", marginBottom: "6px" }}>Current password</div>
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (errors.currentPassword) setErrors((prev) => ({ ...prev, currentPassword: undefined }));
                }}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 12px",
                  fontSize: "14px",
                  background: errors.currentPassword ? "rgba(239,68,68,.05)" : "rgba(245,239,224,.07)",
                  border: errors.currentPassword ? "1.5px solid #EF4444" : "1px solid rgba(44,24,16,.16)",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  color: "#2C1810",
                  outline: "none",
                }}
              />
              {errors.currentPassword && (
                <div style={{ color: "#EF4444", fontSize: "12px", marginTop: "4px", fontWeight: 500 }}>
                  {errors.currentPassword}
                </div>
              )}
            </div>

            {/* New Password */}
            <div>
              <div style={{ fontSize: "13px", color: errors.newPassword ? "#EF4444" : "#7a5c48", marginBottom: "6px" }}>New password</div>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 12px",
                  fontSize: "14px",
                  background: errors.newPassword ? "rgba(239,68,68,.05)" : "rgba(245,239,224,.07)",
                  border: errors.newPassword ? "1.5px solid #EF4444" : "1px solid rgba(44,24,16,.16)",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  color: "#2C1810",
                  outline: "none",
                }}
              />
              {errors.newPassword && (
                <div style={{ color: "#EF4444", fontSize: "12px", marginTop: "4px", fontWeight: 500 }}>
                  {errors.newPassword}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div style={{ fontSize: "13px", color: errors.confirmPassword ? "#EF4444" : "#7a5c48", marginBottom: "6px" }}>Type it once more</div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 12px",
                  fontSize: "14px",
                  background: errors.confirmPassword ? "rgba(239,68,68,.05)" : "rgba(245,239,224,.07)",
                  border: errors.confirmPassword ? "1.5px solid #EF4444" : "1px solid rgba(44,24,16,.16)",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  color: "#2C1810",
                  outline: "none",
                }}
              />
              {errors.confirmPassword && (
                <div style={{ color: "#EF4444", fontSize: "12px", marginTop: "4px", fontWeight: 500 }}>
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Show/Hide */}
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#7a5c48", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              Show passwords
            </label>

            <div style={{ fontSize: "12px", color: "#9d8371" }}>
              At least 8 characters, with one number in there somewhere.
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: "48px",
                alignSelf: "flex-start",
                padding: "0 22px",
                background: "#C0633A",
                border: "none",
                color: "#fff",
                fontFamily: "var(--font-heading)",
                fontWeight: "800",
                fontSize: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.8 : 1,
                borderRadius: "8px",
                transition: "background .2s",
              }}
              onMouseOver={e => !loading && ((e.currentTarget as HTMLElement).style.background = "#a4522e")}
              onMouseOut={e => !loading && ((e.currentTarget as HTMLElement).style.background = "#C0633A")}
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
