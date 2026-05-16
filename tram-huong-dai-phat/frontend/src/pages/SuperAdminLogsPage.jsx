import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

const ACTION_COLORS = {
  "TẠO SẢN PHẨM":             { bg: "#f0fdf4", color: "#166534", icon: "➕" },
  "CẬP NHẬT SẢN PHẨM":        { bg: "#eff6ff", color: "#1e40af", icon: "✏️" },
  "XOÁ SẢN PHẨM":              { bg: "#fef2f2", color: "#991b1b", icon: "🗑" },
  "CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG": { bg: "#fefce8", color: "#854d0e", icon: "📦" },
  "TẠO TÀI KHOẢN ADMIN":       { bg: "#f5f3ff", color: "#5b21b6", icon: "👤" },
  "KHOÁ TÀI KHOẢN ADMIN":      { bg: "#fef2f2", color: "#991b1b", icon: "🔒" },
  "MỞ KHOÁ ADMIN":             { bg: "#f0fdf4", color: "#166534", icon: "🔓" },
  "XOÁ TÀI KHOẢN ADMIN":       { bg: "#fef2f2", color: "#7f1d1d", icon: "❌" },
};

function getActionStyle(action) {
  return (
    ACTION_COLORS[action] || { bg: "#f8f5f0", color: "#4a3520", icon: "📝" }
  );
}

function SuperAdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [message, setMessage] = useState("");

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterAction) params.action = filterAction;

      const res = await api.get("/super-admin/logs", { params });
      setLogs(res.data.data || []);
    } catch (err) {
      setMessage(err.response?.data?.message || "Không tải được audit log");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filterAction]);

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
  };

  return (
    <>
      <Header />
      <main className="container section">
        <style>{`
          .log-filter-row { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
          .log-filter-select { border: 1px solid #e0d5c5; border-radius: 12px; padding: 10px 16px; font-size: 15px; font-family: inherit; outline: none; background: #fff; min-width: 240px; }
          .log-filter-select:focus { border-color: #c89b3c; }
          .log-list { display: flex; flex-direction: column; gap: 10px; }
          .log-item { display: flex; gap: 14px; align-items: flex-start; background: #fff; border: 1px solid #eadfce; border-radius: 16px; padding: 16px 18px; }
          .log-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
          .log-content { flex: 1; min-width: 0; }
          .log-action { font-weight: 700; font-size: 14px; display: inline-block; padding: 3px 10px; border-radius: 999px; margin-bottom: 4px; }
          .log-detail { font-size: 14px; color: #5a4a3a; margin: 2px 0; word-break: break-word; }
          .log-meta { font-size: 12px; color: #9a8a7a; margin-top: 4px; }
          .log-admin-badge { font-weight: 700; color: #7b5b28; }
          .sa-role-badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; margin-left: 6px; }
          .sa-role-badge.super_admin { background: #fdf4ff; color: #7e22ce; }
          .sa-role-badge.admin { background: #eff6ff; color: #1e40af; }
          @media (max-width: 640px) { .log-item { flex-direction: column; } }
        `}</style>

        <div className="page-heading">
          <p className="section-tag">Super Admin</p>
          <h1>Lịch sử thao tác Admin</h1>
        </div>

        {message && <p className="auth-message">{message}</p>}

        {/* Bộ lọc */}
        <div className="log-filter-row">
          <select
            className="log-filter-select"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="">-- Tất cả hành động --</option>
            <option value="SẢN PHẨM">Thao tác Sản phẩm</option>
            <option value="TẠO SẢN PHẨM">Tạo sản phẩm</option>
            <option value="CẬP NHẬT SẢN PHẨM">Cập nhật sản phẩm</option>
            <option value="XOÁ SẢN PHẨM">Xoá sản phẩm</option>
            <option value="ĐƠN HÀNG">Thao tác Đơn hàng</option>
            <option value="ADMIN">Thao tác tài khoản Admin</option>
          </select>

          <span style={{ color: "#9a8a7a", fontSize: 14 }}>
            {loading ? "Đang tải..." : `${logs.length} bản ghi`}
          </span>
        </div>

        {/* Danh sách log */}
        {!loading && logs.length === 0 ? (
          <div className="empty-state-card">
            <h3>Chưa có lịch sử thao tác</h3>
            <p>Các hành động của Admin sẽ được ghi lại tại đây.</p>
          </div>
        ) : (
          <div className="log-list">
            {logs.map((log) => {
              const style = getActionStyle(log.action);
              return (
                <div key={log.id} className="log-item">
                  <div
                    className="log-icon"
                    style={{ background: style.bg }}
                  >
                    {style.icon}
                  </div>

                  <div className="log-content">
                    <span
                      className="log-action"
                      style={{ background: style.bg, color: style.color }}
                    >
                      {log.action}
                    </span>

                    {log.detail && (
                      <p className="log-detail">{log.detail}</p>
                    )}

                    <p className="log-meta">
                      <span className="log-admin-badge">{log.admin_name}</span>
                      <span className={`sa-role-badge ${log.admin_role}`}>
                        {log.admin_role === "super_admin" ? "Super Admin" : "Admin"}
                      </span>
                      {log.target_type && (
                        <> · {log.target_type}
                          {log.target_id ? ` #${log.target_id}` : ""}
                        </>
                      )}
                      <> · {formatTime(log.created_at)}</>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

export default SuperAdminLogsPage;
