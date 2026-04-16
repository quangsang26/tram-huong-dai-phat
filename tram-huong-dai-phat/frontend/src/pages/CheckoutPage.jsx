import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../services/api";
import { getCart, clearCart } from "../services/cart";

function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    customer_name: user?.full_name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    note: "",
    payment_method: "COD",
  });

  useEffect(() => {
    const currentCart = getCart();
    setCart(currentCart);

    if (currentCart.length === 0) {
      setMessage("Giỏ hàng đang trống, không thể thanh toán");
    }
  }, []);

  const invalidItems = useMemo(() => {
    return cart.filter(
      (item) => item.status === "hidden" || item.status === "out_of_stock"
    );
  }, [cart]);

  useEffect(() => {
    if (invalidItems.length > 0) {
      setMessage(
        "Giỏ hàng có sản phẩm hết hàng hoặc bị ẩn. Vui lòng quay lại giỏ hàng để xử lý."
      );
    }
  }, [invalidItems]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (cart.length === 0) {
      setMessage("Giỏ hàng đang trống");
      return;
    }

    if (invalidItems.length > 0) {
      setMessage("Không thể đặt hàng vì giỏ hàng có sản phẩm không hợp lệ.");
      return;
    }

    if (!formData.customer_name.trim()) {
      setMessage("Vui lòng nhập họ và tên");
      return;
    }

    if (!formData.phone.trim()) {
      setMessage("Vui lòng nhập số điện thoại");
      return;
    }

    if (!formData.address.trim()) {
      setMessage("Vui lòng nhập địa chỉ");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        user_id: user?.id || null,
        customer_name: formData.customer_name,
        phone: formData.phone,
        address: formData.address,
        note: formData.note,
        payment_method: formData.payment_method,
        items: cart.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      if (formData.payment_method === "MOMO") {
        const res = await api.post("/momo/create", payload);
        const payUrl = res.data.payUrl;

        if (!payUrl) {
          setMessage("Không tạo được link thanh toán MoMo");
          setLoading(false);
          return;
        }

        window.location.href = payUrl;
        return;
      }

      await api.post("/orders", payload);
      clearCart();
      setMessage("Đặt hàng thành công");

      setTimeout(() => {
        navigate("/orders");
      }, 1000);
    } catch (error) {
      console.error("Checkout error:", error);
      console.error("Response data:", error.response?.data);

      setMessage(
        error.response?.data?.message ||
          error.response?.data?.error?.message ||
          JSON.stringify(error.response?.data) ||
          "Đặt hàng thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="container section">
        <style>{`
          .checkout-layout-modern {
            display: grid;
            grid-template-columns: 1.45fr 0.95fr;
            gap: 30px;
            align-items: start;
          }

          .checkout-modern-card {
            background: #fff;
            border: 1px solid #eadfce;
            border-radius: 28px;
            box-shadow: 0 14px 36px rgba(46, 30, 10, 0.06);
            padding: 26px;
          }

          .checkout-modern-card input,
          .checkout-modern-card textarea {
            width: 100%;
            border: 1px solid #e6dccd;
            border-radius: 18px;
            padding: 16px 18px;
            font-size: 16px;
            outline: none;
            transition: all 0.2s ease;
            margin-bottom: 14px;
            background: #fff;
            color: #2b1d16;
            font-family: inherit;
          }

          .checkout-modern-card input:focus,
          .checkout-modern-card textarea:focus {
            border-color: #c89b3c;
            box-shadow: 0 0 0 4px rgba(200, 155, 60, 0.12);
          }

          .checkout-modern-card textarea {
            min-height: 96px;
            resize: vertical;
          }

          .payment-method-title {
            font-size: 15px;
            font-weight: 700;
            color: #7b5b28;
            margin: 6px 0 12px;
            letter-spacing: 0.3px;
          }

          .payment-methods-modern {
            display: flex;
            flex-direction: column;
            gap: 14px;
            margin-bottom: 18px;
          }

          .payment-method-card {
            width: 100%;
            border: 1.5px solid #e5dccf;
            background: #fff;
            border-radius: 20px;
            padding: 18px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            cursor: pointer;
            transition: all 0.25s ease;
            text-align: left;
          }

          .payment-method-card:hover {
            border-color: #c89b3c;
            box-shadow: 0 10px 24px rgba(40, 25, 10, 0.08);
            transform: translateY(-1px);
          }

          .payment-method-card.active {
            border-color: #c89b3c;
            background: #fffaf1;
            box-shadow: 0 12px 30px rgba(200, 155, 60, 0.16);
          }

          .payment-method-left {
            display: flex;
            align-items: center;
            gap: 14px;
            flex: 1;
          }

          .payment-radio {
            width: 22px;
            height: 22px;
            border: 2px solid #c89b3c;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .payment-radio span {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #c89b3c;
            display: block;
          }

          .payment-icon {
            width: 42px;
            height: 42px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 800;
            flex-shrink: 0;
          }

          .payment-icon.cod {
            background: #f6efe2;
            color: #9a6d1b;
          }

          .payment-icon.momo {
            background: linear-gradient(135deg, #ff4fa0 0%, #b0006d 100%);
            color: #fff;
          }

          .payment-content h4 {
            margin: 0 0 4px;
            font-size: 17px;
            font-weight: 700;
            color: #2d1f16;
          }

          .payment-content p {
            margin: 0;
            font-size: 14px;
            color: #7a6b5f;
            line-height: 1.5;
          }

          .payment-badge {
            min-width: 74px;
            text-align: center;
            padding: 8px 14px;
            border-radius: 999px;
            background: #f4efe7;
            color: #8b6b2f;
            font-weight: 700;
            font-size: 14px;
            flex-shrink: 0;
          }

          .payment-badge.momo {
            background: #fff0f6;
            color: #b0006d;
          }

          .checkout-submit-modern {
            width: 100%;
            height: 56px;
            border: none;
            border-radius: 999px;
            background: linear-gradient(135deg, #d8b061 0%, #b9862d 100%);
            color: #fff;
            font-size: 19px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 12px 28px rgba(185, 134, 45, 0.24);
            transition: all 0.2s ease;
          }

          .checkout-submit-modern:hover {
            transform: translateY(-1px);
            box-shadow: 0 16px 32px rgba(185, 134, 45, 0.3);
          }

          .checkout-submit-modern:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }

          .checkout-modern-message {
            margin-top: 14px;
            font-size: 15px;
            color: #b06d12;
            font-weight: 500;
          }

          .premium-summary-card {
            position: sticky;
            top: 110px;
          }

          @media (max-width: 992px) {
            .checkout-layout-modern {
              grid-template-columns: 1fr;
            }

            .premium-summary-card {
              position: static;
            }
          }

          @media (max-width: 768px) {
            .checkout-modern-card,
            .premium-summary-card {
              padding: 20px;
              border-radius: 22px;
            }

            .payment-method-card {
              padding: 16px;
            }

            .payment-content h4 {
              font-size: 16px;
            }

            .payment-content p {
              font-size: 13px;
            }
          }
        `}</style>

        <div className="page-heading">
          <p className="section-tag">Thanh toán</p>
          <h1>Xác nhận đơn hàng</h1>
        </div>

        <div className="checkout-layout checkout-layout-modern">
          <form
            className="auth-card checkout-card checkout-modern-card"
            onSubmit={handleSubmit}
          >
            <input
              type="text"
              name="customer_name"
              placeholder="Họ và tên"
              value={formData.customer_name}
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

            <textarea
              name="note"
              placeholder="Ghi chú"
              value={formData.note}
              onChange={handleChange}
            />

            <div className="payment-method-title">Phương thức thanh toán</div>

            <div className="payment-methods-modern">
              <button
                type="button"
                className={`payment-method-card ${
                  formData.payment_method === "COD" ? "active" : ""
                }`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    payment_method: "COD",
                  }))
                }
              >
                <div className="payment-method-left">
                  <div className="payment-radio">
                    {formData.payment_method === "COD" && <span />}
                  </div>

                  <div className="payment-icon cod">₫</div>

                  <div className="payment-content">
                    <h4>Thanh toán khi nhận hàng</h4>
                    <p>Thanh toán bằng tiền mặt khi đơn hàng được giao tới bạn.</p>
                  </div>
                </div>

                <div className="payment-badge">COD</div>
              </button>

              <button
                type="button"
                className={`payment-method-card ${
                  formData.payment_method === "MOMO" ? "active" : ""
                }`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    payment_method: "MOMO",
                  }))
                }
              >
                <div className="payment-method-left">
                  <div className="payment-radio">
                    {formData.payment_method === "MOMO" && <span />}
                  </div>

                  <div className="payment-icon momo">M</div>

                  <div className="payment-content">
                    <h4>Thanh toán bằng MoMo test</h4>
                    <p>Chuyển sang ví MoMo để hoàn tất thanh toán nhanh chóng và an toàn.</p>
                  </div>
                </div>

                <div className="payment-badge momo">MoMo</div>
              </button>
            </div>

            <button
              type="submit"
              className="gold-btn auth-submit-btn checkout-submit-modern"
              disabled={loading || cart.length === 0 || invalidItems.length > 0}
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </button>

            {message && <p className="auth-message checkout-modern-message">{message}</p>}
          </form>

          <div className="premium-summary-card">
            <p className="section-tag">Đơn hàng</p>
            <h2>Tóm tắt thanh toán</h2>

            {invalidItems.length > 0 && (
              <div className="warning-box" style={{ marginBottom: "14px" }}>
                Có sản phẩm không hợp lệ trong giỏ hàng.{" "}
                <Link to="/cart">Quay lại giỏ hàng</Link>
              </div>
            )}

            <div className="checkout-items">
              {cart.map((item) => (
                <div key={item.id} className="checkout-item-row">
                  <span>{item.name}</span>
                  <strong>
                    {item.quantity} × {Number(item.price).toLocaleString("vi-VN")} đ
                  </strong>
                </div>
              ))}
            </div>

            <div className="summary-line">
              <span>Tổng cộng</span>
              <strong>{total.toLocaleString("vi-VN")} đ</strong>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default CheckoutPage;