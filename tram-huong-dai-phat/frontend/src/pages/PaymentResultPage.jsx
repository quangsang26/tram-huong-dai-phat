import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { clearCart } from "../services/cart";
import api from "../services/api";

function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("Đang kiểm tra kết quả thanh toán...");
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get("orderId");
  const resultCode = searchParams.get("resultCode");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (!orderId) {
          setMessage("Không tìm thấy mã đơn hàng");
          setLoading(false);
          return;
        }

        console.log("payment-result orderId =", orderId);
        console.log("payment-result resultCode =", resultCode);

        if (resultCode === "0") {
          clearCart();

          const confirmRes = await api.post("/momo/confirm-return", {
            orderId,
            resultCode,
          });

          console.log("confirm-return response =", confirmRes.data);
        }

        const res = await api.get(`/orders/${orderId}`);
        const orderData = res.data.data;
        setOrder(orderData);

        if (orderData.payment_status === "paid") {
          setMessage("Thanh toán MoMo thành công");
        } else if (orderData.payment_status === "failed") {
          setMessage("Thanh toán MoMo thất bại");
        } else {
          setMessage("Đơn hàng đã tạo, đang chờ MoMo xác nhận");
        }
      } catch (error) {
        console.error("PaymentResultPage error:", error);
        console.error("PaymentResultPage response:", error.response?.data);
        setMessage("Không thể kiểm tra kết quả thanh toán");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, resultCode]);

  return (
    <>
      <Header />
      <main className="container section">
        <div className="auth-card" style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h1>Kết quả thanh toán</h1>
          <p>{message}</p>

          {loading && <p>Đang tải...</p>}

          {order && (
            <div style={{ marginTop: "16px", lineHeight: "1.9" }}>
              <p><strong>Mã đơn:</strong> #{order.id}</p>
              <p><strong>Phương thức:</strong> {order.payment_method}</p>
              <p><strong>Trạng thái thanh toán:</strong> {order.payment_status}</p>
              <p><strong>Trạng thái đơn hàng:</strong> {order.order_status}</p>
              <p>
                <strong>Tổng tiền:</strong>{" "}
                {Number(order.total_amount).toLocaleString("vi-VN")} đ
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
            <Link to="/orders" className="gold-btn">
              Xem đơn hàng của tôi
            </Link>
            <Link to="/" className="gold-btn">
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default PaymentResultPage;