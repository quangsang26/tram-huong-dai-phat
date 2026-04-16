import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMessage("Đăng nhập thành công");
      setTimeout(() => navigate("/"), 800);
    } catch (error) {
      setMessage(error.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <>
      <Header />
      <main className="auth-shell">
        <div className="auth-box">
          <div className="auth-visual">
            <div className="auth-visual-overlay">
              <p className="auth-mini-title">Trầm Hương Đại Phát</p>
              <h2>Chào mừng bạn quay lại</h2>
              <p>
                Đăng nhập để tiếp tục mua sắm, theo dõi đơn hàng và trải nghiệm
                không gian trầm hương tinh tế.
              </p>
            </div>
          </div>

          <form className="auth-card" onSubmit={handleSubmit}>
            <p className="section-tag">Tài khoản</p>
            <h1>Đăng nhập</h1>

            <input
              type="email"
              name="email"
              placeholder="Nhập email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
            />

            <button type="submit" className="gold-btn auth-submit-btn">
              Đăng nhập
            </button>

            {message && <p className="auth-message">{message}</p>}

            <p className="auth-switch-text">
              Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
            </p>
          </form>
        </div>
      </main>
    </>
  );
}

export default LoginPage;