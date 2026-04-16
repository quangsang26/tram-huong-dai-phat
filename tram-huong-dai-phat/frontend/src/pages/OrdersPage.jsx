import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";

function OrdersPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setMessage("Bạn cần đăng nhập để xem đơn hàng");
        return;
      }

      try {
        const res = await api.get(`/orders/user/${user.id}`);
        setOrders(res.data.data || []);
      } catch (error) {
        setMessage(error.response?.data?.message || "Không thể tải đơn hàng");
      }
    };

    fetchOrders();
  }, [user?.id]);

  return (
    <>
      <Header />
      <main className="container section">
        <div className="page-heading">
          <p className="section-tag">Đơn hàng</p>
          <h1>Đơn hàng của tôi</h1>
        </div>

        {message && <p className="auth-message">{message}</p>}

        {orders.length === 0 ? (
          <div className="empty-state-card">
            <h3>Bạn chưa có đơn hàng nào</h3>
            <p>Hãy chọn sản phẩm yêu thích và bắt đầu trải nghiệm mua sắm.</p>
            <Link to="/" className="gold-btn">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card premium-order-card">
                <div className="order-top">
                  <div>
                    <h3>Đơn #{order.id}</h3>
                    <p>Người nhận: {order.customer_name}</p>
                    <p>SĐT: {order.phone}</p>
                  </div>

                  <div className="order-meta">
                    <p>Trạng thái: {order.order_status}</p>
                    <p>Thanh toán: {order.payment_status}</p>
                    <p>
                      Tổng tiền: {Number(order.total_amount).toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </div>

                <Link to={`/orders/${order.id}`} className="gold-btn">
                  Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default OrdersPage;