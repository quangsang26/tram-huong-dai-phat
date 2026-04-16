import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";

function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (error) {
        setMessage(error.response?.data?.message || "Không thể tải chi tiết đơn hàng");
      }
    };

    fetchOrder();
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

  if (!order) {
    return (
      <>
        <Header />
        <main className="container section">
          <p>Đang tải chi tiết đơn hàng...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container section">
        <div className="order-detail-card premium-detail-card">
          <div className="page-heading" style={{ marginBottom: "20px" }}>
            <p className="section-tag">Chi tiết</p>
            <h1>Đơn hàng #{order.id}</h1>
          </div>

          <div className="order-detail-grid">
            <div>
              <p><strong>Người nhận:</strong> {order.customer_name}</p>
              <p><strong>Số điện thoại:</strong> {order.phone}</p>
              <p><strong>Địa chỉ:</strong> {order.address}</p>
              <p><strong>Ghi chú:</strong> {order.note || "Không có"}</p>
            </div>

            <div>
              <p><strong>Trạng thái đơn:</strong> {order.order_status}</p>
              <p><strong>Thanh toán:</strong> {order.payment_status}</p>
              <p><strong>Phương thức:</strong> {order.payment_method}</p>
              <p>
                <strong>Tổng tiền:</strong>{" "}
                {Number(order.total_amount).toLocaleString("vi-VN")} đ
              </p>
            </div>
          </div>

          <h2>Sản phẩm trong đơn</h2>

          <div className="order-items">
            {order.items.map((item) => (
              <div key={item.id} className="order-item-row premium-order-item">
                <div>
                  <strong>{item.product_name}</strong>
                </div>
                <div>Số lượng: {item.quantity}</div>
                <div>Giá: {Number(item.price).toLocaleString("vi-VN")} đ</div>
              </div>
            ))}
          </div>

          <Link to="/orders" className="gold-btn">
            Quay lại đơn hàng của tôi
          </Link>
        </div>
      </main>
    </>
  );
}

export default OrderDetailPage;