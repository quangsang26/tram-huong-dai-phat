import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

function SuperAdminStockPage() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Xem chi tiết xuất kho từng đơn của một sản phẩm
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [movLoading, setMovLoading] = useState(false);

  // Bộ lọc
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.get("/super-admin/stock-report");
      setReport(res.data.data || []);
    } catch (err) {
      setMessage(err.response?.data?.message || "Không tải được báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleViewMovements = async (product) => {
    if (selectedProduct?.product_id === product.product_id) {
      setSelectedProduct(null);
      setMovements([]);
      return;
    }

    setSelectedProduct(product);
    setMovLoading(true);
    try {
      const res = await api.get(`/super-admin/stock-report/${product.product_id}`);
      setMovements(res.data.data || []);
    } catch {
      setMovements([]);
    } finally {
      setMovLoading(false);
    }
  };

  // Lọc theo search và status
  const filtered = report.filter((p) => {
    const matchSearch =
      !search || p.product_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || p.product_status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Tổng kho
  const totalCurrentStock = report.reduce((s, p) => s + Number(p.current_stock), 0);
  const totalSold = report.reduce((s, p) => s + Number(p.total_sold), 0);
  const totalRevenue = report.reduce((s, p) => s + Number(p.total_revenue), 0);

  const getStatusLabel = (status) => {
    if (status === "active") return { label: "Đang bán", bg: "#f0fdf4", color: "#166534" };
    if (status === "out_of_stock") return { label: "Hết hàng", bg: "#fef2f2", color: "#991b1b" };
    if (status === "hidden") return { label: "Đã ẩn", bg: "#f8f5f0", color: "#78716c" };
    return { label: status, bg: "#f8f5f0", color: "#4a3520" };
  };

  const getOrderStatusLabel = (s) => {
    const map = {
      pending: "Chờ xử lý", confirmed: "Đã xác nhận",
      shipping: "Đang giao", delivered: "Đã giao",
      cancelled: "Đã huỷ", completed: "Hoàn thành",
    };
    return map[s] || s;
  };

  return (
    <>
      <Header />
      <main className="container section">
        <style>{`
          .stock-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px; }
          .stock-stat-card { background: #fff; border: 1px solid #eadfce; border-radius: 16px; padding: 18px 20px; text-align: center; }
          .stock-stat-card .stat-value { font-size: 26px; font-weight: 800; color: #4a3520; margin: 4px 0; }
          .stock-stat-card .stat-label { font-size: 13px; color: #9a8a7a; }
          .stock-filter-row { display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
          .stock-search { flex: 1; min-width: 180px; border: 1px solid #e0d5c5; border-radius: 12px; padding: 10px 16px; font-size: 15px; font-family: inherit; outline: none; }
          .stock-search:focus { border-color: #c89b3c; }
          .stock-select { border: 1px solid #e0d5c5; border-radius: 12px; padding: 10px 16px; font-size: 15px; font-family: inherit; outline: none; background: #fff; }
          .stock-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 16px; overflow: hidden; border: 1px solid #eadfce; }
          .stock-table th { background: #f9f5ee; padding: 12px 16px; text-align: left; font-size: 13px; color: #7b5b28; font-weight: 700; letter-spacing: 0.3px; white-space: nowrap; }
          .stock-table td { padding: 12px 16px; border-top: 1px solid #f2ece0; font-size: 14px; color: #3a2c1e; vertical-align: middle; }
          .stock-table tr:hover td { background: #fffbf4; }
          .stock-table tr.selected td { background: #fffbee; }
          .status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; }
          .stock-low { color: #dc2626; font-weight: 700; }
          .detail-btn { padding: 6px 14px; border-radius: 999px; border: 1.5px solid #c89b3c; background: #fff; color: #7b5b28; font-weight: 600; cursor: pointer; font-size: 13px; }
          .detail-btn:hover { background: #fffbee; }
          .detail-btn.active { background: #c89b3c; color: #fff; }
          .movements-panel { background: #fffcf5; border: 1px solid #e8d9b5; border-radius: 16px; padding: 20px; margin-top: 4px; }
          .mov-table { width: 100%; border-collapse: collapse; }
          .mov-table th { font-size: 12px; color: #7b5b28; padding: 8px 12px; text-align: left; border-bottom: 1px solid #e8d9b5; }
          .mov-table td { font-size: 13px; color: #3a2c1e; padding: 8px 12px; border-bottom: 1px solid #f2ece0; }
          @media (max-width: 768px) { .stock-stats { grid-template-columns: 1fr 1fr; } .stock-table { font-size: 13px; } }
          @media (max-width: 480px) { .stock-stats { grid-template-columns: 1fr; } }
        `}</style>

        <div className="page-heading">
          <p className="section-tag">Super Admin</p>
          <h1>Báo cáo xuất nhập tồn kho</h1>
        </div>

        {message && <p className="auth-message">{message}</p>}

        {/* Thống kê tổng quan */}
        <div className="stock-stats">
          <div className="stock-stat-card">
            <p className="stat-label">Tổng tồn kho hiện tại</p>
            <p className="stat-value">{totalCurrentStock.toLocaleString("vi-VN")}</p>
            <p className="stat-label">sản phẩm</p>
          </div>
          <div className="stock-stat-card">
            <p className="stat-label">Tổng đã xuất kho</p>
            <p className="stat-value">{totalSold.toLocaleString("vi-VN")}</p>
            <p className="stat-label">đơn vị</p>
          </div>
          <div className="stock-stat-card">
            <p className="stat-label">Doanh thu từ đơn hàng</p>
            <p className="stat-value" style={{ fontSize: 20 }}>
              {totalRevenue.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="stock-filter-row">
          <input
            className="stock-search"
            placeholder="🔍 Tìm theo tên sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="stock-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="out_of_stock">Hết hàng</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>

        {loading ? (
          <p>Đang tải báo cáo...</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "right" }}>Tồn kho</th>
                  <th style={{ textAlign: "right" }}>Đã bán</th>
                  <th style={{ textAlign: "right" }}>Số đơn</th>
                  <th style={{ textAlign: "right" }}>Doanh thu</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const statusStyle = getStatusLabel(p.product_status);
                  const isSelected =
                    selectedProduct?.product_id === p.product_id;
                  const isLowStock =
                    Number(p.current_stock) > 0 && Number(p.current_stock) <= 5;

                  return (
                    <>
                      <tr key={p.product_id} className={isSelected ? "selected" : ""}>
                        <td>
                          <strong>{p.product_name}</strong>
                        </td>
                        <td>{p.category_name || "—"}</td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ background: statusStyle.bg, color: statusStyle.color }}
                          >
                            {statusStyle.label}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span className={isLowStock ? "stock-low" : ""}>
                            {Number(p.current_stock).toLocaleString("vi-VN")}
                            {isLowStock && " ⚠️"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {Number(p.total_sold).toLocaleString("vi-VN")}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {Number(p.total_orders).toLocaleString("vi-VN")}
                        </td>
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          {Number(p.total_revenue).toLocaleString("vi-VN")}đ
                        </td>
                        <td>
                          <button
                            className={`detail-btn ${isSelected ? "active" : ""}`}
                            onClick={() => handleViewMovements(p)}
                          >
                            {isSelected ? "Đóng" : "Chi tiết"}
                          </button>
                        </td>
                      </tr>

                      {/* Panel chi tiết xuất kho */}
                      {isSelected && (
                        <tr key={`${p.product_id}-detail`}>
                          <td colSpan={8} style={{ padding: "0 8px 12px" }}>
                            <div className="movements-panel">
                              <h4 style={{ margin: "0 0 12px", color: "#4a3520" }}>
                                Lịch sử xuất kho: {p.product_name}
                              </h4>
                              {movLoading ? (
                                <p>Đang tải...</p>
                              ) : movements.length === 0 ? (
                                <p style={{ color: "#9a8a7a" }}>Chưa có đơn hàng nào cho sản phẩm này.</p>
                              ) : (
                                <table className="mov-table">
                                  <thead>
                                    <tr>
                                      <th>Đơn #</th>
                                      <th>Khách hàng</th>
                                      <th>Ngày đặt</th>
                                      <th>SL xuất</th>
                                      <th>Đơn giá</th>
                                      <th>Trạng thái đơn</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {movements.map((m) => (
                                      <tr key={m.order_id}>
                                        <td>#{m.order_id}</td>
                                        <td>{m.customer_name}</td>
                                        <td>
                                          {new Date(m.order_date).toLocaleDateString("vi-VN")}
                                        </td>
                                        <td style={{ fontWeight: 700, color: "#dc2626" }}>
                                          -{m.quantity}
                                        </td>
                                        <td>{Number(m.price).toLocaleString("vi-VN")}đ</td>
                                        <td>{getOrderStatusLabel(m.order_status)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <p style={{ textAlign: "center", color: "#9a8a7a", marginTop: 20 }}>
                Không tìm thấy sản phẩm nào.
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default SuperAdminStockPage;
