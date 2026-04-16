import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";

function AdminUserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get(`/admin/users/${id}`);
        setUser(res.data.data);
      } catch (error) {
        setMessage(error.response?.data?.message || "Không tải được chi tiết người dùng");
      }
    };

    loadUser();
  }, [id]);

  if (message) {
    return (
      <>
        <Header />
        <main className="container section">
          <p>{message}</p>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="container section">
          <p>Đang tải dữ liệu khách hàng...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container section">
        <div className="order-detail-card">
          <h1>Chi tiết khách hàng</h1>

          <div className="order-detail-grid">
            <div>
              <p><strong>Họ tên:</strong> {user.full_name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>SĐT:</strong> {user.phone || "Chưa có"}</p>
            </div>

            <div>
              <p><strong>Địa chỉ:</strong> {user.address || "Chưa có"}</p>
              <p><strong>Vai trò:</strong> {user.role}</p>
              <p><strong>Số đơn hàng:</strong> {user.orders?.length || 0}</p>
            </div>
          </div>

          <h2>Lịch sử mua hàng</h2>

          {user.orders?.length > 0 ? (
            <div className="orders-list">
              {user.orders.map((order) => (
                <div key={order.id} className="order-card">
                  <h3>Đơn #{order.id}</h3>
                  <p>Tổng tiền: {Number(order.total_amount).toLocaleString("vi-VN")} đ</p>
                  <p>Thanh toán: {order.payment_status}</p>
                  <p>Trạng thái: {order.order_status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>Khách hàng này chưa có đơn hàng nào.</p>
          )}

          <Link to="/admin/users" className="gold-btn">
            Quay lại danh sách khách hàng
          </Link>
        </div>
      </main>
    </>
  );
}

export default AdminUserDetailPage;