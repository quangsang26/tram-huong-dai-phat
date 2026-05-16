import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";

// 3 bước: 1 = nhập email, 2 = nhập OTP, 3 = đặt mật khẩu mới
const STEPS = { EMAIL: 1, OTP: 2, NEW_PASSWORD: 3 };

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep]         = useState(STEPS.EMAIL);
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [message, setMessage]   = useState("");
  const [msgType, setMsgType]   = useState("error");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const showMsg = (text, type = "error") => { setMessage(text); setMsgType(type); };

  // ── Bước 1: Gửi OTP ──────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return showMsg("Vui lòng nhập email");
    setLoading(true);
    setMessage("");
    try {
      await api.post("/auth/forgot-password", { email });
      setStep(STEPS.OTP);
      showMsg("Mã OTP đã được gửi về email của bạn!", "success");
    } catch (err) {
      showMsg(err.response?.data?.message || "Gửi OTP thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // ── Nhập OTP từng ô ──────────────────────────────────────
  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return; // Chỉ nhận số
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1); // Chỉ lấy 1 ký tự
    setOtp(newOtp);
    // Tự động nhảy sang ô tiếp theo
    if (val && idx < 3) otpRefs[idx + 1].current?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs[idx - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pasted.length === 4) {
      setOtp(pasted.split(""));
      otpRefs[3].current?.focus();
    }
    e.preventDefault();
  };

  // ── Bước 2: Xác nhận OTP ─────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpStr = otp.join("");
    if (otpStr.length < 4) return showMsg("Vui lòng nhập đủ 4 chữ số");
    setLoading(true);
    setMessage("");
    try {
      await api.post("/auth/verify-otp", { email, otp: otpStr });
      setStep(STEPS.NEW_PASSWORD);
      setMessage("");
    } catch (err) {
      showMsg(err.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  };

  // ── Bước 3: Đặt mật khẩu mới ─────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) return showMsg("Mật khẩu phải có ít nhất 6 ký tự");
    if (password !== confirm) return showMsg("Mật khẩu nhập lại không khớp");
    setLoading(true);
    setMessage("");
    try {
      await api.post("/auth/reset-password", { email, otp: otp.join(""), password });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      showMsg(err.response?.data?.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <style>{`
        .otp-wrap { display:flex; gap:12px; justify-content:center; margin:24px 0; }
        .otp-input {
          width:64px; height:72px; border-radius:16px;
          border:2px solid #e0d5c5; text-align:center;
          font-size:32px; font-weight:800; color:#2d1f16;
          outline:none; transition:border-color 0.2s, box-shadow 0.2s;
          font-family:monospace; background:#fff;
        }
        .otp-input:focus { border-color:#c89b3c; box-shadow:0 0 0 4px rgba(200,155,60,0.15); }
        .otp-input.filled { border-color:#c89b3c; background:#fffbee; }
        .step-dots { display:flex; justify-content:center; gap:8px; margin-bottom:28px; }
        .step-dot {
          width:10px; height:10px; border-radius:50%;
          background:#e0d5c5; transition:all 0.3s;
        }
        .step-dot.active { background:#c89b3c; width:28px; border-radius:999px; }
        .step-dot.done { background:#86efac; }
      `}</style>

      <main className="auth-shell">
        <div className="auth-box">
          {/* Panel trái */}
          <div className="auth-visual">
            <div className="auth-visual-overlay">
              <p className="auth-mini-title">Trầm Hương Đại Phát</p>
              <h2>
                {step === STEPS.EMAIL       && "Khôi phục tài khoản"}
                {step === STEPS.OTP         && "Nhập mã xác nhận"}
                {step === STEPS.NEW_PASSWORD && "Tạo mật khẩu mới"}
              </h2>
              <p>
                {step === STEPS.EMAIL       && "Nhập email để nhận mã OTP 4 số."}
                {step === STEPS.OTP         && "Mã OTP đã được gửi về Gmail của bạn. Kiểm tra hộp thư!"}
                {step === STEPS.NEW_PASSWORD && "Nhập mật khẩu mới ít nhất 6 ký tự."}
              </p>
            </div>
          </div>

          {/* Panel phải */}
          <div className="auth-card">
            <p className="section-tag">Tài khoản</p>
            <h1>Quên mật khẩu</h1>

            {/* Step dots */}
            <div className="step-dots">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`step-dot ${step === s ? "active" : step > s ? "done" : ""}`}
                />
              ))}
            </div>

            {/* ── Thành công ── */}
            {success ? (
              <div style={{ textAlign:"center", padding:"16px 0" }}>
                <div style={{
                  width:72, height:72, borderRadius:"50%",
                  background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",
                  border:"2px solid #86efac",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  margin:"0 auto 16px", fontSize:32,
                }}>✅</div>
                <h3 style={{ color:"#2d1f16", marginBottom:8 }}>Đổi mật khẩu thành công!</h3>
                <p style={{ color:"#9a8a7a", fontSize:13 }}>Đang chuyển đến trang đăng nhập...</p>
              </div>

            /* ── Bước 1: Nhập email ── */
            ) : step === STEPS.EMAIL ? (
              <form onSubmit={handleSendOTP}>
                <p style={{ color:"#7a6b5f", fontSize:14, marginBottom:16, lineHeight:1.6 }}>
                  Nhập email bạn đã đăng ký — chúng tôi sẽ gửi <strong>mã OTP 4 số</strong> ngay lập tức.
                </p>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ marginBottom:16 }}
                />
                {message && (
                  <p style={{ color: msgType === "success" ? "#166534" : "#dc2626", fontSize:14, marginBottom:12 }}>
                    {message}
                  </p>
                )}
                <button type="submit" className="gold-btn auth-submit-btn" disabled={loading}>
                  {loading ? "Đang gửi..." : "Gửi mã OTP"}
                </button>
              </form>

            /* ── Bước 2: Nhập OTP ── */
            ) : step === STEPS.OTP ? (
              <form onSubmit={handleVerifyOTP}>
                <p style={{ color:"#7a6b5f", fontSize:14, lineHeight:1.6, textAlign:"center" }}>
                  Mã OTP đã gửi đến <strong>{email}</strong><br />
                  <span style={{ fontSize:13, color:"#9a8a7a" }}>Kiểm tra cả hộp thư Spam nếu không thấy</span>
                </p>

                {/* 4 ô nhập OTP */}
                <div className="otp-wrap" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpRefs[idx]}
                      className={`otp-input ${digit ? "filled" : ""}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {message && (
                  <p style={{ color: msgType === "success" ? "#166534" : "#dc2626", fontSize:14, textAlign:"center", marginBottom:12 }}>
                    {message}
                  </p>
                )}

                <button type="submit" className="gold-btn auth-submit-btn" disabled={loading}>
                  {loading ? "Đang xác nhận..." : "Xác nhận mã OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(STEPS.EMAIL); setOtp(["","","",""]); setMessage(""); }}
                  style={{ display:"block", width:"100%", marginTop:10, background:"none", border:"none",
                           color:"#9a8a7a", fontSize:13, cursor:"pointer", textAlign:"center" }}
                >
                  ← Đổi email khác
                </button>
              </form>

            /* ── Bước 3: Mật khẩu mới ── */
            ) : (
              <form onSubmit={handleResetPassword}>
                <p style={{ color:"#7a6b5f", fontSize:14, marginBottom:16 }}>
                  Tài khoản: <strong>{email}</strong>
                </p>
                <input
                  type="password"
                  placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ marginBottom:12 }}
                />
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  style={{ marginBottom:16 }}
                />
                {message && (
                  <p style={{ color:"#dc2626", fontSize:14, marginBottom:12 }}>{message}</p>
                )}
                <button type="submit" className="gold-btn auth-submit-btn" disabled={loading}>
                  {loading ? "Đang cập nhật..." : "Đặt mật khẩu mới"}
                </button>
              </form>
            )}

            <p className="auth-switch-text" style={{ marginTop:20 }}>
              Nhớ mật khẩu rồi? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default ForgotPasswordPage;
