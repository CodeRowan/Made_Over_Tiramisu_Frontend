import { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/api';
import { authStorage } from '../../services/authStorage';
import { toast } from '../components/ui/CommonToaster';
import { useIsMobile } from '../../hooks/useIsMobile';
import loginImage from '../../imports/WhatsApp Image 2026-08-06 at 6.52.02 AM.jpeg';

export function AdminLogin() {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'This field is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'This field is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.authError('Authentication Required', 'Please fix the errors below before submitting.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email: email.trim(), password });

      if (response.data?.success) {
        authStorage.setToken(response.data.token);
        authStorage.setUser(response.data.user);
        toast.success('Welcome Back!', 'Authentication successful. Redirecting...');
        navigate('/admin/dashboard');
      } else {
        toast.authError('Authentication Failed', response.data?.message || 'Invalid email or password.');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.status === 401
          ? 'Invalid email or password. Please verify your credentials.'
          : error.message === 'Network Error'
          ? 'Unable to reach authentication server. Please check your connection.'
          : 'Authentication failed. Please check your credentials and try again.');

      toast.authError('Authentication Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ height: "100vh", minHeight: isMobile ? "0" : "760px", display: "flex", flexDirection: "column", background: "#1A0D06", overflow: isMobile ? "auto" : "visible" }}
    >
      {/* 2-Column Layout on desktop; form-only, single column on mobile */}
      <div style={{ flex: "1", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", background: "#1A0D06" }}>
        {/* Left: Form */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: isMobile ? "60px 24px" : "0 84px", color: "#F5EFE0" }}>
          <div style={{ fontSize: "11px", letterSpacing: ".3em", textTransform: "uppercase", color: "#C9A87C" }}>
            Mad Over Tiramisu
          </div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: isMobile ? "38px" : "56px", lineHeight: "1.05", margin: "14px 0 10px" }}>
            Welcome back.
          </div>
          <p style={{ fontSize: "15px", color: "rgba(245,239,224,.65)", maxWidth: "360px" }}>
            Sign in to look after the website — words, photos, videos and the menu.
          </p>

          <form onSubmit={handleLogin} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "380px", marginTop: "26px" }}>
            {/* Email */}
            <div>
              <div style={{ fontSize: "12px", letterSpacing: ".1em", textTransform: "uppercase", color: errors.email ? "#EF4444" : "#8B6B4A", marginBottom: "8px" }}>
                Email
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                style={{
                  width: "100%",
                  height: "54px",
                  padding: "0 16px",
                  font: "inherit",
                  fontSize: "15px",
                  background: errors.email ? "rgba(239, 68, 68, 0.08)" : "rgba(245,239,224,.07)",
                  border: errors.email ? "1.5px solid #EF4444" : "1px solid rgba(245,239,224,.22)",
                  color: "#F5EFE0",
                  borderRadius: "10px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
              {errors.email && (
                <div style={{ color: "#EF4444", fontSize: "12px", marginTop: "6px", fontWeight: 500 }}>
                  {errors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <div style={{ fontSize: "12px", letterSpacing: ".1em", textTransform: "uppercase", color: errors.password ? "#EF4444" : "#8B6B4A", marginBottom: "8px" }}>
                Password
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  style={{
                    width: "100%",
                    height: "54px",
                    padding: "0 16px",
                    font: "inherit",
                    fontSize: "15px",
                    background: errors.password ? "rgba(239, 68, 68, 0.08)" : "rgba(245,239,224,.07)",
                    border: errors.password ? "1.5px solid #EF4444" : "1px solid rgba(245,239,224,.22)",
                    color: "#F5EFE0",
                    borderRadius: "10px",
                    boxSizing: "border-box",
                    paddingRight: "40px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#F5EFE0",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  {showPassword ? "👁‍🗨" : "👁"}
                </button>
              </div>
              {errors.password && (
                <div style={{ color: "#EF4444", fontSize: "12px", marginTop: "6px", fontWeight: 500 }}>
                  {errors.password}
                </div>
              )}
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: "56px",
                border: "none",
                background: "#C0633A",
                color: "#fff",
                fontFamily: "var(--font-heading)",
                fontWeight: "800",
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
                textAlign: "left",
                padding: "0 22px",
                transition: "background .2s ease",
                opacity: loading ? 0.8 : 1,
                borderRadius: "10px",
              }}
              onMouseOver={e => !loading && ((e.currentTarget as HTMLElement).style.background = "#d4744a")}
              onMouseOut={e => !loading && ((e.currentTarget as HTMLElement).style.background = "#C0633A")}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>

            {/* Forgot Password Link */}
            <a href="#" style={{ fontSize: "13px", color: "#8B6B4A", textDecoration: "none" }} onClick={e => { e.preventDefault(); toast.info("Password reset feature coming soon"); }}>
              I forgot my password
            </a>
          </form>
        </div>

        {/* Right: Image — decorative only, dropped on mobile to keep the form front and center */}
        {!isMobile && (
          <div style={{ position: "relative", padding: "26px", display: "flex", alignItems: "center", justifyContent: "center", background: "#EDE5D8" }}>
            <img
              src={loginImage}
              alt="Making tiramisu"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
