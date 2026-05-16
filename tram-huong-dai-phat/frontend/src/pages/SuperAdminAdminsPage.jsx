import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Form tạo Admin mới
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "" });
  const [formMsg, setFormMsg] = useState("");

  const loadAdmins = async () => {
    try {
      const res = await api.get("/super-admin/admins");
      setAdmins(res.data.data || []);
    } catch (err) {
      setMessage(err.response?.data?.message || "Không tải được danh sách Admin");
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleToggleLock = async (admin) => {
    const action = admin.is_locked ? "mở khoá" : "khoá";
    if (!window.confirm(`Xác nhận ${action} tài khoản "${admin.full_name}"?`)) return;

    try {
      await api.patch(`/super-admin/admins/${admin.id}/lock`, {
        is_locked: !admin.is_locked,
      });
      await loadAdmins();
    } catch (err) {
      setMessage(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Xác nhận XOÁ tài khoản "${admin.full_name}"? Không thể hoàn tác!`))
      return;

    try {
      await api.delete(`/super-admin/admins/${admin.id}`);
      await loadAdmins();
    } catch (err) {
      setMessage(err.response?.data?.message || "Xoá thất bại");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormMsg("");
    setLoading(true);

    try {
      await api.post("/super-admin/admins", form);
      setForm({ full_name: "", email: "", password: "", phone: "" });
      setShowForm(false);
      await loadAdmins();
    } catch (err) {
      setFormMsg(err.response?.data?.message || "Tạo Admin thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="container section">
        <style>{`
          .sa-admins-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 24px; }
          .sa-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: 700; }
          .sa-badge.locked { background: #fef2f2; color: #b91c1c; }
          .sa-badge.active { background: #f0fdf4; color: #166534; }
          .sa-form-card { background: #fff; border: 1px solid #eadfce; border-radius: 20px; padding: 24px; margin-bottom: 28px; }
          .sa-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .sa-input { width: 100%; border: 1px solid #e0d5c5; border-radius: 12px; padding: 12px 16px; font-size: 15px; font-family: inherit; outline: none; }
          .sa-input:focus { border-color: #c89b3c; box-shadow: 0 0 0 3px rgba(200,155,60,0.12); }
          .sa-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
          .sa-btn-lock { padding: 8px 16px; border-radius: 999px; border: 1.5px solid #d97706; background: #fffbeb; color: #92400e; font-weight: 600; cursor: pointer; font-size: 14px; }
          .sa-btn-lock.locked { border-color: #16a34a; background: #f0fdf4; color: #166534; }
          .sa-btn-delete { padding: 8px 16px; border-radius: 999px; border: 1.5px solid #dc2626; background: #fef2f2; color: #991b1b; font-weight: 600; cursor: pointer; font-size: 14px; }
          .sa-admin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
          .sa-admin-card { background: #fff; border: 1px solid #eadfce; border-radius: 18px; padding: 20px; }
          .sa-admin-card.locked-card { border-color: #fca5a5; background: #fff8f8; }
          @media (max-width: 640px) { .sa-form-grid { grid-template-columns: 1fr; } }
        `}</style>

        <div className="page-heading">
          <p className="section-tag">Super Admin</p>
          <h1>Quản lý tài khoản Admin</h1>
        </div>

        {message && <p className="auth-message" style={{ marginBottom: 16 }}>{message}</p>}

        {/* Header + nút tạo mới */}
        <div className="sa-admins-header">
          <p style={{ color: "#7a6b5f" }}>
            Tổng cộng <strong>{admins.length}</strong> tài khoản Admin
          </p>
          <button
            className="gold-btn"
            style={{ padding: "10px 24px", fontSize: 15 }}
            onClick={() => { setShowForm(!showForm); setFormMsg(""); }}
          >
            {showForm ? "Đóng form" : "+ Tạo Admin mới"}
          </button>
        </div>

        {/* Form tạo Admin */}
        {showForm && (
          <div className="sa-form-card">
            <h3 style={{ marginBottom: 16, color: "#4a3520" }}>Tạo tài khoản Admin mới</h3>
            <form onSubmit={handleCreate}>
              <div className="sa-form-grid">
                <input
                  className="sa-input"
                  placeholder="Họ và tên *"
                  value={form.full_name}
                  onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  required
                />
                <input
                  className="sa-input"
                  type="email"
                  placeholder="Email *"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                />
                <input
                  className="sa-input"
                  type="password"
                  placeholder="Mật khẩu *"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required
                />
                <input
                  className="sa-input"
                  placeholder="Số điện thoại"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              {formMsg && <p className="auth-message" style={{ marginTop: 10 }}>{formMsg}</p>}
              <button
                type="submit"
                className="gold-btn"
                style={{ marginTop: 16 }}
                disabled={loading}
              >
                {loading ? "Đang tạo..." : "Tạo tài khoản Admin"}
              </button>
            </form>
          </div>
        )}

        {/* Danh sách Admin */}
        {admins.length === 0 ? (
          <div className="empty-state-card">
            <h3>Chưa có tài khoản Admin nào</h3>
            <p>Tạo tài khoản Admin đầu tiên bằng nút bên trên.</p>
          </div>
        ) : (
          <div className="sa-admin-grid">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className={`sa-admin-card ${admin.is_locked ? "locked-card" : ""}`}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <h3 style={{ margin: 0, color: "#2d1f16" }}>{admin.full_name}</h3>
                  <span className={`sa-badge ${admin.is_locked ? "locked" : "active"}`}>
                    {admin.is_locked ? "🔒 Đã khoá" : "✅ Hoạt động"}
                  </span>
                </div>

                <p style={{ margin: "4px 0", color: "#5a4a3a", fontSize: 14 }}>📧 {admin.email}</p>
                {admin.phone && (
                  <p style={{ margin: "4px 0", color: "#5a4a3a", fontSize: 14 }}>📞 {admin.phone}</p>
                )}
                <p style={{ margin: "4px 0", color: "#9a8a7a", fontSize: 13 }}>
                  Tạo ngày: {new Date(admin.created_at).toLocaleDateString("vi-VN")}
                </p>

                <div className="sa-actions">
                  <button
                    className={`sa-btn-lock ${admin.is_locked ? "locked" : ""}`}
                    onClick={() => handleToggleLock(admin)}
                  >
                    {admin.is_locked ? "🔓 Mở khoá" : "🔒 Khoá"}
                  </button>
                  <button
                    className="sa-btn-delete"
                    onClick={() => handleDelete(admin)}
                  >
                    🗑 Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default SuperAdminAdminsPage;
