import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadOrders = async () => {
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data?.data || []);
    } catch (error) {
      setMessage(error.response?.data?.message || "Không tải được đơn hàng");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = search.trim().toLowerCase();

      const matchSearch =
        !keyword ||
        order.customer_name?.toLowerCase().includes(keyword) ||
        order.phone?.toLowerCase().includes(keyword) ||
        String(order.id).includes(keyword);

      const matchStatus =
        !statusFilter || order.order_status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const handleUpdate = async (id, order_status, payment_status) => {
    try {
      setMessage("");

      await api.put(`/admin/orders/${id}`, {
        order_status,
        payment_status,
      });

      setMessage("Cập nhật trạng thái đơn hàng thành công");
      loadOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const getOrderStatusLabel = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "shipping":
        return "Đang giao";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case "paid":
        return "Đã thanh toán";
      case "unpaid":
        return "Chưa thanh toán";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "badge badge-warning";
      case "confirmed":
        return "badge badge-info";
      case "shipping":
        return "badge badge-primary";
      case "completed":
        return "badge badge-success";
      case "cancelled":
        return "badge badge-danger";
      default:
        return "badge";
    }
  };

  const getPaymentClass = (status) => {
    return status === "paid" ? "badge badge-success" : "badge badge-danger";
  };

  return (
    <>
      <Header />

      <main className="container section">
        <div className="page-heading">
          <p className="section-tag">Quản trị</p>
          <h1>Quản lý đơn hàng</h1>
        </div>

        <div className="premium-summary-card" style={{ marginBottom: "24px" }}>
          <div className="admin-filter-grid">
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="shipping">Đang giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {message && <p className="auth-message">{message}</p>}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state-card">
            <h3>Không có đơn hàng phù hợp</h3>
            <p>Hãy thử đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.</p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card premium-order-card">
                <div className="order-top">
                  <div>
                    <h3>Đơn #{order.id}</h3>
                    <p>Khách hàng: {order.customer_name}</p>
                    <p>SĐT: {order.phone}</p>
                    {order.address && <p>Địa chỉ: {order.address}</p>}
                  </div>

                  <div className="order-meta">
                    <p>
                      <strong>Tổng tiền:</strong>{" "}
                      {Number(order.total_amount).toLocaleString("vi-VN")} đ
                    </p>
                    <p>
                      <strong>Trạng thái:</strong>{" "}
                      <span className={getStatusClass(order.order_status)}>
                        {getOrderStatusLabel(order.order_status)}
                      </span>
                    </p>
                    <p>
                      <strong>Thanh toán:</strong>{" "}
                      <span className={getPaymentClass(order.payment_status)}>
                        {getPaymentStatusLabel(order.payment_status)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="admin-order-actions">
                  <button
                    className="outline-btn"
                    onClick={() =>
                      handleUpdate(order.id, "confirmed", order.payment_status)
                    }
                  >
                    Xác nhận đơn
                  </button>

                  <button
                    className="outline-btn"
                    onClick={() =>
                      handleUpdate(order.id, "shipping", order.payment_status)
                    }
                  >
                    Đang giao
                  </button>

                  <button
                    className="gold-btn"
                    onClick={() =>
                      handleUpdate(order.id, "completed", "paid")
                    }
                  >
                    Hoàn thành
                  </button>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      handleUpdate(order.id, "cancelled", order.payment_status)
                    }
                  >
                    Hủy đơn
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

export default AdminOrdersPage;