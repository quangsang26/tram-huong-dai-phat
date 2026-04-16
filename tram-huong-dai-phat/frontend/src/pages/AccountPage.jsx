import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

function AccountPage() {
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    created_at: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const res = await api.get("/account/me");
      const user = res.data?.data;

      setProfileForm({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        role: user.role || "",
        created_at: user.created_at || "",
      });

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...(JSON.parse(localStorage.getItem("user")) || {}),
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
        })
      );
    } catch (error) {
      setProfileMessage(
        error.response?.data?.message || "Không tải được thông tin tài khoản"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage("");

    try {
      const payload = {
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        address: profileForm.address,
      };

      const res = await api.put("/account/me", payload);
      const updatedUser = res.data?.data;

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...(JSON.parse(localStorage.getItem("user")) || {}),
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          role: updatedUser.role,
        })
      );

      setProfileMessage("Cập nhật thông tin thành công");
      loadProfile();
    } catch (error) {
      setProfileMessage(error.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    try {
      await api.put("/account/change-password", passwordForm);

      setPasswordMessage("Đổi mật khẩu thành công");
      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      setPasswordMessage(error.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container section">
          <p>Đang tải thông tin tài khoản...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="container section">
        <div className="page-heading">
          <p className="section-tag">Tài khoản</p>
          <h1>Tài khoản của tôi</h1>
        </div>

        <div className="account-layout">
          <div className="premium-summary-card">
            <p className="section-tag">Thông tin chung</p>
            <h2>{profileForm.full_name || "Khách hàng"}</h2>
            <p><strong>Email:</strong> {profileForm.email}</p>
            <p><strong>Vai trò:</strong> {profileForm.role}</p>
            <p>
              <strong>Ngày tham gia:</strong>{" "}
              {profileForm.created_at
                ? new Date(profileForm.created_at).toLocaleDateString("vi-VN")
                : "Chưa rõ"}
            </p>
          </div>

          <div className="account-forms-grid">
            <form className="auth-card account-card" onSubmit={handleProfileSubmit}>
              <p className="section-tag">Chỉnh sửa</p>
              <h2>Cập nhật thông tin</h2>

              <input
                type="text"
                name="full_name"
                placeholder="Họ và tên"
                value={profileForm.full_name}
                onChange={handleProfileChange}
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={profileForm.email}
                disabled
              />

              <input
                type="text"
                name="phone"
                placeholder="Số điện thoại"
                value={profileForm.phone}
                onChange={handleProfileChange}
              />

              <input
                type="text"
                name="address"
                placeholder="Địa chỉ"
                value={profileForm.address}
                onChange={handleProfileChange}
              />

              <button type="submit" className="gold-btn auth-submit-btn">
                Lưu thay đổi
              </button>

              {profileMessage && <p className="auth-message">{profileMessage}</p>}
            </form>

            <form className="auth-card account-card" onSubmit={handlePasswordSubmit}>
              <p className="section-tag">Bảo mật</p>
              <h2>Đổi mật khẩu</h2>

              <input
                type="password"
                name="current_password"
                placeholder="Mật khẩu hiện tại"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
              />

              <input
                type="password"
                name="new_password"
                placeholder="Mật khẩu mới"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
              />

              <input
                type="password"
                name="confirm_password"
                placeholder="Xác nhận mật khẩu mới"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
              />

              <button type="submit" className="gold-btn auth-submit-btn">
                Đổi mật khẩu
              </button>

              {passwordMessage && <p className="auth-message">{passwordMessage}</p>}
            </form>
          </div>
        </div>
      </main>
    </>
  );
}

export default AccountPage;