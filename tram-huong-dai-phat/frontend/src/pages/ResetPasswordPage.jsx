import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [tokenValid, setTokenValid] = useState(null); // null = đang kiểm tra
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Kiểm tra token ngay khi mở trang
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-reset-token?token=${token}`);
        setTokenValid(true);
        setEmail(res.data.email || "");
      } catch {
        setTokenValid(false);
      }
    };

    verify();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password.length < 6) {
      return setMessage("Mật khẩu phải có ít nhất 6 ký tự");
    }

    if (password !== confirmPassword) {
      return setMessage("Mật khẩu nhập lại không khớp");
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);

      // Tự động chuyển sang trang login sau 3 giây
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ── Đang kiểm tra token ────────────────────────────────
  if (tokenValid === null) {
    return (
      <>
        <Header />
        <main className="auth-shell">
          <div style={{ textAlign: "center", padding: "80px 0", color: "#7a6b5f" }}>
            <p>Đang xác thực link...</p>
          </div>
        </main>
      </>
    );
  }

  // ── Token không hợp lệ / hết hạn ──────────────────────
  if (!tokenValid) {
    return (
      <>
        <Header />
        <main className="auth-shell">
          <div className="auth-box" style={{ maxWidth: 520 }}>
            <div className="auth-card" style={{ textAlign: "center" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "#fef2f2", border: "2px solid #fca5a5",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", fontSize: 32,
              }}>
                ⛔
              </div>
              <h2 style={{ color: "#2d1f16", marginBottom: 12 }}>Link không hợp lệ</h2>
              <p style={{ color: "#5a4a3a", lineHeight: 1.6, marginBottom: 28 }}>
                Link đặt lại mật khẩu đã hết hạn hoặc đã được sử dụng.
                Vui lòng yêu cầu link mới.
              </p>
              <Link to="/forgot-password" className="gold-btn" style={{ display: "block" }}>
                Gửi lại link mới
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // ── Đặt lại thành công ────────────────────────────────
  if (success) {
    return (
      <>
        <Header />
        <main className="auth-shell">
          <div className="auth-box" style={{ maxWidth: 520 }}>
            <div className="auth-card" style={{ textAlign: "center" }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                border: "2px solid #86efac",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 20px", fontSize: 32,
              }}>
                ✅
              </div>
              <h2 style={{ color: "#2d1f16", marginBottom: 12 }}>Đặt lại thành công!</h2>
              <p style={{ color: "#5a4a3a", lineHeight: 1.6, marginBottom: 8 }}>
                Mật khẩu mới của bạn đã được cập nhật.
              </p>
              <p style={{ color: "#9a8a7a", fontSize: 13, marginBottom: 28 }}>
                Đang chuyển đến trang đăng nhập...
              </p>
              <Link to="/login" className="gold-btn" style={{ display: "block" }}>
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  // ── Form đặt mật khẩu mới ─────────────────────────────
  return (
    <>
      <Header />
      <main className="auth-shell">
        <div className="auth-box">
          <div className="auth-visual">
            <div className="auth-visual-overlay">
              <p className="auth-mini-title">Trầm Hương Đại Phát</p>
              <h2>Tạo mật khẩu mới</h2>
              <p>Mật khẩu mới phải có ít nhất 6 ký tự.</p>
            </div>
          </div>

          <form className="auth-card" onSubmit={handleSubmit}>
            <p className="section-tag">Tài khoản</p>
            <h1>Đặt lại mật khẩu</h1>

            {email && (
              <p style={{ color: "#7a6b5f", fontSize: 14, marginBottom: 20 }}>
                Tài khoản: <strong>{email}</strong>
              </p>
            )}

            <input
              type="password"
              placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ marginTop: 12 }}
            />

            <button
              type="submit"
              className="gold-btn auth-submit-btn"
              disabled={loading}
              style={{ marginTop: 20 }}
            >
              {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
            </button>

            {message && (
              <p className="auth-message" style={{ marginTop: 16 }}>
                {message}
              </p>
            )}

            <p className="auth-switch-text" style={{ marginTop: 20 }}>
              <Link to="/login">← Quay lại đăng nhập</Link>
            </p>
          </form>
        </div>
      </main>
    </>
  );
}

export default ResetPasswordPage;
