import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
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
      await api.post("/auth/register", formData);
      setMessage("Đăng ký thành công");
      setTimeout(() => navigate("/login"), 800);
    } catch (error) {
      setMessage(error.response?.data?.message || "Đăng ký thất bại");
    }
  };

  return (
    <>
      <Header />
      <main className="auth-shell">
        <div className="auth-box">
          <div className="auth-visual">
            <div className="auth-visual-overlay">
              <p className="auth-mini-title">Thành viên mới</p>
              <h2>Tạo tài khoản nhanh chóng</h2>
              <p>
                Trở thành thành viên để lưu thông tin mua hàng, xem lịch sử đơn
                và nhận những sản phẩm nổi bật mới nhất.
              </p>
            </div>
          </div>

          <form className="auth-card" onSubmit={handleSubmit}>
            <p className="section-tag">Tài khoản</p>
            <h1>Đăng ký</h1>

            <input
              type="text"
              name="full_name"
              placeholder="Họ và tên"
              value={formData.full_name}
              onChange={handleChange}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
            />

            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              value={formData.phone}
              onChange={handleChange}
            />

            <input
              type="text"
              name="address"
              placeholder="Địa chỉ"
              value={formData.address}
              onChange={handleChange}
            />

            <button type="submit" className="gold-btn auth-submit-btn">
              Đăng ký
            </button>

            {message && <p className="auth-message">{message}</p>}

            <p className="auth-switch-text">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </form>
        </div>
      </main>
    </>
  );
}

export default RegisterPage;